require('dotenv').config();
const mongoose = require('mongoose');
const LinkUtil = require('./models/LinkUtil.cjs');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao Mongo!'))
  .catch(err => console.error(err));

const linksIniciais = [
  {
    titulo: "PhET Colorado",
    descricao: "Os melhores simuladores de Física interativos do mundo.",
    url: "https://phet.colorado.edu/pt_BR/",
    categoria: "Simuladores"
  },
  {
    titulo: "Canal Ciência Todo Dia",
    descricao: "Vídeos excelentes sobre curiosidades da Física.",
    url: "https://www.youtube.com/c/CienciaTodoDia",
    categoria: "Vídeos"
  },
  {
    titulo: "Física Total (Prof. Ivys)",
    descricao: "Aulas completas para reforço escolar.",
    url: "https://www.youtube.com/user/FISICATOTAL",
    categoria: "Vídeos"
  },
  {
    titulo: "Convert World",
    descricao: "Conversor universal de unidades de medida.",
    url: "https://www.convertworld.com/pt/",
    categoria: "Ferramentas"
  },
  {
    titulo: "WolframAlpha",
    descricao: "Calculadora científica poderosa (resolve equações).",
    url: "https://www.wolframalpha.com/",
    categoria: "Ferramentas"
  },
  {
    titulo: "Só Física",
    descricao: "Artigos, fórmulas e biografias de físicos.",
    url: "https://www.sofisica.com.br/",
    categoria: "Artigos"
  }
];

const semear = async () => {
  try {
    await LinkUtil.deleteMany({}); 
    await LinkUtil.insertMany(linksIniciais);
    console.log("🔗 Links úteis cadastrados com sucesso!");
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }
};

semear();