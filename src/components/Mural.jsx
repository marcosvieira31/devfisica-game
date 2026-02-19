import React, { useState, useEffect } from "react";
import axios from "axios";

const Mural = () => {
  const [dataCalendario, setDataCalendario] = useState(new Date());
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // --- BUSCAR DADOS DO BANCO ---
  useEffect(() => {
    async function carregarMural() {
      try {
        const res = await axios.get('/mural');
        // Adaptando os dados do banco para o formato que seu calendário exige
        const eventosDoBanco = res.data.map(ev => ({
          _id: ev._id,
          data: ev.dataEvento, // Tem que ser 'YYYY-MM-DD'
          titulo: ev.titulo,
          tipo: ev.tipo || 'evento', // Padrão azul se não vier tipo
          descricao: ev.descricao
        }));
        setEventos(eventosDoBanco);
      } catch (error) {
        console.error("Erro ao carregar o mural:", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarMural();
  }, []);

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
    if (!e.data) return false;
    const [ano, mes] = e.data.split('-');
    return parseInt(ano) === dataCalendario.getFullYear() && 
           parseInt(mes) === (dataCalendario.getMonth() + 1);
  }).sort((a, b) => a.data.localeCompare(b.data)); // Ordena por data

  // Renderização Auxiliar
  const diasTotais = new Date(dataCalendario.getFullYear(), dataCalendario.getMonth() + 1, 0).getDate();
  const espacosVazios = new Date(dataCalendario.getFullYear(), dataCalendario.getMonth(), 1).getDay();
  const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const coresEvento = { prova: "#e74c3c", entrega: "#f39c12", evento: "#3498db" };

  if (carregando) return <div style={{ textAlign: "center", padding: "20px" }}>Carregando calendário... 📅</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s" }}>
      
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
                background: evento ? (coresEvento[evento.tipo] || "#3498db") : "transparent",
                color: evento ? "white" : "#333", fontWeight: evento ? "bold" : "normal"
              }}>
                {dia}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. LISTA DE EVENTOS DO MÊS */}
      <div>
        <h4 style={{ color: "#2c3e50", borderBottom: "2px solid #f1c40f", paddingBottom: "5px", display: "inline-block" }}>
          Agenda de {nomesMeses[dataCalendario.getMonth()]}
        </h4>
        
        {eventosDoMes.length === 0 ? (
          <p style={{ color: "#7f8c8d", fontStyle: "italic", marginTop: "10px" }}>Nenhum evento agendado para este mês.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            {eventosDoMes.map((ev) => (
              <div key={ev._id} style={{ background: "#fff", borderLeft: `5px solid ${coresEvento[ev.tipo] || "#3498db"}`, padding: "15px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
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

const botaoSeta = {background: "transparent", border: "1px solid #ddd", borderRadius: "5px", cursor: "pointer", fontSize: "1.2rem", padding: "0 10px", color: "#000" };

export default Mural;