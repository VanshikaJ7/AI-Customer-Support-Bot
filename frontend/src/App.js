import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input;
    setMessages([...messages, { sender: 'user', text: userMessage, timestamp: new Date() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: userMessage }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      
      const botMessage = {
        sender: 'bot',
        text: data.escalated ? data.message : data.response,
        timestamp: new Date(),
        escalated: data.escalated || false
      };

      setMessages((msgs) => [...msgs, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((msgs) => [...msgs, { 
        sender: 'bot', 
        text: '❌ Connection error. Please ensure the backend server is running.',
        timestamp: new Date()
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

  const styles = {
    container: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '400px',
      height: '85vh',
      maxHeight: '500px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      zIndex: 1000,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    floatingButton: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#2563eb',
      color: 'white',
      borderRadius: '50%',
      width: '64px',
      height: '64px',
      border: 'none',
      boxShadow: '0 10px 40px rgba(37,99,235,0.4)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '28px',
      transition: 'all 0.3s',
      zIndex: 1000
    },
    header: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    avatar: {
      width: '40px',
      height: '40px',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px'
    },
    headerTitle: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '600'
    },
    headerSubtitle: {
      margin: 0,
      fontSize: '12px',
      opacity: 0.9
    },
    minimizeButton: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      padding: '8px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '18px',
      transition: 'background 0.2s'
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
      backgroundColor: '#f9fafb'
    },
    emptyState: {
      textAlign: 'center',
      paddingTop: '80px'
    },
    emptyIcon: {
      width: '64px',
      height: '64px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      borderRadius: '50%',
      margin: '0 auto 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      color: 'white'
    },
    messageRow: {
      display: 'flex',
      marginBottom: '16px'
    },
    messageContent: {
      display: 'flex',
      gap: '8px',
      maxWidth: '80%'
    },
    messageAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: '600',
      color: 'white',
      flexShrink: 0
    },
    messageBubble: {
      borderRadius: '16px',
      padding: '12px 16px',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    timestamp: {
      fontSize: '11px',
      color: '#9ca3af',
      marginTop: '4px',
      paddingLeft: '8px'
    },
    typingIndicator: {
      display: 'flex',
      gap: '4px',
      padding: '12px'
    },
    typingDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#9ca3af',
      borderRadius: '50%',
      animation: 'bounce 1.4s infinite ease-in-out'
    },
    inputContainer: {
      padding: '16px',
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb'
    },
    inputWrapper: {
      display: 'flex',
      gap: '8px'
    },
    input: {
      flex: 1,
      padding: '12px 16px',
      fontSize: '14px',
      border: '1px solid #d1d5db',
      borderRadius: '12px',
      outline: 'none'
    },
    sendButton: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap'
    },
    helperText: {
      fontSize: '11px',
      color: '#9ca3af',
      textAlign: 'center',
      marginTop: '8px'
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={styles.floatingButton}
      >
        💬
      </button>
    );
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
          .typing-dot-1 { animation-delay: -0.32s; }
          .typing-dot-2 { animation-delay: -0.16s; }
        `}
      </style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>💬</div>
          <div>
            <h2 style={styles.headerTitle}>Customer Support</h2>
            <p style={styles.headerSubtitle}>We're here to help!</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={styles.minimizeButton}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        >
          ➖
        </button>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💬</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              Welcome to Support! 👋
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Ask me anything - I'm here to help you 24/7
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div 
            key={i} 
            style={{
              ...styles.messageRow,
              justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              ...styles.messageContent,
              flexDirection: m.sender === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                ...styles.messageAvatar,
                background: m.sender === 'user' 
                  ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' 
                  : 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'
              }}>
                {m.sender === 'user' ? 'You' : 'AI'}
              </div>

              <div>
                <div style={{
                  ...styles.messageBubble,
                  background: m.sender === 'user'
                    ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                    : m.escalated
                    ? 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)'
                    : 'white',
                  color: m.sender === 'user' || m.escalated ? 'white' : '#1f2937',
                  boxShadow: m.sender !== 'user' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  border: m.sender !== 'user' ? '1px solid #e5e7eb' : 'none'
                }}>
                  {m.text}
                </div>
                <div style={styles.timestamp}>
                  {m.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={styles.messageRow}>
            <div style={styles.messageContent}>
              <div style={{
                ...styles.messageAvatar,
                background: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'
              }}>
                AI
              </div>
              <div style={{
                ...styles.messageBubble,
                background: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={styles.typingIndicator}>
                  <div style={styles.typingDot} className="typing-dot-1"></div>
                  <div style={styles.typingDot} className="typing-dot-2"></div>
                  <div style={styles.typingDot}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputContainer}>
        <div style={styles.inputWrapper}>
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..." 
            style={styles.input}
            disabled={loading}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              ...styles.sendButton,
              opacity: loading || !input.trim() ? 0.5 : 1,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!loading && input.trim()) {
                e.target.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Send
          </button>
        </div>
        <p style={styles.helperText}>Press Enter to send</p>
      </div>
    </div>
  );
}

export default App;