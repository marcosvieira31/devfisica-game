import React, { useState, useEffect } from "react";
import axios from "axios";

const Desafios = ({ aoGanharPontos, userSerie, desafiosConcluidos = [], aoVerRanking, desafiosComErro = [], userEmail }) => {
  const [bancoDeDesafios, setBancoDeDesafios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [feedback, setFeedback] = useState(null);
  
  // 1. MEMÓRIA CURTA (PONTE): Salva os erros da sessão atual até o aluno relogar
  const [errosDaSessao, setErrosDaSessao] = useState(() => {
    const salvos = localStorage.getItem(`erros_${userEmail}`);
    return salvos ? JSON.parse(salvos) : [];
  });

  // 2. O GRANDE TRUQUE: Junta os erros do banco (App.jsx) com os erros da sessão
  // Usamos o 'Set' para não repetir IDs duplicados
  const todosOsErros = [...new Set([...desafiosComErro.map(String), ...errosDaSessao.map(String)])];

  const nomesSeries = {
    "9ano": "9º Ano",
    "1serie": "1ª Série",
    "2serie": "2ª Série",
    "3serie": "3ª Série"
  };

  useEffect(() => {
    async function carregarDesafios() {
      try {
        const res = await axios.get('/desafios');
        if (Array.isArray(res.data)) {
          setBancoDeDesafios(res.data);
        }
      } catch (error) {
        console.error("Erro ao carregar desafios:", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarDesafios();
  }, []);

  const desafiosDisponiveis = bancoDeDesafios.filter(d => {
    const dId = String(d._id || d.id);
    return d.serie === userSerie && !desafiosConcluidos.map(String).includes(dId);
  });

  const desafioAtual = desafiosDisponiveis[perguntaAtual];
  const idAtual = desafioAtual ? String(desafioAtual._id || desafioAtual.id) : null;

  // 3. CÁLCULO IMEDIATO: Se o ID está na lista unida, corta os pontos. Sem atrasos!
  const jaErrouNesta = idAtual ? todosOsErros.includes(idAtual) : false;

  const responder = async (resposta) => {
    if (!desafioAtual) return;

    if (resposta === desafioAtual.correta) {
      // --- ACERTO ---
      const pontosParaDar = jaErrouNesta ? 0 : desafioAtual.pontos; 

      if (pontosParaDar > 0) {
        setFeedback(`Acertou! 🎉 +${pontosParaDar} J`);
      } else {
        setFeedback("Correto! (Mas sem pontos desta vez 😉)");
      }
      
      aoGanharPontos(pontosParaDar, idAtual);

    } else {
      // --- ERRO ---
      setFeedback("Ops! Errou. Tente novamente (agora valendo 0 pontos).");
      
      if (!jaErrouNesta) {
        // A. Atualiza a memória da sessão (para o botão Voltar não bugar)
        const novosErros = [...errosDaSessao, idAtual];
        setErrosDaSessao(novosErros);
        localStorage.setItem(`erros_${userEmail}`, JSON.stringify(novosErros));
        
        // B. Avisa o Banco de Dados (Para quando ele logar de outro PC)
        if (userEmail) {
          try {
            await axios.post('/registrar-erro', { email: userEmail, desafioId: idAtual });
          } catch (error) {
            console.error("Erro ao salvar erro no banco", error);
          }
        }
      }
    }
    
    setTimeout(() => {
      setFeedback(null);
      if (resposta === desafioAtual.correta) {
         setPerguntaAtual(0); 
      }
    }, 1500);
  };

  const nomeSerieLegivel = nomesSeries[userSerie] || userSerie || "sua turma";

  return (
    <div style={{ padding: "10px" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, color: "#2c3e50" }}>Desafios</h2>
        {aoVerRanking && (
          <button 
            onClick={aoVerRanking}
            style={{
              backgroundColor: "#f1c40f",
              color: "#fff",
              border: "none",
              padding: "8px 15px",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
            }}
          >
            🏆 Ver Ranking
          </button>
        )}
      </div>

      {carregando ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
          Buscando desafios no servidor... ⏳
        </div>
      ) : desafiosDisponiveis.length === 0 ? (
        
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#7f8c8d", animation: "fadeIn 0.5s", background: "white", borderRadius: "10px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🏆</div>
          <h3 style={{ margin: "0 0 10px 0", color: "#27ae60" }}>Parabéns!</h3>
          <p>Você completou todos os desafios disponíveis para a <strong>{nomeSerieLegivel}</strong>.</p>
          <p style={{ fontSize: "0.9rem" }}>Volte depois para ver se o professor lançou novos.</p>
        </div>

      ) : (

        <div style={{ background: "#fff", padding: "15px", borderRadius: "10px", border: "1px solid #ddd", animation: "fadeIn 0.3s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
            <strong>Questão Restante {perguntaAtual + 1} de {desafiosDisponiveis.length}</strong>
            
            {/* VALOR DA QUESTÃO BLINDADO */}
            <span style={{ fontWeight: "bold", color: jaErrouNesta ? "#e74c3c" : "#9b59b6" }}>
              Valendo {jaErrouNesta ? 0 : desafioAtual.pontos} J
            </span>
            
          </div>

          {feedback ? (
            <div style={{ padding: "20px", textAlign: "center", background: feedback.includes("Acertou") || feedback.includes("Correto") ? "#dff0d8" : "#f2dede", color: feedback.includes("Acertou") || feedback.includes("Correto") ? "#3c763d" : "#a94442", borderRadius: "5px", fontWeight: "bold" }}>
              {feedback}
            </div>
          ) : (
            <>
              <h4 style={{ margin: "0 0 15px 0" }}>{desafioAtual.pergunta}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {desafioAtual.opcoes.map(op => (  
                  <button 
                    key={op} 
                    onClick={() => responder(op)} 
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "5px", background: "#f9f9f9", color: "#000", cursor: "pointer", textAlign: "left", transition: "0.2s" }}
                    onMouseOver={(e) => e.target.style.background = "#eee"}
                    onMouseOut={(e) => e.target.style.background = "#f9f9f9"}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Desafios;