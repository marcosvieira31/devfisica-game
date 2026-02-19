import React, { useState } from "react";
import axios from "axios";

// Recebemos 'inventario' para saber o que o aluno já tem
const Loja = ({ saldoAtual, aoComprar, inventario }) => {
  
  // Lista de Itens (IDs devem bater com o AvatarEditor)
  const itensLoja = [
    // --- CABEÇAS / CHAPÉUS ---
    { id: "chapeu_turbante", nome: "Turbante Místico", tipo: "Chapéu", preco: 150, icone: "👳‍♀️" },
    { id: "chapeu_gorro", nome: "Gorro de Inverno", tipo: "Chapéu", preco: 100, icone: "🧢" },
    
    // --- ÓCULOS ---
    { id: "oculos_redondo", nome: "Óculos de Cientista", tipo: "Acessório", preco: 200, icone: "👓" },
    { id: "oculos_quadrado", nome: "Óculos Retro", tipo: "Acessório", preco: 120, icone: "🕶️" },
    
    // --- ROUPAS ---
    { id: "camisa_polo", nome: "Camisa Polo", tipo: "Roupa", preco: 300, icone: "👕" },
    { id: "camisa_moletom", nome: "Moletom Hacker", tipo: "Roupa", preco: 500, icone: "🧥" },
    
    // --- CABELOS ---
    { id: "cabelo_moicano", nome: "Cabelo Punk", tipo: "Cabelo", preco: 400, icone: "🤘" },
  ];

  const comprarItem = async (item) => {
    // 1. Validação Visual Rápida
    if (saldoAtual < item.preco) {
      alert("Saldo insuficiente! Vá resolver alguns desafios.");
      return;
    }

    try {
      const email = localStorage.getItem("aluno_email");
      
      // 2. Envia pedido ao servidor
      const res = await axios.post("/comprar-item", {
        email,
        itemId: item.id,
        preco: item.preco
      });

      // 3. Atualiza o App com o novo saldo e inventário
      aoComprar(res.data);
      alert(`Você comprou: ${item.nome}!`);

    } catch (error) {
      alert(error.response?.data?.message || "Erro ao comprar.");
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ marginBottom: "15px", color: "#2c3e50" }}>🛒 Loja de Itens</h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        {itensLoja.map((item) => {
          
          // --- AQUI ESTÁ A LÓGICA DE BLOQUEIO ---
          const jaPossui = inventario.includes(item.id);
          const semSaldo = saldoAtual < item.preco;

          return (
            <div key={item.id} style={{ border: "1px solid #eee", borderRadius: "10px", padding: "15px", textAlign: "center", background: jaPossui ? "#f9f9f9" : "white", opacity: jaPossui ? 0.7 : 1 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>{item.icone}</div>
              <strong style={{ display: "block", color: "#34495e" }}>{item.nome}</strong>
              <span style={{ fontSize: "0.8rem", color: "#95a5a6" }}>{item.tipo}</span>
              
              <div style={{ marginTop: "15px" }}>
                {jaPossui ? (
                  // BOTÃO SE JÁ TIVER O ITEM
                  <button 
                    disabled 
                    style={{ width: "100%", padding: "10px", background: "#bdc3c7", color: "white", border: "none", borderRadius: "5px", cursor: "not-allowed", fontWeight: "bold" }}
                  >
                    ✔ Adquirido
                  </button>
                ) : (
                  // BOTÃO SE NÃO TIVER (Verifica saldo)
                  <button 
                    onClick={() => comprarItem(item)}
                    disabled={semSaldo}
                    style={{ 
                      width: "100%", padding: "10px", border: "none", borderRadius: "5px", cursor: semSaldo ? "not-allowed" : "pointer", fontWeight: "bold", transition: "0.2s",
                      background: semSaldo ? "#ecf0f1" : "#27ae60", 
                      color: semSaldo ? "#bdc3c7" : "white"
                    }}
                  >
                    {semSaldo ? `Faltam ${item.preco - saldoAtual} J` : `Comprar ${item.preco} J`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Loja;