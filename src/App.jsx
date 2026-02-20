  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import Avatar from "react-nice-avatar";

  // IMPORTAÇÃO DOS COMPONENTES
  import AvatarEditor from "./components/AvatarEditor";
  import Mural from "./components/Mural";       
  import Noticias from "./components/Noticias"; 
  import Loja from "./components/Loja";
  import Login from "./components/Login";
  import TelaEstudos from './components/TelaEstudos';
  import TelaAdmin from "./components/TelaAdmin";

  const AVATAR_PADRAO = {   sex: "man",
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
  shape: "rounded" };

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
    const [desafiosComErro, setDesafiosComErro] = useState([]);
    const [mostrarRanking, setMostrarRanking] = useState(false);
    const [temDesafioNovo, setTemDesafioNovo] = useState(false);
    
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
            setDesafiosComErro(res.data.desafiosComErro || []);
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

    // Verifica se há desafios novos/pendentes para este aluno
  // Verifica se há desafios pendentes (Versão Estável)
  useEffect(() => {
    // Só faz a busca se o aluno já estiver com a série carregada no sistema
    if (userSerie) { 
      axios.get('/desafios').then(res => {
        const desafiosBanco = res.data;
        
        const desafiosBloqueados = [...desafiosConcluidos, ...desafiosComErro].map(String);
        
        const pendente = desafiosBanco.some(d => 
          d.serie === userSerie && !desafiosBloqueados.includes(String(d._id || d.id))
        );
        
        setTemDesafioNovo(pendente);
      }).catch(err => console.error("Erro ao buscar pendentes:", err));
    }
  }, [userSerie, desafiosConcluidos, desafiosComErro]); 
  // ^^^ Agora ele só recalcula se o aluno acertar/errar algo, ou mudar de conta.

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
      // 1. Garante que é um número (evita que 50 + 100 vire "50100")
      const pontosReais = Number(pontos); 

      // 2. Atualiza visualmente na hora
      setSaldo(s => s + pontosReais);
      setDesafiosConcluidos(prev => [...prev, desafioId]); 

      // 3. Salva no banco
      if (userEmail) {
        try {
          await axios.post("/ganhar-pontos", {
            email: userEmail,
            pontos: pontosReais,
            desafioId: desafioId 
          });
        } catch (error) { 
          console.error("Erro ao comunicar com o servidor:", error); 
        }
      }
    };

    // Salva no cérebro do App que o aluno errou, para não esquecer ao trocar de tela
  const handleErrarDesafio = (desafioId) => {
    setDesafiosComErro(prev => {
      if (!prev.includes(desafioId)) {
        return [...prev, desafioId];
      }
      return prev;
    });
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
              <button 
                      onClick={() => setTelaAtual("desafios")} 
                      style={{ position: 'relative', ...estiloBotaoNav("desafios") }}
                    >
                      <span>⚔️</span> Desafios
                      
                      {/* A MAGIA ACONTECE AQUI: A Etiqueta vermelha */}
                      {temDesafioNovo && (
                        <span style={{
                          position: 'absolute', 
                          top: '-8px', 
                          right: '-8px',
                          background: '#e74c3c', 
                          color: 'white', 
                          fontSize: '10px',
                          padding: '3px 6px', 
                          borderRadius: '12px', 
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          animation: 'pulse 1.5s infinite' // Faz o botão pulsar para chamar a atenção
                        }}>
                          NOVO
                        </span>
                      )}
                    </button>
              <button onClick={() => setTelaAtual("loja")} style={estiloBotaoNav("loja")}><span>🛒</span> Loja</button>

              {/* PORTA SECRETA DO ADMIN */}
              {userEmail === 'marcos.silva456@enova.educacao.ba.gov.br' && (
                <button onClick={() => setTelaAtual("admin")} style={{...estiloBotaoNav("admin"), background: "#c0392b", borderBottomColor: "#e74c3c"}}>
                  <span>👨‍🏫</span> Painel
                </button>
              )}
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
                  desafiosComErro={desafiosComErro}// <--- Passar lista de erros
                  aoGanharPontos={handleGanharPontos} // <--- Passar função de ganhar pontos
                  aoErrarDesafio={handleErrarDesafio}
                  temDesafioNovo={temDesafioNovo}
                />
              )}
              {telaAtual === "loja" && <Loja saldoAtual={saldo} aoComprar={handleCompraRealizada} inventario={inventario}/>}
              {telaAtual === "admin" && <TelaAdmin />}
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