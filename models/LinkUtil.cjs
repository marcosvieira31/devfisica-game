const mongoose = require('mongoose');

const LinkUtilSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: String, // Ex: "Simulador de Circuitos Elétricos"
  url: { type: String, required: true },
  
  categoria: { 
    type: String, 
    enum: ['Simuladores', 'Vídeos', 'Artigos', 'Ferramentas'],
    default: 'Artigos'
  },
  
  // Opcional: Para ordenar os mais importantes primeiro
  prioridade: { type: Number, default: 1 } 
});

module.exports = mongoose.model('LinkUtil', LinkUtilSchema);