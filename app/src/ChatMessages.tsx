import axios from "axios";
import React, { useState } from "react";
import { FaPaperPlane, FaUserCircle, FaRobot, FaTimes } from 'react-icons/fa';

interface Message {
  message: string;
  type: 'user' | 'assistant';
}

const initialMessages: Message[] = [
  { message: "Hi there! How can I help you today?", type: 'assistant' },
];

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [showHeader, setShowHeader] = useState(true);

  const handleCloseHeader = () => {
    setShowHeader(false);
  };

  const handleMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextMessages = [...messages, { message: inputValue, type: 'user' as const }];
    setMessages(nextMessages);
    setInputValue("");

    (async () => {
      const response = await axios.post('http://localhost:3000/api/rivet-example', { input: nextMessages });
      setMessages([...nextMessages, { message: response.data.output, type: 'assistant' as const }]);
    })();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100vh' }}>
      {showHeader && (
        <header style={{ backgroundColor: '#333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', marginBottom: '16px' }}>
          <p>Rivet Debugger URL: <pre style={{ display: 'inline', margin: '0' }}>ws://localhost:3000/api/rivet/debugger</pre></p>
          <button onClick={handleCloseHeader} style={{ backgroundColor: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><FaTimes /></button>
        </header>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', flex: 1, overflowY: 'scroll', height: `calc(100vh - ${showHeader ? '56px' : '16px'})`, marginBottom: '16px' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ddd', marginRight: '16px' }}>
              {message.type === 'user' ? <FaUserCircle size={24} /> : <FaRobot size={24} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
              <span style={{ backgroundColor: message.type === 'user' ? '#ddd' : '#4CAF50', padding: '8px 12px', borderRadius: '16px', marginBottom: '8px', color: message.type === 'user' ? '#000' : '#fff', maxWidth: '100%', wordWrap: 'break-word', textAlign: 'left', whiteSpace: 'pre-wrap' }}>{message.message}</span>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleMessageSubmit} style={{ display: 'flex', alignItems: 'center', marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ddd', marginRight: '16px' }}>
          <FaUserCircle size={24} />
        </div>
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} style={{ flex: 1, padding: '8px 12px', borderRadius: '16px', marginRight: '16px' }} />
        <button type="submit" style={{ backgroundColor: '#4CAF50', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '16px', minWidth: '80px' }}><FaPaperPlane /></button>
      </form>
    </div>
  );
};

export default Chatbot;
