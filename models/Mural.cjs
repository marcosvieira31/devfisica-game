const mongoose = require('mongoose');

const MuralSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  dataEvento: { type: String, required: true }, // Ex: "25/10/2026" ou "Amanhã"
  tipo: { type: String, enum: ['prova', 'entrega', 'evento'], default: 'evento' },
  descricao: { type: String, required: true },
  dataCriacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mural', MuralSchema);