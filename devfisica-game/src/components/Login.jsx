import React, { useState } from "react";
import axios from "axios";

const Login = ({ onLogin }) => {
  const [modo, setModo] = useState("login"); // 'login' ou 'cadastro'
  const [etapaCadastro, setEtapaCadastro] = useState(1); // 1: Dados, 2: Código
  
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");     // <--- NOVO
  const [serie, setSerie] = useState("");   // <--- NOVO
  const [codigo, setCodigo] = useState("");
  
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email) return alert("Digite seu e-mail.");
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/login", { email });
      localStorage.setItem("aluno_email", email);
      onLogin(email);
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao entrar.");
    }
    setLoading(false);
  };

  const solicitarCodigo = async () => {
    // Validações novas
    if (!nome.trim() || !serie) return alert("Preencha seu Nome e Série.");
    if (!email.includes("@enova.educacao.ba.gov.br")) {
      return alert("Use seu e-mail institucional (@enova.educacao.ba.gov.br)");
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:3000/auth/solicitar-codigo", { email });
      setEtapaCadastro(2); 
      alert("Código enviado! (Verifique o terminal do servidor)");
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao solicitar código.");
    }
    setLoading(false);
  };

  const finalizarCadastro = async () => {
    setLoading(true);
    try {
      // Envia tudo para o servidor criar a conta
      await axios.post("http://localhost:3000/auth/validar-cadastro", { 
        email, codigo, nome, serie 
      });
      
      alert(`Bem-vindo(a), ${nome}!`);
      localStorage.setItem("aluno_email", email);
      onLogin(email);
    } catch (error) {
      alert(error.response?.data?.message || "Código incorreto.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#2c3e50" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "10px", width: "100%", maxWidth: "400px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
        
        <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
          {modo === "login" ? "Acesso do Aluno" : "Novo Cadastro"}
        </h2>

        {/* MODO LOGIN: Apenas E-mail */}
        {modo === "login" && (
          <input
            type="email"
            placeholder="seu.email@enova.educacao.ba.gov.br"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            style={estiloInput}
          />
        )}

        {/* MODO CADASTRO: Campos aparecem na Etapa 1 */}
        {modo === "cadastro" && etapaCadastro === 1 && (
          <>
            <input
              type="text"
              placeholder="Nome Completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={estiloInput}
            />
            
            <select 
              value={serie} 
              onChange={(e) => setSerie(e.target.value)}
              style={estiloInput}
            >
              <option value="">Selecione sua Série</option>
              <option value="9ano">9º Ano</option>
              <option value="1serie">1ª Série</option>
              <option value="2serie">2ª Série</option>
              <option value="3serie">3ª Série</option>
            </select>

            <input
              type="email"
              placeholder="seu.email@enova.educacao.ba.gov.br"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              style={estiloInput}
            />
          </>
        )}

        {/* MODO CADASTRO: Código aparece na Etapa 2 */}
        {modo === "cadastro" && etapaCadastro === 2 && (
          <>
             <p style={{fontSize: "0.9rem", color: "#666", marginBottom: "10px"}}>
               Código enviado para: <strong>{email}</strong>
             </p>
             <input
              type="text"
              placeholder="Código de 6 dígitos"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              maxLength={6}
              style={{ ...estiloInput, textAlign: "center", letterSpacing: "5px", fontSize: "1.2rem" }}
            />
          </>
        )}

        {/* BOTÕES */}
        {modo === "login" ? (
          <button onClick={handleLogin} disabled={loading} style={estiloBotao("#27ae60")}>
            {loading ? "Entrando..." : "ENTRAR"}
          </button>
        ) : (
          <button onClick={etapaCadastro === 1 ? solicitarCodigo : finalizarCadastro} disabled={loading} style={estiloBotao("#3498db")}>
            {loading ? "Processando..." : (etapaCadastro === 1 ? "ENVIAR CÓDIGO" : "FINALIZAR")}
          </button>
        )}

        <p style={{ marginTop: "20px", fontSize: "0.9rem", color: "#666" }}>
          {modo === "login" ? "Primeiro acesso?" : "Já tem conta?"}
          <span 
            onClick={() => {
              setModo(modo === "login" ? "cadastro" : "login");
              setEtapaCadastro(1);
              setCodigo("");
              setNome("");
              setSerie("");
            }} 
            style={{ color: "#3498db", cursor: "pointer", fontWeight: "bold", marginLeft: "5px" }}
          >
            {modo === "login" ? "Cadastre-se" : "Fazer Login"}
          </span>
        </p>

      </div>
    </div>
  );
};

const estiloInput = { width: "100%", padding: "12px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" };
const estiloBotao = (cor) => ({ width: "100%", padding: "12px", background: cor, color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" });

export default Login;