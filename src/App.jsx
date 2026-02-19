  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import Avatar from "react-nice-avatar";

  // IMPORTAÇÃO DOS COMPONENTES
  import AvatarEditor from "./components/AvatarEditor";
  import Mural from "./components/Mural";       
  import Noticias from "./components/Noticias"; 
  import Desafios from "./components/Desafios"; 
  import Loja from "./components/Loja";
  import Login from "./components/Login";
  import Ranking from "./components/Ranking";
  import TelaEstudos from './components/TelaEstudos';

  const AVATAR_PADRAO = { sex: "man", faceColor: "#F9C9B6", eyebrowStyle: "up", earSize: "small", eyeStyle: "circle", noseStyle: "round", mouthStyle: "smile", shirtStyle: "polo", glassesStyle: "none", hairStyle: "normal", hatStyle: "none", hairColor: "#000", shirtColor: "#3498db", bgColor: "#e2e2e2", shape: "rounded" };

  // Função auxiliar para limpar o objeto de configuração
  const getSafeAvatarConfig = (userConfig) => {
    const safeConfig = { ...AVATAR_PADRAO }; // Começa com o padrão seguro
    
    if (userConfig) {
      Object.keys(userConfig).forEach(key => {
        // Só sobrescreve se o valor do usuário for válido (não nulo/undefined)
        if (userConfig[key] !== null && userConfig[key] !== undefined) {
          safeConfig[key] = userConfig[key];
        }
      });
    }
    return safeConfig;
  };

  // Essa função pega o lixo do banco e preenche os buracos com o padrão
const higienizarAvatar = (avatarDoBanco) => {
  const avatarLimpo = { ...AVATAR_PADRAO }; // Começa 100% preenchido com o padrão

  if (avatarDoBanco) {
    Object.keys(avatarDoBanco).forEach((chave) => {
      // Só aceita o valor do banco se ele NÃO for nulo ou undefined
      if (avatarDoBanco[chave] !== null && avatarDoBanco[chave] !== undefined) {
        avatarLimpo[chave] = avatarDoBanco[chave];
      }
    });
  }
  return avatarLimpo;
};

  function App() {
    const [userEmail, setUserEmail] = useState(null);
    const [userName, setUserName] = useState("");
    const [userSerie, setUserSerie] = useState("");
    const [saldo, setSaldo] = useState(0);
    const [inventario, setInventario] = useState([]);
    const [avatarConfig, setAvatarConfig] = useState(AVATAR_PADRAO);
        // --- CARREGAR DADOS ---
    const [desafiosConcluidos, setDesafiosConcluidos] = useState([]);
    const [mostrarRanking, setMostrarRanking] = useState(false);
    
    const [telaAtual, setTelaAtual] = useState("mural"); 
    const LARGURA_APP = "500px"; 
  
    const carregarDados = async () => {
      let email = userEmail || localStorage.getItem("aluno_email");
      if (email) {
        if (!userEmail) setUserEmail(email);
        try {
          const res = await axios.get(`/carregar-avatar/${email}?t=${Date.now()}`);
          if (res.data) {
            setSaldo(res.data.pontos || 0);
            setInventario(res.data.inventario || []);
            setDesafiosConcluidos(res.data.desafiosConcluidos || []); // <--- CARREGA A LISTA
            setUserName(res.data.nome || email.split('@')[0]);
            setUserSerie(res.data.serie || "");
            if (res.data.avatar) {
              const avatarSeguro = higienizarAvatar(res.data.avatar);
            setAvatarConfig(avatarSeguro);
            }
          }
        } catch (e) { if (e.response && e.response.status === 404) handleLogout(); }
      }
    };
    useEffect(() => { carregarDados(); }, [userEmail]);

    const handleLogin = (email) => setUserEmail(email);
    
    const handleLogout = () => { 
      localStorage.removeItem("aluno_email"); 
      setUserEmail(null); 
      setAvatarConfig(AVATAR_PADRAO); 
      setSaldo(0);
      setTelaAtual("mural");
      setMostrarRanking(false);
    };

    const handleCompraRealizada = (dados) => { 
      setSaldo(dados.novoSaldo); 
      setInventario(dados.inventario); 
    };

    // --- CORREÇÃO AQUI: SALVA NO BANCO DE DADOS ---
    const handleGanharPontos = async (pontos, desafioId) => {
      // 1. Atualiza visualmente na hora
      setSaldo(s => s + pontos);
      setDesafiosConcluidos(prev => [...prev, desafioId]); // <--- MARCA COMO FEITO LOCALMENTE

      // 2. Salva no banco
      if (userEmail) {
        try {
          await axios.post("/ganhar-pontos", {
            email: userEmail,
            pontos: pontos,
            desafioId: desafioId // <--- ENVIA O ID
          });
        } catch (error) { console.error(error); }
      }
    };

    const estiloBotaoNav = (nomeTela) => ({
      flex: 1, padding: "10px 5px", border: "none", cursor: "pointer", fontSize: "0.9rem",
      background: telaAtual === nomeTela ? "#3498db" : "#2c3e50", color: "white", 
      borderBottom: telaAtual === nomeTela ? "4px solid #f1c40f" : "4px solid transparent",
      transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px"
    });

    const avatarVisualizacao = {
    ...AVATAR_PADRAO,
    ...avatarConfig,
    // Força bruta: Se vier nulo ou undefined, usa o padrão
    eyebrowStyle: avatarConfig.eyebrowStyle || AVATAR_PADRAO.eyebrowStyle,
    earSize: avatarConfig.earSize || AVATAR_PADRAO.earSize
  };

    return (
      <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "#242424", minHeight: "100vh", color: "white", padding: "20px", boxSizing: "border-box" }}>
        {!userEmail ? <Login onLogin={handleLogin} /> : (
          <div style={{ width: "100%", maxWidth: LARGURA_APP, margin: "0 auto", display: "flex", flexDirection: "column" }}>
            
            {/* CABEÇALHO */}
            <header style={{ background: "#2c3e50", padding: "10px 15px", position: "relative", borderRadius: "10px", marginBottom: "20px", display: "flex", alignItems: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.2)" }}>
              
              {/* Perfil Clicável */}
              <div 
                onClick={() => setTelaAtual("avatar")} 
                title="Clique para editar"
                style={{ display: "flex", alignItems: "center", gap: "15px", cursor: "pointer" }}
              >
                <div style={{ width: "55px", height: "55px", border: "2px solid #f1c40f", borderRadius: "50%", overflow: "hidden", background: "white" }}>
                  <Avatar 
                    style={{ width: "100%", height: "100%" }} 
                    {...avatarConfig} 
                    // AQUI ESTÁ A SOLUÇÃO: Se vier nulo ou vazio, forçamos "up" na marra
                    eyebrowStyle={avatarConfig.eyebrowStyle || "up"} 
                    earSize={avatarConfig.earSize || "small"}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.7rem", color: "#bdc3c7", textTransform: "uppercase", letterSpacing: "1px" }}>{userSerie}</span>
                  <strong style={{ fontSize: "1.1rem", color: "#ecf0f1", lineHeight: "1.2" }}>{userName}</strong>
                  <span style={{ fontSize: "0.7rem", color: "#3498db", marginTop: "2px", fontWeight: "bold" }}>Editar Perfil ✎</span>
                </div>
              </div>
              <img src="/favicon.png" alt="" className="logo-header" width={"75px"} style={{position: "absolute", left: "50%", transform: "translateX(-50%)"}}/>
              {/* Saldo */}
              <div style={{ textAlign: "right", background: "rgba(0,0,0,0.2)", padding: "5px 10px", borderRadius: "6px", marginLeft: "auto" }}>
                <p style={{ margin: 0, fontSize: "0.6rem", color: "#f1c40f", fontWeight: "bold" }}>ENERGIA</p>
                <strong style={{ fontSize: "1.2rem", color: "#f1c40f" }}>{saldo} J</strong>
              </div>
            </header>
            
            {/* NAVEGAÇÃO 4 ABAS */}
            <nav style={{ display: "flex", gap: "5px", marginBottom: "15px" }}>
              <button onClick={() => setTelaAtual("mural")} style={estiloBotaoNav("mural")}><span>📅</span>Mural</button>
              <button onClick={() => setTelaAtual("noticias")} style={estiloBotaoNav("noticias")}><span>📢</span>Notícias</button>
              <button onClick={() => setTelaAtual("desafios")} style={estiloBotaoNav("desafios")}><span>📚</span>Estudos</button>
              <button onClick={() => setTelaAtual("loja")} style={estiloBotaoNav("loja")}><span>🛒</span> Loja</button>
            </nav>

            {/* CONTEÚDO */}
            <div style={{ background: "white", padding: "20px", borderRadius: "10px", color: "#333", minHeight: "500px", width: "100%", boxSizing: "border-box", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}>
              
              {telaAtual === "avatar" && (
                <div style={{ animation: "fadeIn 0.3s" }}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px"}}>
                    <h3 style={{margin:0, color:"#2c3e50"}}>Personalizar</h3>
                    <button onClick={()=>setTelaAtual("mural")} style={{border:"none", background:"transparent", color:"#3498db", cursor:"pointer", fontWeight:"bold"}}>✖ Fechar</button>
                  </div>
                  
                  <AvatarEditor inventario={inventario} onSave={carregarDados} configAtual={avatarVisualizacao}/>

                  {/* BOTÃO DE SAIR (Escondido aqui) */}
                  <hr style={{ margin: "25px 0", border: "0", borderTop: "1px solid #eee" }} />
                  <button 
                    onClick={handleLogout} 
                    style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid #c0392b", color: "#c0392b", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
                  >
                    Sair da Conta
                  </button>
                </div>
              )}
              
              {telaAtual === "mural" && <Mural />}
              {telaAtual === "noticias" && <Noticias />}
              {telaAtual === "desafios" && ( // Ou "estudos", dependendo de como você nomeou
                <TelaEstudos 
                  usuarioEmail={userEmail}
                  userSerie={userSerie} // <--- IMPORTANTE: Passar a série para o ranking funcionar
                  desafiosConcluidos={desafiosConcluidos} // <--- Passar lista de feitos
                  aoGanharPontos={handleGanharPontos} // <--- Passar função de ganhar pontos
                />
              )}
              {telaAtual === "loja" && <Loja saldoAtual={saldo} aoComprar={handleCompraRealizada} inventario={inventario}/>}
            </div>
            
            <div style={{ textAlign: "center", marginTop: "20px", color: "#7f8c8d", fontSize: "0.8rem" }}>
              Devfisica &copy; 2026
            </div>
          </div>
        )}
      </div>
    );
  }

  export default App;