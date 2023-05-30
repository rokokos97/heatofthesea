import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());
// оголошую сховище для фалів
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, 'sst.grid')
    }
})
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Перевірка розширення файлу
        const allowedExtensions = ['.grid']; // дозволені розширення файлів
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(fileExtension)) {
            cb(null, true); // Прийняти файл
        } else {
            cb(new Error('Неприпустиме розширення файлу')); // Відхилити файл
        }
    },
})


app.post('/upload', upload.any(),(req:any, res)=>{
    res.json({
        message: "upload complete!"
    })
})

// @ts-ignore
app.listen(8000, (error)=>{
    if(error){
        return console.log(error);
    }
    console.log('Server started on port:8000')
})

app.get('/',(req, res)=>{
    res.send('Hello World!');
})
