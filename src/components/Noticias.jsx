import React, { useState, useEffect } from "react";
import axios from "axios";

const Noticias = () => {
  const [noticiaSelecionada, setNoticiaSelecionada] = useState(null);
  const [noticias, setNoticias] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Busca as notícias no banco de dados quando a tela abre
  useEffect(() => {
    async function carregarNoticias() {
      try {
        const res = await axios.get('/noticias');
        if (Array.isArray(res.data)) {
          setNoticias(res.data);
        }
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarNoticias();
  }, []);

  // Formata a data que vem do banco (ISO) para o padrão BR (DD/MM/YYYY)
  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
  };

  // Cria um resumo automático (pega as primeiras 80 letras do conteúdo)
  const gerarResumo = (texto) => {
    if (!texto) return "";
    return texto.length > 80 ? texto.substring(0, 80) + "..." : texto;
  };

  if (carregando) {
    return <div style={{ textAlign: "center", padding: "20px", color: "#7f8c8d" }}>Buscando as últimas notícias... 📢</div>;
  }

  return (
    <div style={{ animation: "fadeIn 0.3s" }}>
      {!noticiaSelecionada ? (
        <>
          <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>📢 Notícias</h3>
          
          {noticias.length === 0 ? (
            <p style={{ color: "#7f8c8d", fontStyle: "italic", textAlign: "center", padding: "20px" }}>
              Nenhuma notícia publicada ainda.
            </p>
          ) : (
            noticias.map(n => (
              <div 
                key={n._id} // O MongoDB usa _id em vez de apenas id
                onClick={() => setNoticiaSelecionada(n)}
                style={{ marginBottom: "15px", background: "#fff", padding: "15px", border: "1px solid #eee", borderRadius: "8px", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
              >
                <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "5px" }}>
                  {formatarData(n.dataPublicacao)}
                </div>
                <strong style={{ color: "#d35400", fontSize: "1.1rem" }}>{n.titulo}</strong>
                <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "#555" }}>
                  {gerarResumo(n.conteudo)}
                </p>
                <span style={{ fontSize: "0.8rem", color: "#3498db", marginTop: "10px", display: "block" }}>
                  Ler mais...
                </span>
              </div>
            ))
          )}
        </>
      ) : (
        <div style={{ background: "white", padding: "20px", borderRadius: "10px", border: "1px solid #ddd" }}>
          <button onClick={() => setNoticiaSelecionada(null)} style={{ marginBottom: "15px", background: "transparent", border: "none", color: "#3498db", cursor: "pointer", fontWeight: "bold" }}>
            ⬅ Voltar
          </button>
          
          <span style={{ fontSize: "0.9rem", color: "#888", display: "block", marginBottom: "10px" }}>
            {formatarData(noticiaSelecionada.dataPublicacao)}
          </span>
          <h2 style={{ color: "#d35400", margin: "0 0 20px 0" }}>{noticiaSelecionada.titulo}</h2>
          
          <div className="noticiaTexto" style={{ lineHeight: "1.6", color: "#2c3e50", fontSize: "1rem", whiteSpace: "pre-line" }}>
            {noticiaSelecionada.conteudo}
          </div>

          <div style={{ marginTop: "20px", fontSize: "0.85rem", color: "#bdc3c7", fontStyle: "italic", textAlign: "right" }}>
            Postado por: {noticiaSelecionada.autor || 'Professor'}
          </div>
        </div>
      )}
    </div>
  );
};

export default Noticias;