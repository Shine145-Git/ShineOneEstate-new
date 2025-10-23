import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [quickQuestions, setQuickQuestions] = useState([]);

  const sendMessage = async (message, parentId = null) => {
    const msgToSend = message || input;
    if (!msgToSend) return;
    setMessages(prevMessages => [...prevMessages, { sender: 'user', text: msgToSend }]);

    try {
      const res = await axios.post(`${process.env.REACT_APP_CHATBOT_API}`, { message: msgToSend, parentId });
      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: res.data.reply }]);
      setQuickQuestions(res.data.options || []);
    } catch (error) {
      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: 'Error connecting to chatbot.' }]);
      setQuickQuestions([]);
      console.error('Chatbot API error:', error);
    }

    if (!message) setInput('');
  };

  useEffect(() => {
    // Load initial quick questions from backend on component mount
    const loadInitialQuestions = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_CHATBOT_API}/initial-questions`);
        setQuickQuestions(res.data.options || []);
      } catch (error) {
        console.error('Error loading initial quick questions:', error);
      }
    };
    loadInitialQuestions();
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: 'auto', border: '1px solid #ccc', borderRadius: 10, height: '500px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, paddingBottom: 140 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', padding: 10, borderRadius: 8, background: msg.sender === 'user' ? '#22D3EE' : '#F4F7F9', margin: '5px 0' }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: 'sticky', bottom: 0, background: '#fff', padding: 20, borderTop: '1px solid #ccc', borderRadius: '0 0 10px 10px' }}>
        <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap' }}>
          {quickQuestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(question.text, question.id)}
              style={{ marginRight: 8, marginBottom: 8, padding: '6px 12px', borderRadius: '6px', background: '#e0e0e0', border: 'none', cursor: 'pointer' }}
            >
              {question.text}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <button onClick={() => sendMessage()} style={{ padding: '10px 20px', borderRadius: '6px', background: '#22D3EE', color: '#fff', border: 'none', cursor: 'pointer' }}>Send</button>
        </div>
      </div>
    </div>
  );
}