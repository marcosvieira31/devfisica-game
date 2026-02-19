import React, { useState } from 'react';
import TelaTreino from './TelaTreino';
import TelaMateriais from './TelaMateriais'; 
import TelaLinks from './TelaLinks';

// Importe os componentes originais que estavam no App.jsx
import Desafios from './Desafios'; // Ajuste o caminho se necessário
import Ranking from './Ranking';   // Ajuste o caminho se necessário

export default function TelaEstudos({ usuarioEmail, userSerie, desafiosConcluidos, aoGanharPontos }) {
  const [modoAtual, setModoAtual] = useState('MENU'); // MENU, TREINO, RANKING, DESAFIOS, MATERIAIS

  // --- MENU PRINCIPAL (DASHBOARD) ---
  if (modoAtual === 'MENU') {
    return (
      <div >
        <h3 style={{color: "rgb(44, 62, 80)", marginBottom: "15px"}}>
          📚 Central de Estudos
        </h3>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px' 
        }}>
          
          {/* BOTÃO 1: BANCO DE QUESTÕES (TREINO) */}
          <CardMenu 
            titulo="Banco de Questões" 
            icone="🧠"
            desc="Treine questões e acrescente sua pontuação no Ranking!"
            cor="#3498db"
            onClick={() => setModoAtual('TREINO')}
          />

          {/* BOTÃO 2: DESAFIOS OFICIAIS */}
          <CardMenu 
            titulo="Desafios" 
            icone="⚔️"
            desc="Missões que valem muito para o Ranking e Loja!"
            cor="#f1c40f"
            onClick={() => setModoAtual('DESAFIOS')}
          />

          {/* BOTÃO 3: RANKING GERAL */}
          <CardMenu 
            titulo="Ver Ranking" 
            icone="🏆"
            desc="Veja quem está liderando a série."
            cor="#9b59b6" // Roxo
            onClick={() => setModoAtual('RANKING')}
          />

          {/* BOTÃO 4: MATERIAIS */}
          <CardMenu 
            titulo="Materiais de Aula" 
            icone="📝"
            desc="Fotos do quadro e PDFs."
            cor="#e67e22"
            onClick={() => setModoAtual('MATERIAIS')}
          />

                    {/* BOTÃO 4: MATERIAIS */}
          <CardMenu 
            titulo="Links Úteis" 
            icone="🔗"
            desc="Sites úteis para estudo da Física."
            cor="#e60e22"
            onClick={() => setModoAtual('LINKS')}
          />

        </div>
      </div>
    );
  }

  // --- BOTÃO DE VOLTAR (Comum a todas as telas internas) ---
  const BotaoVoltar = () => (
    <button 
      onClick={() => setModoAtual('MENU')}
      style={{ 
        marginBottom: '20px', 
        cursor: 'pointer', 
        padding: '8px 15px',
        background: '#2c3e50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontWeight: 'bold'
      }}
    >
      ⬅ Voltar ao Menu de Estudos
    </button>
  );

  // --- ROTEAMENTO INTERNO ---
  return (
    <div >
      <BotaoVoltar />

      {modoAtual === 'TREINO' && (
        <TelaTreino usuarioEmail={usuarioEmail} />
      )}

      {modoAtual === 'MATERIAIS' && (
        <TelaMateriais aoVoltar={() => setModoAtual('MENU')} />
      )}

      {modoAtual === 'DESAFIOS' && (
        <Desafios 
          userSerie={userSerie} 
          desafiosConcluidos={desafiosConcluidos}
          aoGanharPontos={aoGanharPontos}
          // AQUI ESTÁ A MÁGICA QUE FALTAVA:
          aoVerRanking={() => setModoAtual('RANKING')} 
        />
      )}

      {modoAtual === 'RANKING' && (
        <div style={{ background: 'white', borderRadius: '10px' }}>
           {/* Reutilizando o componente de Ranking que você já tinha */}
           <Ranking serieUsuario={userSerie} />
        </div>
      )}
        {modoAtual === 'LINKS' && (
            <TelaLinks aoVoltar={() => setModoAtual('MENU')} />
        )}
    </div>
  );
}

// Componente visual dos cartões
function CardMenu({ titulo, icone, desc, cor, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: 'white',
        borderLeft: `5px solid ${cor}`,
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{fontSize: '35px' }}>{icone}</div>
      <div style={{marginLeft: '10px' }}>
      <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{titulo}</h3>
      <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>{desc}</p>
      </div>
      </div>
  );
}