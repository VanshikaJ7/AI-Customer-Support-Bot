import React, { useState } from 'react';

function Chat({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages([...messages, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: userMessage }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.escalated) {
        setMessages((msgs) => [...msgs, { sender: 'bot', text: data.message }]);
      } else {
        setMessages((msgs) => [...msgs, { sender: 'bot', text: data.response }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((msgs) => [...msgs, { 
        sender: 'bot', 
        text: '❌ Sorry, I cannot connect to the server. Please make sure the Flask backend is running on http://localhost:5000' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '10px', 
        height: '400px', 
        overflowY: 'auto', 
        marginBottom: '10px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.length === 0 && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: '50px' }}>
            👋 Hello! How can I help you today?
          </div>
        )}
        {messages.map((m, i) => (
          <div 
            key={i} 
            style={{ 
              textAlign: m.sender === 'user' ? 'right' : 'left',
              margin: '10px 0'
            }}
          >
            <div style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: m.sender === 'user' ? '#007bff' : '#e9ecef',
              color: m.sender === 'user' ? 'white' : 'black',
              maxWidth: '70%',
              textAlign: 'left'
            }}>
              <b>{m.sender === 'user' ? 'You' : 'Bot'}:</b> {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: 'left', color: '#888' }}>
            <i>Bot is typing...</i>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..." 
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          disabled={loading}
        />
        <button 
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.6 : 1
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default Chat;