const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const nodemailer = require("nodemailer"); 
const path = require('path');

const Questao = require('./models/Questao.cjs');
const Aluno = require('./models/Aluno.cjs');
const Material = require('./models/Material.cjs');
const LinkUtil = require('./models/LinkUtil.cjs');
const Mural = require('./models/Mural.cjs');
const Noticia = require('./models/Noticia.cjs');
const Desafio = require('./models/Desafio.cjs');

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

// ==========================================
//  ROTAS DO PAINEL ADMIN (PROFESSOR)
// ==========================================

// 1. Salvar Nova Questão
app.post('/admin/questoes', async (req, res) => {
  try {
    const novaQuestao = new Questao(req.body);
    await novaQuestao.save();
    res.json({ message: "Questão salva com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar questão." });
  }
});

// 2. Salvar Novo Material
app.post('/admin/materiais', async (req, res) => {
  try {
    const novoMaterial = new Material(req.body);
    await novoMaterial.save();
    res.json({ message: "Material salvo com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar material." });
  }
});

// 3. Salvar Novo Link Útil
app.post('/admin/links', async (req, res) => {
  try {
    const novoLink = new LinkUtil(req.body);
    await novoLink.save();
    res.json({ message: "Link salvo com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar link." });
  }
});

// BUSCAR MURAL (Para exibir para os alunos)
app.get('/mural', async (req, res) => {
  try {
    // Busca todos os avisos, ordenados do mais recente para o mais antigo
    const avisos = await Mural.find().sort({ dataCriacao: -1 });
    res.json(avisos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar o mural." });
  }
});

// Salvar Mural
app.post('/admin/mural', async (req, res) => {
  try {
    const novoAviso = new Mural(req.body);
    await novoAviso.save();
    res.json({ message: "Aviso do Mural salvo!" });
  } catch (error) { res.status(500).json({ error: "Erro ao salvar mural" }); }
});

// Salvar Notícia
app.post('/admin/noticias', async (req, res) => {
  try {
    const novaNoticia = new Noticia(req.body);
    await novaNoticia.save();
    res.json({ message: "Notícia publicada!" });
  } catch (error) { res.status(500).json({ error: "Erro ao salvar notícia" }); }
});

// BUSCAR NOTÍCIAS (Para o feed dos alunos)
app.get('/noticias', async (req, res) => {
  try {
    // Busca todas e ordena da mais nova para a mais antiga (-1)
    const noticias = await Noticia.find().sort({ dataPublicacao: -1 });
    res.json(noticias);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar notícias." });
  }
});

// Salvar Desafio
// Salvar Desafio e Enviar E-mail
app.post('/admin/desafios', async (req, res) => {
  try {
    const novoDesafio = new Desafio(req.body);
    await novoDesafio.save();

    // --- NOVA LÓGICA DE E-MAIL ---
    // 1. Busca todos os alunos que são daquela série específica
    const Aluno = require('./models/Aluno.cjs'); // Garanta que importou o modelo
    const alunosDaSerie = await Aluno.find({ serie: req.body.serie });
    
    // 2. Extrai apenas os e-mails e remove vazios
    const emails = alunosDaSerie.map(a => a.email).filter(e => e);

    if (emails.length > 0) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails, // Envia para a lista de alunos daquela série
        subject: '🚀 Novo Desafio de Física Lançado!',
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f9f9f9; border-radius: 10px;">
            <h2 style="color: #2c3e50;">Atenção, turma da Física! 👨‍🏫</h2>
            <p>Um novo desafio acabou de ser lançado na plataforma valendo <strong><span style="color: #9b59b6; font-size: 1.2rem;">${req.body.pontos} J</span></strong>!</p>
            <p>Corram lá para responder antes que se esqueçam da matéria.</p>
            <a href="https://devfisica-game-dd2c50336e47.herokuapp.com" style="background: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 15px;">Acessar a Plataforma</a>
          </div>
        `
      };

      // 3. Dispara o e-mail em segundo plano
      transporter.sendMail(mailOptions).catch(err => console.error("Erro ao enviar email:", err));
    }
    // -----------------------------

    res.json({ message: "Desafio salvo e e-mails enviados com sucesso!" });
  } catch (error) { 
    res.status(500).json({ error: "Erro ao salvar desafio" }); 
  }
});

// BUSCAR DESAFIOS OFICIAIS (Para os alunos)
app.get('/desafios', async (req, res) => {
  try {
    const desafios = await Desafio.find();
    res.json(desafios);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar desafios." });
  }
});

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

// --- LÓGICA DE ENVIO DE E-MAIL (CÓDIGO DE VERIFICAÇÃO) ---
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🔑 Seu Código de Verificação - Ciência GO',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background: #f4f7f6; border-radius: 10px; max-width: 500px; margin: 0 auto; border-top: 5px solid #3498db;">
          <h2 style="color: #2c3e50; margin-top: 0;">Falta muito pouco! 🚀</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Recebemos uma solicitação de cadastro para o <strong>Ciência GO</strong> com este e-mail. Para validar sua conta, use o código abaixo:
          </p>
          
          <div style="margin: 30px auto; padding: 15px 30px; background: #ffffff; border: 2px dashed #3498db; border-radius: 8px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #2c3e50; letter-spacing: 5px;">${codigo}</span>
          </div>

          <p style="color: #7f8c8d; font-size: 14px;">
            Copie o código de 6 dígitos e cole na tela de cadastro da plataforma.
          </p>
          <p style="font-size: 12px; color: #bdc3c7; margin-top: 30px;">
            Se você não solicitou este código, fique tranquilo, basta ignorar este e-mail.
          </p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Erro ao enviar e-mail:", error);
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
      avatarConfig: {sex: "man",
        faceColor: "#F9C9B6",
        eyebrowStyle: "up",
        earSize: "small",
        eyeStyle: "circle",
        noseStyle: "round",
        mouthStyle: "smile",
        shirtStyle: "short",
        glassesStyle: "none",
        hairStyle: "normal",
        hatStyle: "none",
        hatColor: "#000",
        hairColor: "#000",
        shirtColor: "#3498db",
        bgColor: "#e2e2e2",
        shape: "rounded"} 
    });

    await novoAluno.save();
    delete codigosTemporarios[email]; // Limpa o código usado

    // ==========================================
    // DISPARO DO E-MAIL DE BOAS-VINDAS
    // ==========================================
    // Pegando apenas o primeiro nome do aluno para o e-mail ficar mais amigável
    const primeiroNome = nome ? nome.split(' ')[0] : 'Estudante';

    const mailOptionsBoasVindas = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎉 Bem-vindo(a) ao Ciência GO! Sua jornada começou.',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background: #f9f9f9; border-radius: 10px; max-width: 600px; margin: 0 auto; border-top: 5px solid #27ae60;">
          
          <h1 style="color: #2c3e50; margin-bottom: 5px;">Olá, ${primeiroNome}! 🧬</h1>
          <h3 style="color: #7f8c8d; margin-top: 0;">Sua conta foi verificada com sucesso.</h3>
          
          <p style="color: #555; line-height: 1.6; font-size: 16px; margin-top: 20px;">
            A partir de agora, o seu jeito de aprender vai subir de nível! No <strong>Ciência GO</strong>, o seu esforço nos estudos se transforma em recompensas reais.
          </p>

          <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h4 style="color: #2c3e50; margin-top: 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">Como funciona?</h4>
            <ul style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>⚔️ <strong>Desafios:</strong> Cumpra missões diárias e semanais feitas especialmente para a <strong>${serie}</strong>.</li>
              <li>⚡ <strong>Pontos de Energia:</strong> Acumule pontos a cada acerto.</li>
              <li>👕 <strong>Seu Avatar:</strong> Use seus pontos na Loja para comprar itens novos e montar o avatar perfeito.</li>
              <li>🏆 <strong>Ranking:</strong> Mostre que você domina a matéria e suba no quadro de líderes da escola!</li>
            </ul>
          </div>

          <p style="color: #555; font-size: 16px;">
            A plataforma já está liberada para você. Entre agora e veja as missões que estão aguardando!
          </p>

          <a href="https://devfisica-game-dd2c50336e47.herokuapp.com" style="background: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 15px; font-size: 16px;">
            Acessar Plataforma 🎮
          </a>
        </div>
      `
    };

    // Envia o e-mail de boas-vindas silenciosamente (não trava a resposta para o usuário)
    transporter.sendMail(mailOptionsBoasVindas, (err) => {
      if (err) console.error("Erro ao enviar e-mail de boas-vindas:", err);
      else console.log("E-mail de boas-vindas enviado para:", email);
    });
    // ==========================================

    res.json({ message: "Cadastro realizado!", aluno: novoAluno });
  } catch (error) {
    console.error(error);
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
// ==========================================
// ROTA: GANHAR PONTOS (E SALVAR DESAFIO)
// ==========================================
app.post('/ganhar-pontos', async (req, res) => {
  try {
    const { email, pontos, desafioId } = req.body;

    // 1. Acha o aluno no banco
    const aluno = await Aluno.findOne({ email });
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado." });

    // 2. Soma os pontos (garantindo que é número e não texto)
    aluno.pontos = (aluno.pontos || 0) + Number(pontos);

    // 3. Salva que ele já fez esse desafio (para não repetir)
    if (!aluno.desafiosConcluidos) aluno.desafiosConcluidos = [];
    
    if (desafioId && !aluno.desafiosConcluidos.includes(desafioId)) {
      aluno.desafiosConcluidos.push(desafioId);
    }

    // 4. Salva no banco de dados online
    await aluno.save();
    res.json({ message: "Pontos salvos com sucesso!", novoSaldo: aluno.pontos });
    
  } catch (error) {
    console.error("Erro na rota /ganhar-pontos:", error);
    res.status(500).json({ error: "Erro interno ao salvar pontos." });
  }
});

// REGISTRAR QUE O ALUNO ERROU O DESAFIO PELA PRIMEIRA VEZ
app.post('/registrar-erro', async (req, res) => {
  try {
    const { email, desafioId } = req.body;
    const aluno = await Aluno.findOne({ email });
    
    if (aluno) {
      if (!aluno.desafiosComErro) aluno.desafiosComErro = [];
      
      // Se ele ainda não tava na lista de erros, adiciona e salva
      if (!aluno.desafiosComErro.includes(desafioId)) {
        aluno.desafiosComErro.push(desafioId);
        await aluno.save();
      }
      res.json({ message: "Erro registrado com sucesso na ficha do aluno." });
    }
  } catch (error) {
    res.status(500).json({ error: "Falha ao registrar erro." });
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
  const { disciplina, area, dificuldade, email } = req.body; 

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
          disciplina: disciplina, // <--- NOVA LINHA ADICIONADA AQUI
          area: area, 
          dificuldade: dificuldade,
          _id: { $nin: idsJaFeitos } // <--- O PULO DO GATO CONTINUA AQUI
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