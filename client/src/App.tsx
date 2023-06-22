import React, {useState, useRef}from 'react';
import configFile from './config.json'
import axios from 'axios';


import './App.css';

function App() {
  const [heatMap, setHeatMap] = useState<string | null>();
  const [errors, setErrors] = useState<string | null>();
  const handleFileChange = async (event: any) => {
      setErrors(null);
      setHeatMap(null);
      const fileName:string=event.target.files[0].name
      console.log(fileName);
      const fileType:string=fileName.split('.').reverse()[0]
      console.log(fileType);
      if(fileType==='grid'){
          try {
             const formData = new FormData();
             const file = event.target.files[0];
             formData.append('file', file);
             const {data} = await axios.post(configFile.apiEndpoint+'/upload', formData);
              console.log(data.message);
              setErrors(data.message);
              setHeatMap(`${configFile.apiEndpoint}/upload/heatMap.jpeg`)
          } catch(error:any){
              setErrors(error.message)
          }
      }else{
        setErrors("Please add correct file with type 'grid'")
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
          {heatMap
            ?<img src={`${configFile.apiEndpoint}/upload/heatMap.jpeg`} className="img" alt="heat map" />
            :<img src={`${configFile.apiEndpoint}/upload/empty-map.jpg`} className="img" alt="empty map" />
          }
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
