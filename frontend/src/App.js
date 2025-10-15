import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [sessionId, setSessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showFAQs, setShowFAQs] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [faqSearch, setFaqSearch] = useState('');
  const [allSessions, setAllSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadAllSessions();
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const res = await fetch('http://localhost:5000/faqs');
      if (res.ok) {
        const data = await res.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error('Error loading FAQs:', error);
    }
  };

  const loadAllSessions = async () => {
    try {
      const res = await fetch('http://localhost:5000/sessions');
      if (res.ok) {
        const data = await res.json();
        setAllSessions(data);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadSessionDetail = async (sid) => {
    try {
      const res = await fetch(`http://localhost:5000/session/${sid}`);
      if (res.ok) {
        const data = await res.json();
        const loadedMessages = data.map(item => [
          { sender: 'user', text: item.user, timestamp: new Date() },
          { sender: 'bot', text: item.bot, timestamp: new Date() }
        ]).flat();
        setMessages(loadedMessages);
        setSessionId(sid);
        setSelectedSessionId(sid);
        setShowHistory(false);
      }
    } catch (error) {
      console.error('Error loading session detail:', error);
    }
  };

  const startNewChat = () => {
    const newSessionId = Math.random().toString(36).substring(2, 15);
    setSessionId(newSessionId);
    setMessages([]);
    setSelectedSessionId(null);
    setShowHistory(false);
  };

  const deleteSession = async (sid, e) => {
    e.stopPropagation(); // Prevent triggering the click to load session
    
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/session/${sid}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // Refresh sessions list
        loadAllSessions();
        
        // If deleted session was currently loaded, clear it
        if (selectedSessionId === sid) {
          startNewChat();
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete conversation');
    }
  };

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
      
      // Refresh sessions list after new message
      loadAllSessions();
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
      width: '100%',
      maxWidth: '500px',
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
    },
    historyButton: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      transition: 'background 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    historyModal: {
      position: 'absolute',
      top: '60px',
      left: '20px',
      right: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 1001,
      border: '1px solid #e5e7eb'
    },
    historyHeader: {
      padding: '16px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      backgroundColor: 'white',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px'
    },
    historyContent: {
      padding: '16px'
    },
    historyItem: {
      padding: '12px',
      borderBottom: '1px solid #f3f4f6',
      cursor: 'pointer',
      transition: 'background 0.2s',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    historyItemContent: {
      flex: 1,
      minWidth: 0
    },
    deleteButton: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer',
      fontSize: '20px',
      padding: '4px 8px',
      borderRadius: '4px',
      transition: 'background 0.2s',
      flexShrink: 0,
      marginLeft: '8px'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '4px'
    },
    faqSearch: {
      width: '100%',
      padding: '10px',
      fontSize: '14px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      marginBottom: '12px',
      marginTop: '4px'
    }
  };

  // FAQ search filter
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
    faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setShowFAQs(true);
              setShowHistory(false);
            }}
            style={styles.historyButton}
          >
            ❓ FAQs
          </button>
          <button
            onClick={startNewChat}
            style={{
              ...styles.historyButton,
              background: 'rgba(255,255,255,0.3)'
            }}
          >
            ➕ New Chat
          </button>
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              setShowFAQs(false);
            }}
            style={styles.historyButton}
          >
            📜 History
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={styles.minimizeButton}
          >
            ➖
          </button>
        </div>
      </div>

      {/* FAQs Modal */}
      {showFAQs && (
        <div style={styles.historyModal}>
          <div style={styles.historyHeader}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              Frequently Asked Questions
            </h3>
            <button
              onClick={() => setShowFAQs(false)}
              style={styles.closeButton}
            >
              ✕
            </button>
          </div>
          <div style={styles.historyContent}>
            <input
              type="text"
              style={styles.faqSearch}
              placeholder="Search FAQs..."
              value={faqSearch}
              onChange={e => setFaqSearch(e.target.value)}
              autoFocus
            />
            {faqs.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                Loading FAQs...
              </p>
            ) : (
              filteredFaqs.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                  No matching FAQs found.
                </p>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <div 
                    key={index} 
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setInput(faq.question);
                      setShowFAQs(false);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb', marginBottom: '8px' }}>
                      Q: {faq.question}
                    </div>
                    <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                      A: {faq.answer}
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}

      {/* Chat History Modal */}
      {showHistory && (
        <div style={styles.historyModal}>
          <div style={styles.historyHeader}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              Previous Conversations
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              style={styles.closeButton}
            >
              ✕
            </button>
          </div>
          <div style={styles.historyContent}>
            {allSessions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                No previous conversations yet. Start chatting!
              </p>
            ) : (
              allSessions.map((session, index) => (
                <div 
                  key={index} 
                  style={{
                    ...styles.historyItem,
                    backgroundColor: selectedSessionId === session.session_id ? '#f0f9ff' : 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedSessionId === session.session_id ? '#f0f9ff' : '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedSessionId === session.session_id ? '#f0f9ff' : 'transparent'}
                >
                  <div 
                    style={styles.historyItemContent}
                    onClick={() => loadSessionDetail(session.session_id)}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      {session.session_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {new Date(session.updated_at).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteSession(session.session_id, e)}
                    style={styles.deleteButton}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    title="Delete conversation"
                  >
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              ...styles.sendButton,
              opacity: loading || !input.trim() ? 0.5 : 1,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
            }}
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