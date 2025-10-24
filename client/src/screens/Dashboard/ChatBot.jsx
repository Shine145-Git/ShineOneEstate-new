import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [quickQuestions, setQuickQuestions] = useState([]);

  const sendMessage = async (question, parentId = null) => {
    if (!question) return;
    setMessages(prev => [...prev, { sender: 'user', text: question }]);

    // Determine payload based on whether parentId is null or not
    const payload = parentId ? { message: question, parentId } : { message: question };

    // console.log('Sending message:', question);
    // console.log('Parent ID:', parentId);

    try {
      const res = await axios.post(`${process.env.REACT_APP_CHATBOT_API}`, payload);
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);

      // Update quick questions with follow-ups (pick random 3 if more than 3)
      const options = res.data.options || [];
      // console.log('Received options:', options);
      if (options.length > 3) {
        const shuffled = options.sort(() => 0.5 - Math.random());
        setQuickQuestions(shuffled.slice(0, 3));
      } else {
        setQuickQuestions(options);
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to chatbot.' }]);
      setQuickQuestions([]);
      // console.error('Chatbot API error:', error);
    }
  };

  useEffect(() => {
    // Load initial questions
    const loadInitialQuestions = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_CHATBOT_API}/initial-questions`);
        const options = res.data.options || [];
        if (options.length > 3) {
          const shuffled = options.sort(() => 0.5 - Math.random());
          setQuickQuestions(shuffled.slice(0, 3));
        } else {
          setQuickQuestions(options);
        }
      } catch (error) {
        console.error('Error loading initial questions:', error);
      }
    };
    loadInitialQuestions();
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: 'auto', border: '1px solid #ccc', borderRadius: 10, height: '500px', display: 'flex', flexDirection: 'column' }}>
      {/* Chat history */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, paddingBottom: 140 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <div style={{
              display: 'inline-block',
              padding: 10,
              borderRadius: 8,
              background: msg.sender === 'user' ? '#22D3EE' : '#F4F7F9',
              margin: '5px 0'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick question buttons */}
      <div style={{ position: 'sticky', bottom: 0, background: '#fff', padding: 20, borderTop: '1px solid #ccc', borderRadius: '0 0 10px 10px' }}>
        <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap' }}>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q.question, q.id)}
              style={{ marginRight: 8, marginBottom: 8, padding: '8px 12px', borderRadius: '6px', background: '#e0e0e0', border: 'none', cursor: 'pointer' }}
            >
              {q.question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}