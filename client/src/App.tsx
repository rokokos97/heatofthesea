import React from 'react';
import emptyMap from './empty-map.jpg';

import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={emptyMap} className="img" alt="empty map" />
        <p>
          Add new binary file please
        </p>
        <button>
          Add file
        </button>
      </header>
    </div>
  );
}

export default App;
