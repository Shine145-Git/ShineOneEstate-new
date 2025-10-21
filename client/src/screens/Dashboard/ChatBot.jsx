import React, { useState } from 'react';
import axios from 'axios';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input) return;
    setMessages([...messages, { sender: 'user', text: input }]);

    try {
      const res = await axios.post(`${process.env.REACT_APP_CHATBOT_API}`, { message: input });
      setMessages([...messages, { sender: 'user', text: input }, { sender: 'bot', text: res.data.reply }]);
    } catch (error) {
      setMessages([...messages, { sender: 'user', text: input }, { sender: 'bot', text: 'Error connecting to chatbot.' }]);
      console.error('Chatbot API error:', error);
    }

    setInput('');
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', border: '1px solid #ccc', padding: 20, borderRadius: 10 }}>
      <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 10 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', padding: 10, borderRadius: 8, background: msg.sender === 'user' ? '#22D3EE' : '#F4F7F9', margin: '5px 0' }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type your message..."
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
      />
      <button onClick={sendMessage} style={{ padding: '10px 20px', borderRadius: '6px', background: '#22D3EE', color: '#fff', border: 'none', cursor: 'pointer' }}>Send</button>
    </div>
  );
}