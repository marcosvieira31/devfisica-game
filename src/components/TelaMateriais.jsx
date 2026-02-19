import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TelaMateriais({ aoVoltar }) {
  const [materiais, setMateriais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Ícones para cada tipo
  const icones = {
    PDF: '📄',
    FOTO: '🖼️',
    VIDEO: '🎬',
    LINK: '🔗'
  };

  const cores = {
    Mecânica: '#e74c3c',
    Termodinâmica: '#e67e22',
    Óptica: '#f1c40f',
    Geral: '#3498db'
  };

  useEffect(() => {
    async function carregar() {
      try {
        const res = await axios.get('http://localhost:3000/materiais');
        setMateriais(res.data);
      } catch (error) {
        alert("Erro ao carregar materiais.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button 
          onClick={aoVoltar}
          style={{ marginRight: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
        >
          ⬅
        </button>
        <h2 style={{ color: '#2c3e50', margin: 0 }}>Materiais de Aula 📚</h2>
      </div>

      {carregando ? (
        <p>Carregando biblioteca...</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '20px' 
        }}>
          {materiais.map(item => (
            <div key={item._id} style={{
              background: 'white',
              borderRadius: '10px',
              padding: '15px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderTop: `5px solid ${cores[item.categoria] || '#95a5a6'}`
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d', textTransform: 'uppercase' }}>
                    {item.categoria}
                  </span>
                  <span style={{ fontSize: '20px' }}>{icones[item.tipo]}</span>
                </div>
                
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#2c3e50' }}>{item.titulo}</h3>
                <p style={{ fontSize: '14px', color: '#7f8c8d', margin: '0 0 15px 0' }}>{item.descricao}</p>
              </div>

              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#3498db',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '10px',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  transition: 'background 0.2s'
                }}
              >
                ACESSAR {item.tipo}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}