const mongoose = require('mongoose');

const DesafioSchema = new mongoose.Schema({
  serie: { type: String, required: true }, // 9ano, 1serie, 2serie, 3serie
  pergunta: { type: String, required: true },
  opcoes: [{ type: String, required: true }],
  correta: { type: String, required: true },
  pontos: { type: Number, required: true }
});

module.exports = mongoose.model('Desafio', DesafioSchema);