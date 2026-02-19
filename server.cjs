const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const nodemailer = require("nodemailer"); 
const path = require('path');

const Questao = require('./models/Questao.cjs');
const Aluno = require('./models/Aluno.cjs');
const Material = require('./models/Material.cjs');
const LinkUtil = require('./models/LinkUtil.cjs');

require('dotenv').config();

const app = express();

// --- CONFIGURAÇÃO ---
app.use(cors());
app.use(express.json());

// --- CONEXÃO COM O BANCO ---
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:missaok13@devfisicagame.qypfne3.mongodb.net/?appName=DevfisicaGame";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ CONECTADO AO MONGODB!"))
  .catch((erro) => console.error("❌ ERRO NO BANCO:", erro));

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

// Rota para buscar questões de treino filtradas
// --- ROTA 1: BUSCAR QUESTÕES (FILTRANDO AS JÁ FEITAS) ---
app.post('/treino/buscar', async (req, res) => {
  const { area, dificuldade, email } = req.body; 

  try {
     const usuario = await Aluno.findOne({ email });
    
    // Converte os IDs salvos (String) para ObjectId do Mongo
    // O filtro $nin precisa comparar ObjectId com ObjectId
    let idsJaFeitos = [];
    if (usuario && usuario.questoesRealizadas && usuario.questoesRealizadas.length > 0) {
      idsJaFeitos = usuario.questoesRealizadas.map(id => new mongoose.Types.ObjectId(id));
    }

    const questoes = await Questao.aggregate([
      { 
        $match: { 
          area: area, 
          dificuldade: dificuldade,
          _id: { $nin: idsJaFeitos } // <--- O PULO DO GATO
        } 
      },
      { $sample: { size: 5 } } 
    ]);
    res.json(questoes);

  } catch (error) {
    console.error("❌ Erro na busca:", error);
    res.status(500).json({ erro: "Erro no servidor" });
  }
});

app.post('/treino/responder', async (req, res) => {
  // Recebemos o 'primeiraTentativa' do frontend
  const { email, questaoId, respostaDoAluno, primeiraTentativa } = req.body;

  try {
    const questao = await Questao.findById(questaoId);
    const usuario = await Aluno.findOne({ email });

    if (!questao || !usuario) {
      return res.status(404).json({ erro: "Dados não encontrados" });
    }

    const acertou = questao.respostaCorreta === respostaDoAluno;

 if (acertou) {
      // --- CORREÇÃO DE SEGURANÇA ---
      // Se o usuário for antigo e não tiver a lista ainda, criamos ela agora:
      if (!usuario.questoesRealizadas) {
        usuario.questoesRealizadas = [];
      }

      // 1. VERIFICA SE JÁ FEZ ANTES
      if (usuario.questoesRealizadas.includes(questaoId)) {
        return res.json({ 
          resultado: "acertou", 
          xpGanho: 0,
          mensagem: "Você já completou essa questão antes! (0 XP)" 
        });
      }

      // 2. CALCULA O XP DA RODADA
      // Se for primeira tentativa: XP cheio. Se não: 0.
      const pontosParaDar = primeiraTentativa ? questao.xp : 0;

      // 3. ATUALIZA O USUÁRIO
      usuario.pontos += pontosParaDar;
      usuario.pontosRanking += pontosParaDar; // Opcional: se quiser separar ranking de saldo
      
      // IMPORTANTE: Marcamos como realizada MESMO SE FOR 0 PONTOS.
      // Isso impede que ele dê F5 na página para tentar "de primeira" de novo.
      usuario.questoesRealizadas.push(questaoId);
      
      await usuario.save();

      // 4. MENSAGEM PERSONALIZADA
      const msg = pontosParaDar > 0 
        ? `Boa! +${pontosParaDar} XP` 
        : `Correto! Mas como não foi de primeira, +0 XP.`;

      res.json({ 
        resultado: "acertou", 
        xpGanho: pontosParaDar,
        mensagem: msg
      });

    } else {
      // Se errou
      res.json({ 
        resultado: "errou", 
        // Não mandamos a resposta certa ainda, deixamos ele tentar de novo
        mensagem: "Errou!" 
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao processar");
  }
});

// ==========================================
//  ROTAS DE MATERIAIS DE AULA
// ==========================================

// 1. LISTAR MATERIAIS
app.get('/materiais', async (req, res) => {
  try {
    // Busca todos, ordenados do mais novo para o mais antigo (-1)
    const materiais = await Material.find().sort({ dataPostagem: -1 });
    res.json(materiais);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar materiais" });
  }
});

// 2. ADICIONAR MATERIAL (ADMIN)
// (Usaremos isso via Postman ou Script por enquanto)
app.post('/materiais', async (req, res) => {
  try {
    const novoMaterial = new Material(req.body);
    await novoMaterial.save();
    res.json({ message: "Material postado com sucesso!", material: novoMaterial });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar material" });
  }
});

// ==========================================
//  ROTAS DE LINKS ÚTEIS
// ==========================================

app.get('/links', async (req, res) => {
  try {
    // Busca e ordena por categoria
    const links = await LinkUtil.find().sort({ categoria: 1, titulo: 1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar links" });
  }
});

// (Opcional - para cadastro futuro via postman/admin)
app.post('/links', async (req, res) => {
  try {
    const novoLink = new LinkUtil(req.body);
    await novoLink.save();
    res.json(novoLink);
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar link" });
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