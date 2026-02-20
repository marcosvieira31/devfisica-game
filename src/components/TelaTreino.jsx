import React, { useState } from 'react';
import axios from 'axios';

export default function TelaTreino({ usuarioEmail }) {
  const [etapa, setEtapa] = useState('CONFIG'); // CONFIG ou QUIZ
  const [questoes, setQuestoes] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [feedback, setFeedback] = useState(null); 
  const [jaErrou, setJaErrou] = useState(false);

  // 1. FILTROS ATUALIZADOS: Adicionada a Disciplina
  const [disciplina, setDisciplina] = useState('Física');
  const [area, setArea] = useState('Mecânica');
  const [dificuldade, setDificuldade] = useState('Fácil');

  // 2. DICIONÁRIO DE CATEGORIAS (A mesma mágica do Admin)
  const categorias = {
    "Física": ["Mecânica", "Termodinâmica", "Óptica", "Ondulatória", "Eletromagnetismo"],
    "Ciências": ["Química", "Biologia", "Física", "Astronomia"]
  };

  // --- BUSCAR QUESTÕES NO BACKEND ---
  const iniciarTreino = async () => {
    try {
      const res = await axios.post('/treino/buscar', {
        disciplina, // <--- Agora enviamos a disciplina para o banco de dados também!
        area,
        dificuldade,
        email: usuarioEmail 
      });
      
      if (res.data.length === 0) {
        alert("🎉 Você zerou todas as questões desse nível! Aguarde o professor cadastrar mais.");
        return;
      }
      
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
        setFeedback({ 
          tipo: 'erro', 
          msg: `Que pena! Você errou. Vamos para a próxima.` 
        });
      }

      // 2. AVANÇA PARA A PRÓXIMA
      setTimeout(() => {
        setFeedback(null); 
        setJaErrou(false); 

        if (indiceAtual + 1 < questoes.length) {
          setIndiceAtual(prev => prev + 1); 
        } else {
          alert("Treino Concluído! 🎉");
          setEtapa('CONFIG'); 
        }
      }, 2500); 

    } catch (error) {
      alert("Erro de conexão com o servidor.");
    }
  };

  // --- TELA DE CONFIGURAÇÃO ---
  if (etapa === 'CONFIG') {
    return (
      <div style={{textAlign: 'center' }}>
        <h3>Configurar Treino 🧠</h3>
        
        {/* NOVO SELECT: DISCIPLINA */}
        <div style={{ margin: '20px 0' }}>
          <label style={{ fontWeight: "bold" }}>Disciplina:</label><br/>
          <select 
            value={disciplina} 
            onChange={e => {
              const novaDisciplina = e.target.value;
              setDisciplina(novaDisciplina);
              setArea(categorias[novaDisciplina][0]); // Atualiza a área automaticamente
            }} 
            style={{ padding: '10px', marginTop: '5px', borderRadius: "8px", width: "100%", maxWidth: "300px" }}
          >
            <option value="Física">Física (Ensino Médio)</option>
            <option value="Ciências">Ciências (9º Ano)</option>
          </select>
        </div>

        {/* SELECT ATUALIZADO: ÁREA DINÂMICA */}
        <div style={{ margin: '20px 0' }}>
          <label style={{ fontWeight: "bold" }}>Área de Estudo:</label><br/>
          <select 
            value={area} 
            onChange={e => setArea(e.target.value)} 
            style={{ padding: '10px', marginTop: '5px', borderRadius: "8px", width: "100%", maxWidth: "300px" }}
          >
            {categorias[disciplina].map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div style={{ margin: '20px 0' }}>
          <label style={{ fontWeight: "bold" }}>Dificuldade:</label><br/>
          <select 
            value={dificuldade} 
            onChange={e => setDificuldade(e.target.value)} 
            style={{ padding: '10px', marginTop: '5px', borderRadius: "8px", width: "100%", maxWidth: "300px" }}
          >
            <option>Fácil</option>
            <option>Médio</option>
            <option>Difícil</option>
          </select>
        </div>

        <button 
          onClick={iniciarTreino}
          style={{ background: '#3498db', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: "bold", fontSize: "16px", marginTop: "10px" }}
        >
          INICIAR TREINO 🚀
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
        <span style={{ fontWeight: 'bold', color: '#3498db' }}>{q.xp} Pontos</span>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <p style={{ fontSize: '18px' }}>{q.enunciado}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          {q.alternativas.map(alt => (
            <button
              key={alt.id}
              onClick={() => !feedback && responder(alt.id)}
              disabled={!!feedback}
              style={{
                padding: '15px',
                color: "#000",
                textAlign: 'left',
                border: '1px solid #ddd',
                borderRadius: '5px',
                background: feedback && alt.id === feedback.respostaCerta ? '#d4edda' : '#f8f9fa', 
                cursor: feedback ? 'default' : 'pointer'
              }}
            >
              {alt.texto}
            </button>
          ))}
        </div>

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