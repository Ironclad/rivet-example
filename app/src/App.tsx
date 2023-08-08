import axios from 'axios';
import './App.css';
import { useCallback } from 'react';

function App() {
  const sendChat = useCallback(() => {
    axios.post('localhost:3000/rivet-example', { input: 'test' });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <textarea className="text-input" />
        <button onClick={sendChat}>Go</button>
      </header>
    </div>
  );
}

export default App;
