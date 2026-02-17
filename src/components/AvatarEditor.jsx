import React, { useState } from "react";
import Avatar, { genConfig } from "react-nice-avatar";
import axios from "axios";

const AvatarEditor = () => {
  // 1. O "Estado" guarda a receita do boneco
const [config, setConfig] = useState({
    sex: "man",
    faceColor: "#F9C9B6",
    earSize: "small",
    eyeStyle: "circle",
    noseStyle: "short",
    mouthStyle: "smile",
    shirtStyle: "hoody",
    glassesStyle: "none",
    hairColor: "#000000",
    hairStyle: "normal",
    hatStyle: "none",
    hatColor: "#fff",
    eyeBrowStyle: "up",
    shirtColor: "#77311D",
    bgColor: "#E0DDFF",
    shape: "circle" // Formato do fundo
  });

  // 2. Função que atualiza uma parte específica da receita
  const handleChange = (atributo, valor) => {
    setConfig((prev) => ({ ...prev, [atributo]: valor }));
  };

  // 3. Gera a configuração final para o componente desenhar
  const myConfig = genConfig(config);

  // 4. Gera configuração aleatória
  const handleRandom = () => {
    // Gera uma configuração aleatoria da biblioteca
    const configAleatoria = genConfig();
    // Atualiza o estado com essa nova config
    setConfig(configAleatoria);
  }

  // Função para Salvar no Banco
const handleSave = async () => {
  // Como ainda não temos login, vamos inventar um email fixo para testar
  const emailAluno = "aluno_teste@fisica.com"; 

  try {
    await axios.post("http://localhost:3000/salvar-avatar", {
      email: emailAluno,
      avatarConfig: config // Enviamos o JSON do estado atual
    });

    alert("✅ Avatar salvo com sucesso!");
  } catch (error) {
    console.error(error);
    alert("❌ Erro ao salvar. O servidor está rodando?");
  }
};

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
      
      {/* LADO ESQUERDO: O BONECO */}
      <div style={{ border: "2px solid #ddd", padding: "20px", borderRadius: "10px" }}>
        <h2>Seu Personagem</h2>
        {/* Aqui a mágica acontece: o componente desenha baseado no JSON */}
        <Avatar style={{ width: "10rem", height: "10rem" }} {...myConfig} />
        
        <div style={{ marginTop: "20px" }}>
          <strong>Receita (JSON):</strong>
          <pre style={{ fontSize: "10px", background: "#f4f4f4", padding: "5px" }}>
            {JSON.stringify(config, null, 2)}
          </pre>
          <p>⚠️ É isso aqui que salvaremos no banco semana que vem!</p>
        </div>
      </div>

      {/* LADO DIREITO: O CAMARIM (Controles) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{display: "flex", flexDirection:"column", alignItems: "center"}}>
        <h3>Personalização</h3>
        </div>
       {/* --- SEÇÃO ROSTO --- */}
        <h4>Rosto</h4>
        
        <label>
        Tom de Pele:
        <select value={config.faceColor} onChange={(e) => handleChange("faceColor", e.target.value)}>
            <option value="#F9C9B6">Clara</option>
            <option value="#AC6651">Morena</option>
            <option value="#8D5524">Negra</option>
            <option value="#77311D">Negra Escura</option>
            <option value="#FFDBAC">Pálida</option>
        </select>
        </label>

        <label>
        Formato do Nariz:
        <select value={config.noseStyle} onChange={(e) => handleChange("noseStyle", e.target.value)}>
            <option value="short">Curto (Padrão)</option>
            <option value="long">Longo</option>
            <option value="round">Redondo</option>
        </select>
        </label>

        <label>
        Boca:
        <select value={config.mouthStyle} onChange={(e) => handleChange("mouthStyle", e.target.value)}>
            <option value="smile">Sorriso</option>
            <option value="laugh">Rindo</option>
            <option value="peace">Biquinho (Peace)</option>
        </select>
        </label>
        
        {/* --- SEÇÃO CABELO --- */}
        <h4>Cabelo e Cabeça</h4>
        <label>
        Estilo do Cabelo:
        <select value={config.hairStyle} onChange={(e) => handleChange("hairStyle", e.target.value)}>
            <option value="normal">Curto Padrão</option>
            <option value="thick">Grosso / Topete</option>
            <option value="mohawk">Moicano</option>
            <option value="womanLong">Longo (Solto)</option>
            <option value="womanShort">Chanel / Curto Fem.</option>
        </select>
        </label>

        <label>
        Cor do Cabelo:
        <select value={config.hairColor} onChange={(e) => handleChange("hairColor", e.target.value)}>
            <option value="#000000">Preto</option>
            <option value="#77311D">Castanho Escuro</option>
            <option value="#FC909F">Castanho Claro</option>
            <option value="#D2EFF3">Loiro Platinado</option>
            <option value="#F48150">Ruivo</option>
            <option value="#506AF4">Azul (Estilo Anime)</option>
        </select>
        </label>

        <label>
        Chapéu / Acessório Cabeça:
        <select value={config.hatStyle} onChange={(e) => handleChange("hatStyle", e.target.value)}>
            <option value="none">Nenhum</option>
            <option value="beanie">Touca</option>
            <option value="turban">Turbante</option>
        </select>
        </label>

        {/* --- SEÇÃO OLHOS --- */}
        <h4>Olhar</h4>
        <label>
        Formato dos Olhos:
        <select value={config.eyeStyle} onChange={(e) => handleChange("eyeStyle", e.target.value)}>
            <option value="circle">Bolinha (Padrão)</option>
            <option value="oval">Oval (Vertical)</option>
            <option value="smile">Fechados (Sorrrindo)</option>
        </select>
        </label>

        <label>
        Sobrancelhas:
        <select value={config.eyeBrowStyle} onChange={(e) => handleChange("eyeBrowStyle", e.target.value)}>
            <option value="up">Arqueada (Masculina)</option>
            <option value="upWoman">Arqueada (Feminina)</option>
        </select>
        </label>

        <label>
        Óculos:
        <select value={config.glassesStyle} onChange={(e) => handleChange("glassesStyle", e.target.value)}>
            <option value="none">Nenhum</option>
            <option value="round">Redondos (Harry Potter)</option>
            <option value="square">Quadrados (Nerd)</option>
        </select>
        </label>

        {/* --- SEÇÃO ROUPAS --- */}
        <h4>Estilo</h4>
        <label>
        Roupa:
        <select value={config.shirtStyle} onChange={(e) => handleChange("shirtStyle", e.target.value)}>
            <option value="hoody">Moletom</option>
            <option value="short">Camiseta Gola V</option>
            <option value="polo">Camisa Polo</option>
        </select>
        </label>

        <label>
        Cor da Roupa:
        <input 
            type="color" 
            value={config.shirtColor}
            onChange={(e) => handleChange("shirtColor", e.target.value)} 
            style={{ height: "40px", width: "100%", cursor: "pointer" }}
        />
        </label>

        <label>
        Cor do Fundo (Background):
        <input 
            type="color" 
            value={config.bgColor}
            onChange={(e) => handleChange("bgColor", e.target.value)} 
            style={{ height: "40px", width: "100%", cursor: "pointer" }}
        />
        </label>

        <button onClick={handleRandom}>🎲 Estilo Aleatório</button>
        

      </div>
    </div>
  );
};

export default AvatarEditor;