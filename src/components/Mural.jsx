import React, { useState } from "react";

const Mural = () => {
  const [dataCalendario, setDataCalendario] = useState(new Date());

  // --- DADOS DOS EVENTOS ---
  const eventos = [
    { 
      data: "2026-02-20", 
      titulo: "Entrega: Lista de Cinemática", 
      tipo: "entrega",
      descricao: "Resolver exercícios 1 ao 15. Enviar foto pelo Classroom."
    },
    { 
      data: "2026-02-25", 
      titulo: "Prova Mensal: Leis de Newton", 
      tipo: "prova",
      descricao: "Conteúdo: 1ª, 2ª e 3ª Lei, Força Peso e Tração."
    },
    { 
      data: "2026-03-10", 
      titulo: "Feira de Ciências", 
      tipo: "evento",
      descricao: "Apresentação dos projetos no pátio."
    },
  ];

  // --- LÓGICA CALENDÁRIO ---
  const mudarMes = (dir) => {
    const d = new Date(dataCalendario);
    d.setMonth(d.getMonth() + dir);
    setDataCalendario(d);
  };

  const verificarEvento = (dia) => {
    const ano = dataCalendario.getFullYear();
    const mes = String(dataCalendario.getMonth() + 1).padStart(2, '0');
    const diaFormatado = String(dia).padStart(2, '0');
    const dataString = `${ano}-${mes}-${diaFormatado}`;
    return eventos.find(e => e.data === dataString);
  };

  // Filtra eventos APENAS do mês atual para exibir na lista abaixo
  const eventosDoMes = eventos.filter(e => {
    const [ano, mes] = e.data.split('-');
    return parseInt(ano) === dataCalendario.getFullYear() && 
           parseInt(mes) === (dataCalendario.getMonth() + 1);
  }).sort((a, b) => a.data.localeCompare(b.data)); // Ordena por data

  // Renderização Auxiliar
  const diasTotais = new Date(dataCalendario.getFullYear(), dataCalendario.getMonth() + 1, 0).getDate();
  const espacosVazios = new Date(dataCalendario.getFullYear(), dataCalendario.getMonth(), 1).getDay();
  const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const coresEvento = { prova: "#e74c3c", entrega: "#f39c12", evento: "#3498db" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* 1. CALENDÁRIO VISUAL */}
      <div style={{ background: "white", padding: "15px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <button onClick={() => mudarMes(-1)} style={botaoSeta}>⬅</button>
          <h3 style={{ margin: 0, color: "#2c3e50" }}>{nomesMeses[dataCalendario.getMonth()]} {dataCalendario.getFullYear()}</h3>
          <button onClick={() => mudarMes(1)} style={botaoSeta}>➡</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px", textAlign: "center" }}>
          {["D","S","T","Q","Q","S","S"].map(d => <div key={d} style={{fontSize:"0.8rem", color:"#888"}}>{d}</div>)}
          {[...Array(espacosVazios)].map((_, i) => <div key={`e-${i}`} />)}
          {[...Array(diasTotais)].map((_, i) => {
            const dia = i + 1;
            const evento = verificarEvento(dia);
            return (
              <div key={dia} style={{ 
                padding: "8px 0", borderRadius: "50%", fontSize: "0.9rem",
                background: evento ? coresEvento[evento.tipo] : "transparent",
                color: evento ? "white" : "#333", fontWeight: evento ? "bold" : "normal"
              }}>
                {dia}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. LISTA DE EVENTOS DO MÊS (Visível sem clique) */}
      <div>
        <h4 style={{ color: "#2c3e50", borderBottom: "2px solid #f1c40f", paddingBottom: "5px", display: "inline-block" }}>
          Agenda de {nomesMeses[dataCalendario.getMonth()]}
        </h4>
        
        {eventosDoMes.length === 0 ? (
          <p style={{ color: "#7f8c8d", fontStyle: "italic", marginTop: "10px" }}>Nenhum evento agendado para este mês.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            {eventosDoMes.map((ev, idx) => (
              <div key={idx} style={{ background: "#fff", borderLeft: `5px solid ${coresEvento[ev.tipo]}`, padding: "15px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ color: "#2c3e50" }}>{ev.titulo}</strong>
                  <span style={{ fontSize: "0.8rem", background: "#eee", padding: "2px 6px", borderRadius: "4px" }}>
                    {ev.data.split('-').reverse().slice(0,2).join('/')}
                  </span>
                </div>
                <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "#666" }}>{ev.descricao}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const botaoSeta = { background: "transparent", border: "1px solid #ddd", borderRadius: "5px", cursor: "pointer", fontSize: "1.2rem", padding: "0 10px" };

export default Mural;