import React, { useState, useEffect } from "react";
import Avatar from "react-nice-avatar";
import axios from "axios";

const REQUISITOS_LOJA = {
  hairStyle: { "mohawk": "cabelo_moicano" },
  glassesStyle: { "round": "oculos_redondo", "square": "oculos_quadrado" },
  hatStyle: { "turban": "chapeu_turbante", "beanie": "chapeu_gorro" },
  shirtStyle: { "polo": "camisa_polo", "hoody": "camisa_moletom" },
  mouthStyle: { "laugh": "exp_rindo", "peace": "exp_biquinho" },
};

// MUDANÇA: Recebe a prop onSave
const AvatarEditor = ({ inventario = [], onSave }) => {
  // 1. Estado inicial com TODOS os campos possíveis travados
  const [config, setConfig] = useState({
    sex: "man",
    faceColor: "#F9C9B6",
    hairStyle: "normal",
    shirtStyle: "short",
    eyeStyle: "circle",
    mouthStyle: "smile",
    glassesStyle: "none",
    noseStyle: "round",
    hairColor: "#000000",
    hatStyle: "none",
    shirtColor: "#3498db",
    bgColor: "#e2e2e2",
    shape: "rounded",
    eyebrowStyle: "up", // <--- TRAVA AQUI
    earSize: "small"    // <--- TRAVA AQUI
  });

  useEffect(() => {
    const carregar = async () => {
      const email = localStorage.getItem("aluno_email");
      if(email) {
        try {
          const res = await axios.get(`http://localhost:3000/carregar-avatar/${email}?t=${Date.now()}`);
          if(res.data && res.data.avatar && Object.keys(res.data.avatar).length > 0) {
            
            // 2. MUDANÇA CRUCIAL: 
            // Fazemos um "merge" manual para garantir que eyebrowStyle 
            // não se perca se não existir no banco de dados ainda.
            setConfig(prev => ({
              ...prev,          // Mantém os padrões (sobrancelha up)
              ...res.data.avatar // Sobrescreve com o que vem do banco
            }));
          }
        } catch(e) { console.error("Erro ao carregar"); }
      }
    };
    carregar();
  }, []);

  
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
      await axios.post("http://localhost:3000/salvar-avatar", { 
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
        <SeletorInteligente label="Expressão" atributo="mouthStyle" opcoes={[{val:"smile", label:"Sorrindo"}, {val:"peace", label:"Riso Largo"}, {val:"laugh", label:"Rindo"}]} />
        <SeletorInteligente label="Roupa" atributo="shirtStyle" opcoes={[{val:"polo", label:"Polo"}, {val:"hoody", label:"Moletom"}, {val:"short", label:"Gola V"}]} />
        <SeletorInteligente label="Cabelo" atributo="hairStyle" opcoes={[{val:"normal", label:"Normal"}, {val:"thick", label:"Espesso"}, {val:"mohawk", label:"Moicano"}, {val:"womanShort", label:"Curto"}, {val:"womanLong", label:"Comprido"}]} />
        <SeletorInteligente label="Chapéu" atributo="hatStyle" opcoes={[{val:"none", label:"Nenhum"}, {val:"beanie", label:"Gorro"}, {val:"turban", label:"Turbante"}]} />
        <SeletorInteligente label="Óculos" atributo="glassesStyle" opcoes={[{val:"none", label:"Nenhum"}, {val:"round", label:"Redondo"}, {val:"square", label:"Quadrado"}]} />

        <div style={{ gridColumn: "span 2", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginTop: "10px" }}>
          <label style={{ textAlign: "left" }}>
           <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#666" }}>Cabelo</span>
           <input type="color" value={config.hairColor} onChange={(e) => handleChange("hairColor", e.target.value)} style={{ width: "100%", height: "35px", cursor: "pointer" }} />
          </label>
          <label style={{ textAlign: "left" }}>
           <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#666" }}>Roupa</span>
           <input type="color" value={config.shirtColor} onChange={(e) => handleChange("shirtColor", e.target.value)} style={{ width: "100%", height: "35px", cursor: "pointer" }} />
          </label>
          <label style={{ textAlign: "left" }}>
           <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#666" }}>Fundo</span>
           <input type="color" value={config.bgColor} onChange={(e) => handleChange("bgColor", e.target.value)} style={{ width: "100%", height: "35px", cursor: "pointer" }} />
          </label>
          <label style={{ textAlign: "left" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#666" }}>Pele</span>
            <input type="color" value={config.faceColor} onChange={(e) => handleChange("faceColor", e.target.value)} style={{ width: "100%", height: "35px", cursor: "pointer" }} />
          </label>
        </div>
      </div>

      <button onClick={handleSalvar} style={{ marginTop: "20px", padding: "15px", background: "#3498db", color: "white", border: "none", borderRadius: "8px", width: "100%", fontWeight: "bold", cursor: "pointer" }}>
        💾 Salvar Alterações
      </button>
    </div>
  );
};

export default AvatarEditor;