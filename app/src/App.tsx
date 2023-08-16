import axios from 'axios';
import './App.css';
import { useCallback } from 'react';

function App() {
  const sendChat = useCallback(() => {
    axios.post('http://localhost:3000/api/rivet-example', { input: 'test' });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>Debugger URL: <pre>ws://localhost:3000/api/rivet/debugger</pre></p>
        <textarea className="text-input" />
        <button onClick={sendChat}>Go</button>
      </header>
    </div>
  );
}

export default App;
