import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());

// Оголошую сховище для файлів
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, 'sst.grid');
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Перевірка розширення файлу
    const allowedExtensions = ['.grid']; // Дозволені розширення файлів
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true); // Прийняти файл
    } else {
      cb(new Error('Invalid file type')); // Відхилити файл
    }
  },
});

// Слухаємо запит на завантаження
app.post('/upload', upload.any(), (req, res) => {
  res.json({
    message: 'File loaded successfully!',
  });
});

async function start(){
  try{
    app.listen(8000,()=>{
      console.log('Server started on port: 8000');
    })
  }catch (error){
    console.log(error.message);
  }
}
start();
app.get('/', (req, res) => {
  res.send('Hello World!');
});
