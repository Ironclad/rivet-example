import './App.css';
import ChatMessages from './ChatMessages';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>Debugger URL: <pre>ws://localhost:3000/api/rivet/debugger</pre></p>
      </header>
      <section className="App-section">
        <ChatMessages />
      </section>
    </div>
  );
}

export default App;
