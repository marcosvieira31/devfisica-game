import React, { useState } from 'react';
import axios from 'axios';

export default function TelaTreino({ usuarioEmail }) {
  const [etapa, setEtapa] = useState('CONFIG'); // CONFIG ou QUIZ
  const [questoes, setQuestoes] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [feedback, setFeedback] = useState(null); // Para mostrar se acertou na hora
  const [jaErrou, setJaErrou] = useState(false);

  // Filtros selecionados pelo aluno
  const [area, setArea] = useState('Mecânica');
  const [dificuldade, setDificuldade] = useState('Fácil');

  // --- BUSCAR QUESTÕES NO BACKEND ---
  const iniciarTreino = async () => {
    try {
      const res = await axios.post('/treino/buscar', {
        area,
        dificuldade,
        email: usuarioEmail // <--- ADICIONE ESTA LINHA
      });
      
      if (res.data.length === 0) {
        alert("🎉 Você zerou todas as questões desse nível! Aguarde o professor cadastrar mais.");
        return;
      }
      
      // ... resto do código igual ...
      setQuestoes(res.data);
      setEtapa('QUIZ');
      setIndiceAtual(0);
      setFeedback(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar questões.");
    }
  };

 // --- RESPONDER ---
  const responder = async (alternativaId) => {
    const questaoAtual = questoes[indiceAtual];

    // O "jaErrou" aqui serve apenas para controle local, caso você queira
    // implementar alguma lógica visual, mas para o avanço vamos ignorar.
    const ehPrimeiraTentativa = !jaErrou;

    try {
      const res = await axios.post('/treino/responder', {
        email: usuarioEmail,
        questaoId: questaoAtual._id,
        respostaDoAluno: alternativaId,
        primeiraTentativa: ehPrimeiraTentativa
      });

      // 1. DEFINE O FEEDBACK (Visual)
      if (res.data.resultado === 'acertou') {
        setFeedback({ 
          tipo: 'sucesso', 
          msg: res.data.mensagem 
        });
      } else {
        // Se errou, mostramos a mensagem e qual era a certa (opcional)
        // Se preferir não mostrar a resposta certa para dificultar, apague a parte do res.data.respostaCerta
        setFeedback({ 
          tipo: 'erro', 
          msg: `Que pena! Você errou. Vamos para a próxima.` 
        });
      }

      // 2. AVANÇA PARA A PRÓXIMA (Independente se acertou ou errou)
      // O setTimeout agora roda para os dois casos
      setTimeout(() => {
        setFeedback(null); // Limpa o feedback (destrava botões)
        setJaErrou(false); // Reseta para a próxima questão ser "nova"

        if (indiceAtual + 1 < questoes.length) {
          setIndiceAtual(prev => prev + 1); // Vai pra próxima
        } else {
          alert("Treino Concluído! 🎉");
          setEtapa('CONFIG'); // Volta pro menu
        }
      }, 2500); // 2.5 segundos para ler a mensagem

    } catch (error) {
      alert("Erro de conexão com o servidor.");
    }
  };

  // --- TELA DE CONFIGURAÇÃO ---
  if (etapa === 'CONFIG') {
    return (
      <div style={{textAlign: 'center' }}>
        <h3>Configurar Treino 🧠</h3>
        
        <div style={{ margin: '20px 0' }}>
          <label>Área da Física:</label><br/>
          <select value={area} onChange={e => setArea(e.target.value)} style={{ padding: '10px', marginTop: '5px', borderRadius: "8px" }}>
            <option>Mecânica</option>
            <option>Termodinâmica</option>
            <option>Óptica</option>
            <option>Ondulatória</option>
            <option>Eletromagnetismo</option>
          </select>
        </div>

        <div style={{ margin: '20px 0' }}>
          <label>Dificuldade:</label><br/>
          <select value={dificuldade} onChange={e => setDificuldade(e.target.value)} style={{ padding: '10px', marginTop: '5px', borderRadius: "8px" }}>
            <option>Fácil</option>
            <option>Médio</option>
            <option>Difícil</option>
          </select>
        </div>

        <button 
          onClick={iniciarTreino}
          style={{ background: '#3498db', color: 'white', padding: '10px 30px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          INICIAR TREINO
        </button>
      </div>
    );
  }

  // --- TELA DO QUIZ ---
  const q = questoes[indiceAtual];
  
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span>Questão {indiceAtual + 1}/{questoes.length}</span>
        <span style={{ fontWeight: 'bold', color: '#3498db' }}>{q.xp} XP</span>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <p style={{ fontSize: '18px' }}>{q.enunciado}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          {q.alternativas.map(alt => (
            <button
              key={alt.id}
              onClick={() => !feedback && responder(alt.id)} // Bloqueia clique se já respondeu
              disabled={!!feedback}
              style={{
                padding: '15px',
                color: "#000",
                textAlign: 'left',
                border: '1px solid #ddd',
                borderRadius: '5px',
                background: feedback && alt.id === feedback.respostaCerta ? '#d4edda' : '#f8f9fa', // Se quiser mostrar a certa visualmente depois
                cursor: feedback ? 'default' : 'pointer'
              }}
            >
              {alt.texto}
            </button>
          ))}
        </div>

        {/* FEEDBACK VISUAL */}
        {feedback && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            borderRadius: '5px',
            backgroundColor: feedback.tipo === 'sucesso' ? '#d4edda' : '#f8d7da',
            color: feedback.tipo === 'sucesso' ? '#155724' : '#721c24',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {feedback.msg}
          </div>
        )}
      </div>
    </div>
  );
}