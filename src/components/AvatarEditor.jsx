import React, { useState, useEffect } from "react";
import Avatar from "react-nice-avatar";
import axios from "axios";

const REQUISITOS_LOJA = {
  hairStyle: { "mohawk": "cabelo_moicano" },
  glassesStyle: { "round": "oculos_redondo", "square": "oculos_quadrado" },
  hatStyle: { "turban": "chapeu_turbante", "beanie": "chapeu_gorro" },
  shirtStyle: { "polo": "camisa_polo", "hoody": "camisa_moletom" },
  mouthStyle: { "laugh": "riso_largo", "peace": "riso" },
};

// Definição local para garantir que o editor nunca comece "pelado"
const AVATAR_PADRAO_EDITOR = {
  sex: "man",
  faceColor: "#F9C9B6",
  eyebrowStyle: "up", // TRAVADO
  earSize: "small",   // TRAVADO
  eyeStyle: "circle",
  noseStyle: "round",
  mouthStyle: "smile",
  shirtStyle: "short",
  glassesStyle: "none",
  hairStyle: "normal",
  hatStyle: "none",
  hatColor: "#000",
  hairColor: "#000",
  shirtColor: "#3498db",
  bgColor: "#e2e2e2",
  shape: "rounded"
};

const OPCOES_PELE = [
  { val: "#F9C9B6", label: "Clara" },
  { val: "#AC6651", label: "Morena" },
  { val: "#592f2a", label: "Negra" },
  { val: "#FFDBAC", label: "Pálida" },
];

const OPCOES_CABELO = [
  { val: "#000000", label: "Preto" },
  { val: "#4a4a4a", label: "Cinza Escuro" },
  { val: "#ffffff", label: "Branco" },
  { val: "#6A4E23", label: "Castanho" },
  { val: "#ff0000", label: "Ruivo" },
  { val: "#F1C40F", label: "Loiro" },
  { val: "#3498DB", label: "Azul" },
  { val: "#9B59B6", label: "Roxo" },
  { val: "#2ECC71", label: "Verde" }
];

const OPCOES_ROUPA = [
  { val: "#3498db", label: "Azul" },
  { val: "#FF0000", label: "Vermelho" },
  { val: "#F1C40F", label: "Amarelo" },
  { val: "#2ECC71", label: "Verde" },
  { val: "#9B59B6", label: "Roxo" },
  { val: "#34495E", label: "Cinza" },
  { val: "#FFFFFF", label: "Branco" },
  { val: "#000000", label: "Preto" }
];

const OPCOES_FUNDO = [
  { val: "#e2e2e2", label: "Cinza Claro" },
  { val: "#fff", label: "Branco" },
  { val: "#a0e7e5", label: "Turquesa" },
  { val: "#b4f8c8", label: "Menta" },
  { val: "#fbe7c6", label: "Bege" }
];

const OPCOES_CHAPEU = [
  { val: "#000000", label: "Preto" },
  { val: "#ffffff", label: "Branco" },
  { val: "#E74C3C", label: "Vermelho" },
  { val: "#3498db", label: "Azul" },
  { val: "#F1C40F", label: "Amarelo" },
  { val: "#2ECC71", label: "Verde" },
  { val: "#9B59B6", label: "Roxo" },
  { val: "#34495E", label: "Cinza" }
];

// MUDANÇA: Recebe a prop onSave
const AvatarEditor = ({ inventario = [], onSave, configAtual }) => {

// O estado começa com o PADRÃO + O QUE VEIO DO APP
const [config, setConfig] = useState({
    ...AVATAR_PADRAO_EDITOR,
    ...configAtual,
    // TRAVA DE SEGURANÇA: Garante que nunca fica nulo no editor
    eyebrowStyle: configAtual?.eyebrowStyle || "up",
    earSize: configAtual?.earSize || "small"
  });

  // Se o App.jsx atualizar (ex: carregou do banco), o editor atualiza também
  useEffect(() => {
    if (configAtual) {
      setConfig(prev => ({ ...prev, ...configAtual }));
    }
  }, [configAtual]);

  
  const handleChange = (atributo, valor) => {
    const itemId = REQUISITOS_LOJA[atributo]?.[valor];
    if (itemId && !inventario.includes(itemId)) {
      alert("🔒 Bloqueado! Compre este item na Loja.");
      return;
    }
    setConfig(prev => ({ ...prev, [atributo]: valor }));
  };

  const handleSalvar = async () => {
    try {
      await axios.post("/salvar-avatar", { 
        email: localStorage.getItem("aluno_email"), 
        avatarConfig: config 
      });
      
      alert("Personagem salvo!");
      
      // MUDANÇA: Avisa o App.jsx para atualizar o header
      if (onSave) onSave();
      
    } catch(e) { 
      alert("Erro ao salvar"); 
    }
  };

  // ... (o restante do código dos Seletores permanece igual) ...
  // Vou abreviar a parte visual para focar na lógica

  const SeletorInteligente = ({ label, atributo, opcoes }) => (
    <label style={{ display: "block", marginBottom: "15px", textAlign: "left" }}>
      <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#666" }}>{label}</span>
      <select 
        value={config[atributo]} 
        onChange={(e) => handleChange(atributo, e.target.value)} 
        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginTop: "5px" }}
      >
        {opcoes.map(op => {
          const bloqueado = REQUISITOS_LOJA[atributo]?.[op.val] && !inventario.includes(REQUISITOS_LOJA[atributo][op.val]);
          return <option key={op.val} value={op.val} disabled={bloqueado}>{bloqueado ? `🔒 ${op.label}` : op.label}</option>
        })}
      </select>
    </label>
  );

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: "160px", height: "160px", margin: "0 auto 20px" }}>
        <Avatar style={{ width: "100%", height: "100%" }} {...config} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <SeletorInteligente label="Gênero" atributo="sex" opcoes={[{val:"man", label:"Masculino"}, {val:"woman", label:"Feminino"}]} />
        <SeletorInteligente label="Expressão" atributo="mouthStyle" opcoes={[{val:"smile", label:"Sorrindo"}, {val:"peace", label:"Riso"}, {val:"laugh", label:"Riso Largo"}]} />
        <SeletorInteligente label="Roupa" atributo="shirtStyle" opcoes={[{val:"polo", label:"Polo"}, {val:"hoody", label:"Moletom"}, {val:"short", label:"Gola V"}]} />
        <SeletorInteligente label="Cabelo" atributo="hairStyle" opcoes={[{val:"normal", label:"Normal"}, {val:"thick", label:"Espesso"}, {val:"mohawk", label:"Moicano"}, {val:"womanShort", label:"Curto"}, {val:"womanLong", label:"Comprido"}]} />
        <SeletorInteligente label="Chapéu" atributo="hatStyle" opcoes={[{val:"none", label:"Nenhum"}, {val:"beanie", label:"Gorro"}, {val:"turban", label:"Turbante"}]} />
        <SeletorInteligente label="Óculos" atributo="glassesStyle" opcoes={[{val:"none", label:"Nenhum"}, {val:"round", label:"Redondo"}, {val:"square", label:"Quadrado"}]} />

        {/* SELETORES DE COR */}
        {/* LÓGICA INTELIGENTE: Cabelo ou Chapéu? */}
        {config.hatStyle === "none" ? (
          // Se estiver SEM chapéu, mostra cor de CABELO
          <SeletorInteligente 
            label="Cor do Cabelo" 
            atributo="hairColor" 
            opcoes={OPCOES_CABELO} 
          />
        ) : (
          // Se estiver COM chapéu, mostra cor do CHAPÉU
          <SeletorInteligente 
            label="Cor do Chapéu" 
            atributo="hatColor" 
            opcoes={OPCOES_CHAPEU} 
          />
        )}
        <SeletorInteligente label="Cor da Pele" atributo="faceColor" opcoes={OPCOES_PELE} />
        <SeletorInteligente label="Cor da Roupa" atributo="shirtColor" opcoes={OPCOES_ROUPA} />
        <SeletorInteligente label="Cor do Fundo" atributo="bgColor" opcoes={OPCOES_FUNDO} />
        
      </div>

      <button onClick={handleSalvar} style={{ marginTop: "20px", padding: "15px", background: "#3498db", color: "white", border: "none", borderRadius: "8px", width: "100%", fontWeight: "bold", cursor: "pointer" }}>
        💾 Salvar Alterações
      </button>
    </div>
  );
};

export default AvatarEditor;