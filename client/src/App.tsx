import React, {useState, useRef}from 'react';
import emptyMap from './empty-map.jpg';

import './App.css';

function App() {
  const [errors, setErrors] = useState<string | null>();
  const handleFileChange = async (event: any) => {
      const fileName:string=event.target.files[0].name
      const fileType:string=fileName.split('.').reverse()[0]
      if(fileType==='grid'){
          setErrors(null)
      }else{
        setErrors("Please add correct file with type \'grid\'")
      }
  }
  const handleClick = () => {
    setErrors(null)
    inputFileRef.current.click()
  }
  const inputFileRef:any = useRef(null);
  return (
    <div className="App">
      <header className="App-header">
        <img src={emptyMap} className="img" alt="empty map" />
        <p>
          Add new binary file please
        </p>
          {errors?<p>{errors}</p>:""}
        <button
          onClick={handleClick}
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
