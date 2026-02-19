import React, { useState } from 'react';
import axios from 'axios';

export default function TelaAdmin() {
  const [aba, setAba] = useState('DESAFIOS'); 

  const abas = [
    { id: 'DESAFIOS', icone: '⚔️', texto: 'Desafios' },
    { id: 'MURAL', icone: '📅', texto: 'Mural' },
    { id: 'NOTICIAS', icone: '📢', texto: 'Notícias' },
    { id: 'QUESTOES', icone: '🧠', texto: 'Treino' },
    { id: 'MATERIAIS', icone: '📚', texto: 'Materiais' },
    { id: 'LINKS', icone: '🔗', texto: 'Links' }
  ];

  return (
    <div style={{maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', animation: 'fadeIn 0.5s' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>👨‍🏫 Painel do Professor</h2>
      
      {/* MENU DE ABAS (Flex-wrap para caber tudo) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', borderBottom: '3px solid #2c3e50', marginBottom: '20px' }}>
        {abas.map(item => (
          <button 
            key={item.id} 
            onClick={() => setAba(item.id)} 
            style={{
              flex: '1 1 auto', padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
              background: aba === item.id ? '#2c3e50' : '#ecf0f1',
              color: aba === item.id ? 'white' : '#7f8c8d',
              borderRadius: '5px 5px 0 0'
            }}
          >
            {item.icone} {item.texto}
          </button>
        ))}
      </div>

      {aba === 'MURAL' && <FormMural />}
      {aba === 'NOTICIAS' && <FormNoticia />}
      {aba === 'DESAFIOS' && <FormDesafio />}
      {aba === 'QUESTOES' && <FormQuestao />}
      {aba === 'MATERIAIS' && <FormMaterial />}
      {aba === 'LINKS' && <FormLink />}
    </div>
  );
}

// ==========================================
// 1. FORMULÁRIO: MURAL (Avisos de Provas/Aulas)
// ==========================================
function FormMural() {
  const [form, setForm] = useState({ titulo: '', dataEvento: '', tipo: 'evento', descricao: '' });

  const salvar = async () => {
    try {
      await axios.post('/admin/mural', form);
      alert('✅ Aviso salvo no Mural!');
      setForm({ titulo: '', dataEvento: '', tipo: 'evento', descricao: '' });
    } catch (e) { alert('❌ Erro.'); }
  };

  const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };

  return (
    <div>
      <input placeholder="Título do Aviso (Ex: Prova Bimestral)" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} style={inputStyle} />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        {/* INPUT TIPO DATE (Gera automaticamente no formato YYYY-MM-DD) */}
        <input type="date" value={form.dataEvento} onChange={e => setForm({...form, dataEvento: e.target.value})} style={inputStyle} />
        
        {/* SELECT PARA O TIPO (Cores do calendário) */}
        <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} style={inputStyle}>
          <option value="prova">🔴 Prova</option>
          <option value="entrega">🟠 Entrega de Trabalho</option>
          <option value="evento">🔵 Evento / Feira</option>
        </select>
      </div>

      <textarea placeholder="Descrição detalhada..." value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} style={{...inputStyle, height: '80px'}} />
      <button onClick={salvar} style={{ width: '100%', background: '#27ae60', color: 'white', padding: '15px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Fixar no Mural 📌</button>
    </div>
  );
}

// ==========================================
// 2. FORMULÁRIO: NOTÍCIAS
// ==========================================
function FormNoticia() {
  const [form, setForm] = useState({ titulo: '', conteudo: '' });

  const salvar = async () => {
    try {
      await axios.post('/admin/noticias', form);
      alert('✅ Notícia Publicada!');
      setForm({ titulo: '', conteudo: '' });
    } catch (e) { alert('❌ Erro.'); }
  };

  const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };

  return (
    <div>
      <input placeholder="Manchete da Notícia" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} style={inputStyle} />
      <textarea placeholder="Texto completo da notícia..." value={form.conteudo} onChange={e => setForm({...form, conteudo: e.target.value})} style={{...inputStyle, height: '150px'}} />
      <button onClick={salvar} style={{ width: '100%', background: '#8e44ad', color: 'white', padding: '15px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Publicar Notícia 📢</button>
    </div>
  );
}

// ==========================================
// 3. FORMULÁRIO: DESAFIOS OFICIAIS
// ==========================================
function FormDesafio() {
  const [form, setForm] = useState({
    serie: '3serie', pergunta: '', pontos: 50, respostaCorreta: '', op1: '', op2: '', op3: '', op4: ''
  });

  const salvar = async () => {
    // Coleta apenas as opções preenchidas
    const opcoesPreenchidas = [form.op1, form.op2, form.op3, form.op4].filter(op => op.trim() !== '');
    
    if (opcoesPreenchidas.length < 2) return alert("Adicione pelo menos 2 opções!");
    if (!opcoesPreenchidas.includes(form.respostaCorreta)) return alert("A resposta correta precisa ser idêntica a uma das opções escritas!");

    const payload = {
      serie: form.serie,
      pergunta: form.pergunta,
      pontos: Number(form.pontos),
      opcoes: opcoesPreenchidas,
      correta: form.respostaCorreta
    };

    try {
      await axios.post('/admin/desafios', payload);
      alert('✅ Desafio Lançado!');
      setForm({...form, pergunta: '', respostaCorreta: '', op1: '', op2: '', op3: '', op4: ''});
    } catch (e) { alert('❌ Erro.'); }
  };

  const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <select value={form.serie} onChange={e => setForm({...form, serie: e.target.value})} style={inputStyle}>
          <option value="9ano">9º Ano</option>
          <option value="1serie">1ª Série</option>
          <option value="2serie">2ª Série</option>
          <option value="3serie">3ª Série</option>
        </select>
        <input type="number" placeholder="Valendo J (Energia)" value={form.pontos} onChange={e => setForm({...form, pontos: e.target.value})} style={inputStyle} />
      </div>

      <textarea placeholder="Qual é o Desafio?" value={form.pergunta} onChange={e => setForm({...form, pergunta: e.target.value})} style={{...inputStyle, height: '80px'}} />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <input placeholder="Opção 1" value={form.op1} onChange={e => setForm({...form, op1: e.target.value})} style={inputStyle} />
        <input placeholder="Opção 2" value={form.op2} onChange={e => setForm({...form, op2: e.target.value})} style={inputStyle} />
        <input placeholder="Opção 3" value={form.op3} onChange={e => setForm({...form, op3: e.target.value})} style={inputStyle} />
        <input placeholder="Opção 4" value={form.op4} onChange={e => setForm({...form, op4: e.target.value})} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Copie a resposta correta aqui (Idêntica à opção):</label>
        <input placeholder="Ex: Newton" value={form.respostaCorreta} onChange={e => setForm({...form, respostaCorreta: e.target.value})} style={{...inputStyle, border: '2px solid #27ae60'}} />
      </div>

      <button onClick={salvar} style={{ width: '100%', background: '#e74c3c', color: 'white', padding: '15px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Lançar Desafio ⚔️</button>
    </div>
  );
}

// ==========================================
// FORMULÁRIO: NOVA QUESTÃO
// ==========================================
function FormQuestao() {
  const [form, setForm] = useState({
    enunciado: '', area: 'Mecânica', dificuldade: 'Fácil', xp: 10, respostaCorreta: 'a',
    altA: '', altB: '', altC: '', altD: ''
  });

  const salvar = async () => {
    if (!form.enunciado || !form.altA || !form.altB) return alert("Preencha o enunciado e pelo menos as alternativas A e B!");
    
    const payload = {
      enunciado: form.enunciado, area: form.area, dificuldade: form.dificuldade, xp: Number(form.xp), respostaCorreta: form.respostaCorreta,
      alternativas: [
        { id: 'a', texto: form.altA }, { id: 'b', texto: form.altB },
        { id: 'c', texto: form.altC }, { id: 'd', texto: form.altD }
      ].filter(alt => alt.texto !== '') // Remove alternativas vazias se tiver
    };

    try {
      await axios.post('/admin/questoes', payload);
      alert('✅ Questão salva com sucesso!');
      setForm({ ...form, enunciado: '', altA: '', altB: '', altC: '', altD: '' }); // Limpa form
    } catch (e) { alert('❌ Erro ao salvar questão.'); }
  };

  const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };

  return (
    <div>
      <textarea placeholder="Enunciado da Questão..." value={form.enunciado} onChange={e => setForm({...form, enunciado: e.target.value})} style={{...inputStyle, height: '100px', resize: 'vertical'}} />
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <select value={form.area} onChange={e => setForm({...form, area: e.target.value})} style={inputStyle}>
          <option>Mecânica</option><option>Termodinâmica</option><option>Óptica</option><option>Ondulatória</option><option>Eletromagnetismo</option>
        </select>
        <select value={form.dificuldade} onChange={e => setForm({...form, dificuldade: e.target.value})} style={inputStyle}>
          <option>Fácil</option><option>Médio</option><option>Difícil</option>
        </select>
        <input type="number" placeholder="XP" value={form.xp} onChange={e => setForm({...form, xp: e.target.value})} style={inputStyle} />
      </div>

      <input placeholder="Alternativa A" value={form.altA} onChange={e => setForm({...form, altA: e.target.value})} style={inputStyle} />
      <input placeholder="Alternativa B" value={form.altB} onChange={e => setForm({...form, altB: e.target.value})} style={inputStyle} />
      <input placeholder="Alternativa C" value={form.altC} onChange={e => setForm({...form, altC: e.target.value})} style={inputStyle} />
      <input placeholder="Alternativa D" value={form.altD} onChange={e => setForm({...form, altD: e.target.value})} style={inputStyle} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <label style={{ fontWeight: 'bold' }}>Resposta Correta:</label>
        <select value={form.respostaCorreta} onChange={e => setForm({...form, respostaCorreta: e.target.value})} style={{ padding: '10px', borderRadius: '5px' }}>
          <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
        </select>
      </div>

      <button onClick={salvar} style={{ width: '100%', background: '#27ae60', color: 'white', padding: '15px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>Salvar Questão 🚀</button>
    </div>
  );
}

// ==========================================
// FORMULÁRIO: NOVO MATERIAL
// ==========================================
function FormMaterial() {
  const [form, setForm] = useState({ titulo: '', descricao: '', categoria: 'Geral', tipo: 'LINK', url: '' });

  const salvar = async () => {
    if (!form.titulo || !form.url) return alert("Título e URL são obrigatórios!");
    try {
      await axios.post('/admin/materiais', form);
      alert('✅ Material postado!');
      setForm({ ...form, titulo: '', descricao: '', url: '' });
    } catch (e) { alert('❌ Erro ao salvar material.'); }
  };

  const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };

  return (
    <div>
      <input placeholder="Título do Material" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} style={inputStyle} />
      <textarea placeholder="Descrição (opcional)" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} style={{...inputStyle, height: '80px'}} />
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} style={inputStyle}>
          <option>Geral</option><option>Mecânica</option><option>Termodinâmica</option><option>Óptica</option><option>Ondulatória</option><option>Eletromagnetismo</option>
        </select>
        <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} style={inputStyle}>
          <option>LINK</option><option>PDF</option><option>FOTO</option><option>VIDEO</option>
        </select>
      </div>

      <input placeholder="URL (Link do Drive, YouTube, Imagem...)" value={form.url} onChange={e => setForm({...form, url: e.target.value})} style={inputStyle} />
      <button onClick={salvar} style={{ width: '100%', background: '#e67e22', color: 'white', padding: '15px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>Postar Material 📚</button>
    </div>
  );
}

// ==========================================
// FORMULÁRIO: NOVO LINK
// ==========================================
function FormLink() {
  const [form, setForm] = useState({ titulo: '', descricao: '', categoria: 'Artigos', url: '' });

  const salvar = async () => {
    if (!form.titulo || !form.url) return alert("Título e URL são obrigatórios!");
    try {
      await axios.post('/admin/links', form);
      alert('✅ Link salvo!');
      setForm({ ...form, titulo: '', descricao: '', url: '' });
    } catch (e) { alert('❌ Erro ao salvar link.'); }
  };

  const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };

  return (
    <div>
      <input placeholder="Título do Link (Ex: PhET Colorado)" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} style={inputStyle} />
      <textarea placeholder="Descrição do que o aluno vai encontrar lá..." value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} style={{...inputStyle, height: '80px'}} />
      
      <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} style={inputStyle}>
        <option>Simuladores</option><option>Vídeos</option><option>Artigos</option><option>Ferramentas</option>
      </select>

      <input placeholder="URL (Link do site)" value={form.url} onChange={e => setForm({...form, url: e.target.value})} style={inputStyle} />
      <button onClick={salvar} style={{ width: '100%', background: '#3498db', color: 'white', padding: '15px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>Adicionar Link 🔗</button>
    </div>
  );
}