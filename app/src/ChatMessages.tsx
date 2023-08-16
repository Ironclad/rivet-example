import axios from "axios";
import React, { useState } from "react";

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
    <div>
      <div>
        {messages.map((message, index) => (
          <div key={index} style={{ textAlign: message.type === 'user' ? "right" : "left" }}>
            <span style={{ display: "inline-block", backgroundColor: message.type === 'user' ? "#4CAF50" : "#ddd", padding: "8px 12px", borderRadius: "16px", maxWidth: "70%", marginBottom: "8px", whiteSpace: "pre-wrap" }}>{message.message}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleMessageSubmit} style={{ marginTop: "16px" }}>
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;
