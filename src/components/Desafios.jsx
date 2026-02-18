import React, { useState, useEffect } from "react";

// Recebe desafiosConcluidos via props
const Desafios = ({ aoGanharPontos, userSerie, desafiosConcluidos }) => {
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [jaErrou, setJaErrou] = useState(false);

  const bancoDeDesafios = [
    { id: 1, serie: "9ano", pergunta: "Estado com forma/volume definidos:", opcoes: ["Sólido", "Líquido", "Gasoso"], correta: "Sólido", pontos: 50 },
    { id: 2, serie: "9ano", pergunta: "Som não propaga no:", opcoes: ["Ar", "Água", "Vácuo"], correta: "Vácuo", pontos: 70 },
    { id: 3, serie: "1serie", pergunta: "Unidade de força:", opcoes: ["Joule", "Newton", "Watt"], correta: "Newton", pontos: 50 },
    { id: 4, serie: "1serie", pergunta: "Lei da Inércia é a:", opcoes: ["1ª Lei", "2ª Lei", "3ª Lei"], correta: "1ª Lei", pontos: 100 },
    { id: 5, serie: "2serie", pergunta: "Escala absoluta:", opcoes: ["Celsius", "Kelvin", "Fahrenheit"], correta: "Kelvin", pontos: 80 },
    { id: 6, serie: "2serie", pergunta: "Espelho plano forma imagem:", opcoes: ["Real", "Virtual"], correta: "Virtual", pontos: 100 },
    { id: 9, serie: "3serie", pergunta: "Carga negativa:", opcoes: ["Próton", "Elétron"], correta: "Elétron", pontos: 50 },
    { id: 10, serie: "3serie", pergunta: "Lei de Ohm:", opcoes: ["U=R.i", "F=m.a"], correta: "U=R.i", pontos: 100 }
  ];

  // FILTRAGEM DUPLA: 
  // 1. Pela série do aluno
  // 2. Apenas os que NÃO estão na lista de concluídos
  const desafiosDisponiveis = bancoDeDesafios.filter(d => 
    d.serie === userSerie && !desafiosConcluidos.includes(d.id)
  );

  const responder = (resposta) => {
    const desafio = desafiosDisponiveis[perguntaAtual];
    
    if (resposta === desafio.correta) {
      // --- LÓGICA DE PONTOS ---
      // Se jáErrou for true, ganha 0. Se for false (primeira vez), ganha os pontos cheios.
      const pontosParaDar = jaErrou ? 0 : desafio.pontos; 

      if (pontosParaDar > 0) {
        setFeedback(`Acertou! 🎉 +${pontosParaDar} J`);
      } else {
        setFeedback("Correto! (Mas sem pontos desta vez 😉)");
      }
      
      // Envia para o backend (mesmo sendo 0, é importante para marcar como CONCLUÍDO)
      aoGanharPontos(pontosParaDar, desafio.id);

      // Reseta o estado de erro para a PRÓXIMA pergunta
      setJaErrou(false); 

    } else {
      // --- LÓGICA DO ERRO ---
      setFeedback("Ops! Errou. Tente novamente (agora valendo 0 pontos).");
      setJaErrou(true); // Marca que o usuário "sujou" essa tentativa
    }
    setTimeout(() => {
      setFeedback(null);
      // Como a lista vai diminuir (o desafio atual sai da lista), 
      // não precisamos incrementar o índice se acertou, pois o próximo virará o índice 0.
      // Se errou, mantemos na mesma pergunta.
      if (resposta === desafio.correta) {
         setPerguntaAtual(0); // Volta pro topo da nova lista
      }
    }, 1500);
  };

  // Se não sobrou nenhum desafio na lista filtrada:
  if (desafiosDisponiveis.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", color: "#7f8c8d", animation: "fadeIn 0.5s" }}>
        <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🏆</div>
        <h3 style={{ margin: "0 0 10px 0", color: "#27ae60" }}>Parabéns!</h3>
        <p>Você completou todos os desafios disponíveis para a <strong>{userSerie}</strong>.</p>
        <p style={{ fontSize: "0.9rem" }}>Volte depois para ver se o professor lançou novos.</p>
      </div>
    );
  }

  const desafioAtual = desafiosDisponiveis[perguntaAtual];

  return (
    <div style={{ background: "#fff", padding: "15px", borderRadius: "10px", border: "1px solid #ddd", animation: "fadeIn 0.3s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
        <strong>Questão Restante {perguntaAtual + 1} de {desafiosDisponiveis.length}</strong>
        <span style={{ fontWeight: "bold", color: "#9b59b6" }}>Valendo {desafioAtual.pontos} J</span>
      </div>

      {feedback ? (
        <div style={{ padding: "20px", textAlign: "center", background: feedback.includes("Acertou") ? "#dff0d8" : "#f2dede", color: feedback.includes("Acertou") ? "#3c763d" : "#a94442", borderRadius: "5px", fontWeight: "bold" }}>
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
  );
};

export default Desafios;