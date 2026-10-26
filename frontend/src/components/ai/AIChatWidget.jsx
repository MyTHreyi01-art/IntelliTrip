import React, { useEffect, useRef, useState } from 'react';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, MessageSquare, X, Send, Bot, User } from 'lucide-react';

const formatAssistantReply = (text) => text
  .split('\n')
  .map((line) => line
    .replace(/^\s*#{1,6}\s*/, '')
    .replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim())
  .filter(Boolean)
  .join('\n');

const AIChatWidget = () => {
  const { user } = useAuth();
  const chatOwner = `${user?._id || user?.id || 'guest'}:${user?.role || 'guest'}`;
  const activeOwner = useRef(chatOwner);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your IntelliTrip AI Assistant. How can I help plan your next trip or answer travel questions?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    activeOwner.current = chatOwner;
    setMessages([{
      sender: 'assistant',
      text: 'Hello! I am your IntelliTrip AI Assistant. How can I help plan your next trip or answer travel questions?'
    }]);
    setInput('');
    setLoading(false);
  }, [chatOwner]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    const requestOwner = chatOwner;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const conversationHistory = messages.slice(-8).map(({ sender, text }) => ({
        role: sender,
        content: text
      }));
      const res = await aiService.askAssistant(userText, conversationHistory);
      if (activeOwner.current !== requestOwner) return;
      const replyText = res.data && res.data.reply ? res.data.reply : 'I recommend exploring our curated destinations and AI planner!';
      setMessages((prev) => [...prev, { sender: 'assistant', text: replyText }]);
    } catch (err) {
      if (activeOwner.current !== requestOwner) return;
      setMessages((prev) => [...prev, { sender: 'assistant', text: 'Sorry, I ran into an error processing your query. Please try again.' }]);
    } finally {
      if (activeOwner.current === requestOwner) setLoading(false);
    }
  };

  return (
    <div style={styles.widgetWrapper}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} style={styles.floatingBtn}>
          <Sparkles size={22} color="#ffffff" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>AI Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-card" style={styles.chatWindow}>
          {/* Header */}
          <div style={styles.chatHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={styles.botIconCircle}>
                <Bot size={18} color="#ffffff" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>IntelliTrip AI Assistant</h4>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Powered by Google Gemini</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
              <X size={18} color="#ffffff" />
            </button>
          </div>

          {/* Messages Body */}
          <div style={styles.messagesBody}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.msgBubble,
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user'
                    ? 'linear-gradient(135deg, #d4af37, #aa820a)'
                    : 'rgba(56, 20, 63, 0.7)',
                  color: msg.sender === 'user' ? '#150917' : '#f0e8f5',
                  border: msg.sender === 'user'
                    ? 'none'
                    : '1px solid rgba(212, 175, 55, 0.2)',
                }}
              >
                <p style={{ fontSize: '0.85rem', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>{msg.sender === 'assistant' ? formatAssistantReply(msg.text) : msg.text}</p>
              </div>
            ))}
            {loading && (
              <div style={{ ...styles.msgBubble, alignSelf: 'flex-start', background: 'rgba(56,20,63,0.5)', border: '1px solid rgba(212,175,55,0.15)' }}>
                <span style={{ fontSize: '0.8rem', color: '#bda3c4' }}>AI Assistant is thinking...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} style={styles.chatFooter}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. Plan a 4-day trip to Mysore...)"
              style={styles.chatInput}
            />
            <button type="submit" disabled={loading} style={styles.sendBtn}>
              <Send size={16} color="#ffffff" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const styles = {
  widgetWrapper: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999
  },
  floatingBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    borderRadius: '9999px',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 8px 20px rgba(2, 132, 199, 0.4)',
    cursor: 'pointer'
  },
  chatWindow: {
    width: '360px',
    height: '480px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
    background: '#150917',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '12px',
  },
  chatHeader: {
    background: '#0f172a',
    padding: '0.85rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  botIconCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  messagesBody: {
    flex: 1,
    padding: '1rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    background: '#0f0712',
  },
  msgBubble: {
    maxWidth: '85%',
    padding: '0.65rem 0.85rem',
    borderRadius: '0.75rem'
  },
  chatFooter: {
    padding: '0.75rem',
    borderTop: '1px solid rgba(212, 175, 55, 0.2)',
    display: 'flex',
    gap: '0.4rem',
    background: 'rgba(21, 9, 23, 0.95)'
  },
  chatInput: {
    flex: 1,
    padding: '0.55rem 0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    background: 'rgba(31, 14, 34, 0.8)',
    color: '#f8fafc',
    fontSize: '0.8rem',
    outline: 'none'
  },
  sendBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '0.5rem',
    background: 'var(--color-primary)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  }
};

export default AIChatWidget;
