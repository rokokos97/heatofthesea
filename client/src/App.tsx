import React, {useRef}from 'react';
import emptyMap from './empty-map.jpg';

import './App.css';

function App() {
  const handleFileChange = async (event: any) => {
    console.log(event.target.files);
  }
  const inputFileRef:any = useRef(null);
  return (
    <div className="App">
      <header className="App-header">
        <img src={emptyMap} className="img" alt="empty map" />
        <p>
          Add new binary file please
        </p>
        <button
          onClick={()=>{inputFileRef.current.click()}}
        >
          Add file
        </button>
        <input
            type="file"
            ref={inputFileRef}
            hidden
            onChange={handleFileChange}
        />
      </header>
    </div>
  );
}

export default App;
