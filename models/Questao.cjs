const mongoose = require('mongoose');

const QuestaoSchema = new mongoose.Schema({
  enunciado: { 
    type: String, 
    required: true 
  },
  imagemUrl: { 
    type: String, 
    default: null // Para fotos de gráficos ou esquemas
  },
  alternativas: [
    {
      id: { type: String, required: true }, // ex: "a", "b", "c", "d"
      texto: { type: String, required: true }
    }
  ],
  respostaCorreta: { 
    type: String, 
    required: true // O ID da alternativa certa (ex: "c")
  },
  
  // --- FILTROS DE ESTUDO ---
  area: { 
    type: String, 
    required: true,
    enum: ['Mecânica', 'Termodinâmica', 'Óptica', 'Ondulatória', 'Eletromagnetismo', 'Cinemática'] 
  },
  dificuldade: { 
    type: String, 
    required: true,
    enum: ['Fácil', 'Médio', 'Difícil']
  },
  
  // --- GAMIFICATION ---
  xp: { 
    type: Number, 
    default: 10 // Valor padrão baixo (ex: Fácil=10, Médio=20, Difícil=30)
  }
});

module.exports = mongoose.model('Questao', QuestaoSchema);