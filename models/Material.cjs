const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: String, // Ex: "Anotações do quadro sobre Leis de Newton"
  
  categoria: { 
    type: String, 
    enum: ['Mecânica', 'Termodinâmica', 'Óptica', 'Ondulatória', 'Geral'],
    default: 'Geral'
  },
  
  tipo: { 
    type: String, 
    enum: ['PDF', 'FOTO', 'VIDEO', 'LINK'], 
    required: true 
  },
  
  url: { type: String, required: true }, // Link do Drive/Youtube
  
  dataPostagem: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', MaterialSchema);