// models/Aluno.cjs
const mongoose = require('mongoose');

const AlunoSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  nome: { type: String, required: true },
  serie: String,
  
  // Inventário de itens comprados
  inventario: { type: [String], default: [] },
  
  // Configuração visual do avatar
  avatarConfig: { type: Object, default: {} },
  
  // Economia do jogo
  pontos: { type: Number, default: 0 },
  pontosRanking: { type: Number, default: 0 },
  
  // Histórico de Desafios (Antigo)
  desafiosConcluidos: { type: [Number], default: [] },
  
  // Histórico de Questões de Treino (Novo - Anti-Farm)
  questoesRealizadas: { type: [String], default: [] } 
});

// Exporta o modelo para ser usado em outros arquivos
module.exports = mongoose.model('Aluno', AlunoSchema);