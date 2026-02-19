require('dotenv').config();
const mongoose = require('mongoose');
const Material = require('./models/Material.cjs');

// CONEXÃO
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao Mongo!'))
  .catch(err => console.error(err));

const materiaisIniciais = [
  {
    titulo: "Anotações: Leis de Newton",
    descricao: "Foto do quadro da aula do dia 15/02.",
    categoria: "Mecânica",
    tipo: "FOTO",
    url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb" // Foto genérica de física
  },
  {
    titulo: "Lista de Exercícios 01",
    descricao: "PDF com 10 questões sobre MRU e MRUV.",
    categoria: "Mecânica",
    tipo: "PDF",
    url: "https://www.google.com" // Link fictício
  },
  {
    titulo: "Simulador de Calorimetria",
    descricao: "Link para o simulador PhET colorado.",
    categoria: "Termodinâmica",
    tipo: "LINK",
    url: "https://phet.colorado.edu/pt_BR/simulations/energy-forms-and-changes"
  },
  {
    titulo: "Vídeo: O que é Entropia?",
    descricao: "Vídeo complementar do canal Ciência Todo Dia.",
    categoria: "Termodinâmica",
    tipo: "VIDEO",
    url: "https://www.youtube.com/watch?v=680-E3w-FvM"
  }
];

const semear = async () => {
  try {
    await Material.deleteMany({}); // Limpa os antigos
    await Material.insertMany(materiaisIniciais);
    console.log("📚 Materiais cadastrados com sucesso!");
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }
};

semear();