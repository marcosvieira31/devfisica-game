const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const nodemailer = require("nodemailer"); 
require('dotenv').config();

const app = express();

// --- CONFIGURAÇÃO ---
app.use(cors());
app.use(express.json());

// --- CONEXÃO COM O BANCO ---
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/fisica-game";

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ CONECTADO AO MONGODB!"))
  .catch((erro) => console.error("❌ ERRO NO BANCO:", erro));

// ==========================================
//  DEFINIÇÃO DO MODELO (MOVIDO PARA O TOPO)
// ==========================================
const AlunoSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  nome: String,
  serie: String,
  inventario: [String],
  desafiosConcluidos: { type: [Number], default: [] }, // <--- NOVO CAMPO: Lista de IDs
  avatarConfig: Object,
  pontos: { type: Number, default: 0 }, // Moeda para gastar
  pontosRanking: { type: Number, default: 0 }, // XP para o Ranking
});

const Aluno = mongoose.model("Aluno", AlunoSchema);

// --- CÓDIGOS TEMPORÁRIOS ---
const codigosTemporarios = {};

// --- CONFIGURAÇÃO DE E-MAIL ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'seu_email_real@gmail.com', 
    pass: 'sua_senha_de_app'          
  }
});

// ==========================================
//                 ROTAS
// ==========================================

// 1. ROTA DE TESTE
app.get('/', (req, res) => {
  res.send('Servidor do Física Game está ON! 🚀');
});

// 2. SOLICITAR CÓDIGO
app.post("/auth/solicitar-codigo", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.endsWith("@enova.educacao.ba.gov.br")) {
    return res.status(400).json({ message: "É necessário usar um e-mail institucional (@enova.educacao.ba.gov.br)" });
  }

  try {
    const alunoExistente = await Aluno.findOne({ email });
    if (alunoExistente) {
      return res.status(400).json({ message: "Este e-mail já possui cadastro. Faça login." });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    codigosTemporarios[email] = codigo;

    console.log(`\n🔑 CÓDIGO PARA ${email}: ${codigo}\n`);
    res.json({ message: "Código enviado!" });

  } catch (error) {
    res.status(500).json({ message: "Erro interno." });
  }
});

// 3. VALIDAR CADASTRO
app.post("/auth/validar-cadastro", async (req, res) => {
  const { email, codigo, nome, serie } = req.body;

  if (codigosTemporarios[email] !== codigo) {
    return res.status(400).json({ message: "Código inválido!" });
  }

  try {
    const novoAluno = new Aluno({
      email,
      nome,
      serie,
      pontos: 0, 
      inventario: [],
      avatarConfig: {} 
    });

    await novoAluno.save();
    delete codigosTemporarios[email];

    res.json({ message: "Cadastro realizado!", aluno: novoAluno });
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar conta." });
  }
});

// 4. LOGIN
app.post("/login", async (req, res) => {
  const { email } = req.body;
  const aluno = await Aluno.findOne({ email });
  
  if (aluno) {
    res.json({ success: true, email: aluno.email });
  } else {
    res.status(404).json({ success: false, message: "Aluno não encontrado." });
  }
});

// 5. CARREGAR DADOS
app.get("/carregar-avatar/:email", async (req, res) => {
  try {
    const aluno = await Aluno.findOne({ email: req.params.email });
    if (aluno) {
      res.send({
        nome: aluno.nome,
        serie: aluno.serie,
        avatar: aluno.avatarConfig,
        pontos: aluno.pontos,
        inventario: aluno.inventario,
        desafiosConcluidos: aluno.desafiosConcluidos || [] // <--- ENVIA A LISTA
      });
    } else {
      res.status(404).send("Aluno não encontrado");
    }
  } catch (error) { res.status(500).send("Erro"); }
});

// 6. SALVAR AVATAR
app.post("/salvar-avatar", async (req, res) => {
  const { email, avatarConfig } = req.body;

  try {
    const aluno = await Aluno.findOne({ email });
    if (!aluno) return res.status(404).json({ message: "Aluno não encontrado" });

    aluno.avatarConfig = avatarConfig;
    await aluno.save();

    res.json({ message: "Avatar salvo!", avatar: aluno.avatarConfig });
  } catch (error) {
    res.status(500).json({ message: "Erro ao salvar." });
  }
});

// 7. GANHAR PONTOS
app.post('/ganhar-pontos', async (req, res) => {
  const { email, pontos, desafioId } = req.body;

  // Debug para você ver no terminal se o ID está chegando
  console.log(`>>> Salvando: Email=${email} | Pontos=${pontos} | ID=${desafioId}`);

  try {
    const aluno = await Aluno.findOneAndUpdate(
      { email: email },
      { 
        $inc: { pontos: pontos, pontosRanking: pontos }, // Soma os pontos
        $addToSet: { desafiosConcluidos: desafioId } // Adiciona o ID na lista (se já não estiver lá)
      },
      { new: true } // Retorna o aluno já atualizado para conferência
    );

    if (aluno) {
      console.log("✅ Sucesso! Lista de concluídos:", aluno.desafiosConcluidos);
      res.json({ novoSaldo: aluno.pontos, message: "Pontos computados!" });
    } else {
      res.status(404).json({ message: "Aluno não encontrado" });
    }
    res.send("Pontos adicionados!");
  } catch (error) {
    console.error("Erro ao dar pontos:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

app.get("/ranking/:serie", async (req, res) => {
  try {
    const topAlunos = await Aluno.find({ serie: req.params.serie })
      .sort({ pontosRanking: -1 }) // Ordena do maior para o menor
      .limit(10) // Pega só os top 10 (opcional)
      .select("nome avatarConfig pontosRanking"); // Só devolve o necessário
    
    res.json(topAlunos);
  } catch (error) { res.status(500).send("Erro"); }
});

// 4. Nova Rota: Resetar Ranking (Para você usar como Admin)
// Dica: Proteja essa rota ou use um segredo no futuro
app.post("/admin/resetar-ranking", async (req, res) => {
  try {
    await Aluno.updateMany({}, { pontosRanking: 0 });
    res.send("Ranking resetado com sucesso!");
  } catch (error) { res.status(500).send("Erro"); }
});

// 8. COMPRAR ITEM
app.post('/comprar-item', async (req, res) => {
  const { email, itemId, preco } = req.body;

  try {
    const aluno = await Aluno.findOne({ email });
    if (!aluno) return res.status(404).json({ message: "Aluno não encontrado" });

    if (aluno.inventario.includes(itemId)) return res.status(400).json({ message: "Item já adquirido!" });
    if (aluno.pontos < preco) return res.status(400).json({ message: "Saldo insuficiente!" });

    aluno.pontos -= preco;
    aluno.inventario.push(itemId);
    
    await aluno.save();

    res.json({ 
      novoSaldo: aluno.pontos, 
      inventario: aluno.inventario,
      message: "Compra realizada!" 
    });

  } catch (error) {
    res.status(500).json({ error: "Erro na compra" });
  }
});

// 9. ADMIN RESET
app.get("/admin/resetar/:email", async (req, res) => {
  const { email } = req.params;
  await Aluno.deleteOne({ email });
  res.send(`Usuário ${email} apagado.`);
});

// Serve os arquivos estáticos da pasta de build do React
app.use(express.static(path.join(__dirname, "dist"))); // Se usar Vite é "dist", se usar CRA é "build"

// Qualquer outra rota que não seja API, manda pro React resolver
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Importante: Use a porta que o Azure mandar ou a 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

// --- INICIAR ---
app.listen(3000, () => {
  console.log("🚀 Servidor rodando na porta 3000");
});