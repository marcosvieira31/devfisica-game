import React, { useState } from "react";

const Noticias = () => {
  const [noticiaSelecionada, setNoticiaSelecionada] = useState(null);

  const noticias = [
    { 
      id: 1, 
      data: "15/02/2026",
      titulo: "Inscrições Abertas para a OBF!", 
      resumo: "Garanta sua vaga na Olimpíada Brasileira de Física.", 
      conteudo: "Estamos felizes em anunciar que as inscrições para a OBF começaram! A prova da 1ª fase será realizada aqui na escola. Os interessados devem procurar a coordenação até o dia 10/03."
    },
    { 
      id: 2, 
      data: "12/02/2026",
      titulo: "Revisão Geral de Mecânica", 
      resumo: "Prepare-se para a prova mensal com nosso aulão.", 
      conteudo: "Na próxima sexta-feira, faremos um aulão de revisão focado nas Leis de Newton e Vetores. Tragam suas dúvidas anotadas!"
    }
  ];

  return (
    <div style={{ animation: "fadeIn 0.3s" }}>
      {!noticiaSelecionada ? (
        <>
          <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>📢 Notícias</h3>
          {noticias.map(n => (
            <div 
              key={n.id} onClick={() => setNoticiaSelecionada(n)}
              style={{ marginBottom: "15px", background: "#fff", padding: "15px", border: "1px solid #eee", borderRadius: "8px", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
            >
              <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "5px" }}>{n.data}</div>
              <strong style={{ color: "#d35400", fontSize: "1.1rem" }}>{n.titulo}</strong>
              <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "#555" }}>{n.resumo}</p>
              <span style={{ fontSize: "0.8rem", color: "#3498db", marginTop: "10px", display: "block" }}>Ler mais...</span>
            </div>
          ))}
        </>
      ) : (
        <div style={{ background: "white", padding: "20px", borderRadius: "10px", border: "1px solid #ddd" }}>
          <button onClick={() => setNoticiaSelecionada(null)} style={{ marginBottom: "15px", background: "transparent", border: "none", color: "#3498db", cursor: "pointer", fontWeight: "bold" }}>⬅ Voltar</button>
          <span style={{ fontSize: "0.9rem", color: "#888", display: "block", marginBottom: "10px" }}>{noticiaSelecionada.data}</span>
          <h2 style={{ color: "#d35400", margin: "0 0 20px 0" }}>{noticiaSelecionada.titulo}</h2>
          <div style={{ lineHeight: "1.6", color: "#2c3e50", fontSize: "1rem", whiteSpace: "pre-line" }}>
            {noticiaSelecionada.conteudo}
          </div>
        </div>
      )}
    </div>
  );
};

export default Noticias;