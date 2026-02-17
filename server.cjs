const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const nodemailer = require("nodemailer"); 
const path = require('path');
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
//  DEFINIÇÃO DO MODELO
// ==========================================
const AlunoSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  nome: String,
  serie: String,
  inventario: [String],
  desafiosConcluidos: { type: [Number], default: [] },
  avatarConfig: Object,
  pontos: { type: Number, default: 0 },
  pontosRanking: { type: Number, default: 0 },
});

const Aluno = mongoose.model("Aluno", AlunoSchema);

// --- CÓDIGOS TEMPORÁRIOS ---
const codigosTemporarios = {};

// --- CONFIGURAÇÃO DE E-MAIL (GMAIL) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Pega do Heroku/Arquivo .env
    pass: process.env.EMAIL_PASS  // Pega do Heroku/Arquivo .env
  }
});

// ==========================================
//                ROTAS
// ==========================================

// 2. SOLICITAR CÓDIGO (COM ENVIO DE E-MAIL REAL)
app.post("/auth/solicitar-codigo", async (req, res) => {
  const { email } = req.body;

  // Validação do domínio (opcional, remova se quiser liberar geral)
  if (!email || !email.endsWith("@enova.educacao.ba.gov.br")) {
    return res.status(400).json({ message: "É necessário usar um e-mail institucional (@enova.educacao.ba.gov.br)" });
  }

  try {
    // Verifica se já existe (Se for só para CADASTRO, mantém isso. 
    // Se quiser usar para LOGIN também, remova este bloco if)
    const alunoExistente = await Aluno.findOne({ email });
    if (alunoExistente) {
      return res.status(400).json({ message: "Este e-mail já possui cadastro. Faça login." });
    }

    // Gera o código
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    codigosTemporarios[email] = codigo;

    // --- LÓGICA DE ENVIO DE E-MAIL ---
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Seu Código de Verificação - Ciência GO',
      text: `Olá! Seu código de cadastro é: ${codigo}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Erro ao enviar e-mail:", error);
        // Opcional: Se der erro no email, remove o código gerado para não travar
        delete codigosTemporarios[email]; 
        return res.status(500).json({ message: "Erro ao enviar e-mail. Verifique se o endereço está correto." });
      } else {
        console.log('E-mail enviado: ' + info.response);
        res.json({ message: "Código enviado para o seu e-mail!" });
      }
    });
    // ----------------------------------

  } catch (error) {
    console.error(error);
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
        desafiosConcluidos: aluno.desafiosConcluidos || []
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

  console.log(`>>> Salvando: Email=${email} | Pontos=${pontos} | ID=${desafioId}`);

  try {
    const aluno = await Aluno.findOneAndUpdate(
      { email: email },
      { 
        $inc: { pontos: pontos, pontosRanking: pontos },
        $addToSet: { desafiosConcluidos: desafioId }
      },
      { new: true }
    );

    if (aluno) {
      res.json({ novoSaldo: aluno.pontos, message: "Pontos computados!" });
    } else {
      res.status(404).json({ message: "Aluno não encontrado" });
    }
  } catch (error) {
    console.error("Erro ao dar pontos:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// ROTAS DE RANKING
app.get("/ranking/:serie", async (req, res) => {
  try {
    const topAlunos = await Aluno.find({ serie: req.params.serie })
      .sort({ pontosRanking: -1 })
      .limit(10)
      .select("nome avatarConfig pontosRanking");
    
    res.json(topAlunos);
  } catch (error) { res.status(500).send("Erro"); }
});

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

// 9. ADMIN DELETE
app.get("/admin/resetar/:email", async (req, res) => {
  const { email } = req.params;
  await Aluno.deleteOne({ email });
  res.send(`Usuário ${email} apagado.`);
});

// ==========================================
//  SERVIR O FRONTEND (REACT)
// ==========================================

// Serve arquivos estáticos da pasta dist
app.use(express.static(path.join(__dirname, "dist")));

// Regex para capturar qualquer rota e mandar para o React
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ==========================================
//  INICIALIZAÇÃO ÚNICA (CORRIGIDA)
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});