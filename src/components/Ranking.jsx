import React, { useState, useEffect } from "react";
import axios from "axios";
import Avatar from "react-nice-avatar";

const Ranking = ({ serieUsuario }) => {
  const [serieAtual, setSerieAtual] = useState(serieUsuario || "9ano");
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Lista das séries que existem na sua escola
  const seriesDisponiveis = [{val: "9ano", label:"9º ano"},{val: "2serie", label:"2ª série"}, {val: "3serie", label:"3ª série"}];

  useEffect(() => {
    const buscarRanking = async () => {
      setCarregando(true);
      try {
        const res = await axios.get(`/ranking/${serieAtual}`);
        setLista(res.data);
      } catch (error) {
        console.error("Erro ao buscar ranking");
      } finally {
        setCarregando(false);
      }
    };

    buscarRanking();
  }, [serieAtual]);

  return (
    <div style={{ animation: "fadeIn 0.5s" }}>
      <h2 style={{ color: "#f1c40f", textAlign: "center" }}>🏆 Ranking Geral</h2>

      {/* Seletor de Série */}
      <div style={{ display: "flex", overflowX: "auto", gap: "10px", padding: "10px 0", marginBottom: "20px" }}>
        {seriesDisponiveis.map(s => {
          // Criamos uma variável para facilitar a leitura:
          // Verifica se o valor salvo no estado é IGUAL ao valor deste botão
          const estaSelecionado = serieAtual === s.val;

          return (
            <button
              key={s.val}
              onClick={() => setSerieAtual(s.val)}
              style={{
                padding: "8px 15px",
                borderRadius: "20px",
                border: "none",
                // AQUI ESTAVA O ERRO: Agora comparamos s.val com serieAtual
                background: estaSelecionado ? "#f1c40f" : "#ecf0f1",
                color: estaSelecionado ? "#fff" : "#7f8c8d",
                fontWeight: "bold",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.3s ease" // Dica: Adicione isso para suavizar a troca de cor
              }}
            >
              {s.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Lista de Alunos */}
      {carregando ? (
        <p style={{textAlign:"center"}}>Carregando podio...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {lista.length === 0 ? <p style={{textAlign:"center"}}>Ninguém pontuou ainda nesta série.</p> : null}
          
          {lista.map((aluno, index) => (
            <div 
              key={index} 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                background: index === 0 ? "linear-gradient(90deg, #f1c40f 0%, #fff 100%)" : "#fff", // Destaque pro 1º lugar
                padding: "10px", 
                borderRadius: "10px", 
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                border: index === 0 ? "2px solid #f39c12" : "1px solid #eee"
              }}
            >
              {/* Posição */}
              <div style={{ width: "30px", fontSize: "1.2rem", fontWeight: "bold", color: "#2c3e50" }}>
                {index + 1}º
              </div>

              {/* Avatar Pequeno */}
              <div style={{ width: "40px", height: "40px", marginRight: "10px" }}>
                <Avatar style={{ width: "100%", height: "100%" }} {...aluno.avatarConfig} />
              </div>

              {/* Nome e Pontos */}
              <div style={{ flex: 1 }}>
                <strong style={{ display: "block", color: "#333" }}>{aluno.nome}</strong>
                <span style={{ fontSize: "0.8rem", color: "#7f8c8d" }}>{aluno.pontosRanking} pts</span>
              </div>

              {/* Ícone de Troféu para os Top 3 */}
              {index === 0 && <span style={{ fontSize: "1.5rem" }}>🥇</span>}
              {index === 1 && <span style={{ fontSize: "1.5rem" }}>🥈</span>}
              {index === 2 && <span style={{ fontSize: "1.5rem" }}>🥉</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Ranking;