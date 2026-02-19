// seedQuestoes.js
require('dotenv').config(); // Carrega as variáveis de ambiente
const mongoose = require('mongoose');
const Questao = require('./models/Questao.cjs'); // Certifique-se que o caminho está certo

// --- CONEXÃO COM O BANCO ---
// Usa a mesma string de conexão do seu .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB para semear questões!'))
  .catch(err => console.error('❌ Erro na conexão:', err));

// --- LISTA DE QUESTÕES (MECÂNICA E TERMODINÂMICA) ---
const questoesIniciais = [
  {
    enunciado: "Um carro percorre uma estrada retilínea com velocidade constante de 20 m/s. Quanto tempo ele levará para percorrer 100 metros?",
    area: "Mecânica",
    dificuldade: "Fácil",
    xp: 10,
    alternativas: [
      { id: "a", texto: "2 segundos" },
      { id: "b", texto: "4 segundos" },
      { id: "c", texto: "5 segundos" },
      { id: "d", texto: "10 segundos" }
    ],
    respostaCorreta: "c"
  },
  {
    enunciado: "Qual das Leis de Newton afirma que 'Para toda ação há uma reação de mesma intensidade, mesma direção e sentido oposto'?",
    area: "Mecânica",
    dificuldade: "Fácil",
    xp: 10,
    alternativas: [
      { id: "a", texto: "1ª Lei (Inércia)" },
      { id: "b", texto: "2ª Lei (Princípio Fundamental)" },
      { id: "c", texto: "3ª Lei (Ação e Reação)" },
      { id: "d", texto: "Lei da Gravitação Universal" }
    ],
    respostaCorreta: "c"
  },
  {
    enunciado: "Um bloco de 2 kg é acelerado a 3 m/s² por uma força resultante constante. Qual é a magnitude dessa força?",
    area: "Mecânica",
    dificuldade: "Médio",
    xp: 20,
    alternativas: [
      { id: "a", texto: "1,5 N" },
      { id: "b", texto: "5 N" },
      { id: "c", texto: "6 N" },
      { id: "d", texto: "12 N" }
    ],
    respostaCorreta: "c"
  },
  {
    enunciado: "Em uma transformação isobárica (pressão constante), se a temperatura de um gás ideal aumenta, o que acontece com seu volume?",
    area: "Termodinâmica",
    dificuldade: "Médio",
    xp: 20,
    alternativas: [
      { id: "a", texto: "O volume diminui." },
      { id: "b", texto: "O volume aumenta." },
      { id: "c", texto: "O volume permanece constante." },
      { id: "d", texto: "O volume torna-se nulo." }
    ],
    respostaCorreta: "b"
  },
  {
    enunciado: "Uma máquina térmica opera entre duas fontes de temperatura (quente e fria). Segundo a 2ª Lei da Termodinâmica, é impossível que essa máquina:",
    area: "Termodinâmica",
    dificuldade: "Difícil",
    xp: 30,
    alternativas: [
      { id: "a", texto: "Realize trabalho." },
      { id: "b", texto: "Rejeite calor para a fonte fria." },
      { id: "c", texto: "Tenha rendimento de 100%." },
      { id: "d", texto: "Funcione em ciclos." }
    ],
    respostaCorreta: "c"
  }
];

// --- FUNÇÃO PARA INSERIR ---
const semear = async () => {
  try {
    // 1. Limpa questões antigas (opcional, mas bom para evitar duplicatas)
    await Questao.deleteMany({});
    console.log('🧹 Questões antigas removidas.');

    // 2. Insere as novas
    await Questao.insertMany(questoesIniciais);
    console.log(`🌱 ${questoesIniciais.length} novas questões cadastradas com sucesso!`);

    // 3. Encerra a conexão
    mongoose.connection.close();
  } catch (error) {
    console.error('Erro ao semear:', error);
  }
};

// Executa
semear();