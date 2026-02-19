import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TelaLinks({ aoVoltar }) {
  const [links, setLinks] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Ícones e cores para cada categoria
  const categoriasConfig = {
    Simuladores: { icone: '🎮', cor: '#e67e22' },
    Vídeos: { icone: '🎬', cor: '#e74c3c' },
    Ferramentas: { icone: '🛠️', cor: '#3498db' },
    Artigos: { icone: '📖', cor: '#2ecc71' },
    Outros: { icone: '🔗', cor: '#95a5a6' }
  };

  useEffect(() => {
    async function carregar() {
      try {
        const res = await axios.get('http://localhost:3000/links');
        setLinks(res.data);
      } catch (error) {
        alert("Erro ao carregar links.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button 
          onClick={aoVoltar}
          style={{ marginRight: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
        >
          ⬅
        </button>
        <h2 style={{ color: '#2c3e50', margin: 0 }}>Links Úteis & Ferramentas 🔗</h2>
      </div>

      {carregando ? (
        <p style={{ textAlign: 'center' }}>Carregando...</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '20px' 
        }}>
          {links.map(link => {
            const config = categoriasConfig[link.categoria] || categoriasConfig['Outros'];

            return (
              <a 
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: 'none',
                  background: 'white',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  borderLeft: `6px solid ${config.cor}`,
                  transition: 'transform 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: 'bold', 
                      color: config.cor, 
                      background: `${config.cor}20`, 
                      padding: '3px 8px', 
                      borderRadius: '15px' 
                    }}>
                      {link.categoria.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '24px' }}>{config.icone}</span>
                  </div>
                  
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#2c3e50' }}>{link.titulo}</h3>
                  <p style={{ fontSize: '14px', color: '#7f8c8d', margin: 0, lineHeight: '1.4' }}>{link.descricao}</p>
                </div>
                
                <div style={{ 
                  marginTop: '15px', 
                  fontSize: '14px', 
                  color: config.cor, 
                  fontWeight: 'bold', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px' 
                }}>
                  Acessar Agora ↗
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}