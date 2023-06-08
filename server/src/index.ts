import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());

// Оголошую сховище для файлів
const storage: any = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads');
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
app.post('/upload', upload.any(), (req: Request, res: Response) => {
    res.json({
        message: 'File loaded successfully!',
    });
});

async function start(){
    try{
        app.listen(8000,()=>{
            console.log('Server started on port: 8000');
        })
    }catch (error:any){
        console.log(error.message);
    }
}
start();
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

// const BINARY_DIMENSION_X = 36000;
// const DIMENSION_Y = 17999;

// Функція для потокового читання та обробки даних з файлу
// const processFileStream = (filePath) => {
//     const readStream = fs.createReadStream(filePath);
//     let data = Buffer.alloc(0);
//
//     readStream.on('data', (chunk) => {
//         data = Buffer.concat([data, chunk]);
//     });
//
//     readStream.on('end', () => {
//         const temperatureData = parseBinaryData(data);
//         // Використання temperatureData для подальшої обробки або виведення даних
//         console.log(temperatureData);
//
//         // Отримання шляху до директорії бінарного файлу
//         const outputDirectory = path.dirname(filePath);
//         // Запис отриманого масиву даних в файл у тій самій директорії
//         const outputFilePath = path.join(outputDirectory, 'arr.json');
//         const jsonData = JSON.stringify(temperatureData);
//         fs.writeFile(outputFilePath, jsonData, (err) => {
//             if (err) {
//                 console.error('Error writing file:', err);
//             } else {
//                 console.log('Data written to file successfully:', outputFilePath);
//             }
//         });
//     });
//
//     readStream.on('error', (err) => {
//         console.error('Error reading file:', err);
//     });
// };

// // Читання та обробка бінарного файлу
// const binaryFilePath = 'src/uploads/sst.grid';
// processFileStream(binaryFilePath);

// function parseBinaryData(buffer) {
//     const dataArray = [];
//
//     for (let i = 0; i < DIMENSION_Y; i++) {
//         const row = [];
//
//         for (let j = 0; j < BINARY_DIMENSION_X; j++) {
//             const startIndex = (i * BINARY_DIMENSION_X + j) * 2;
//             const temperature = buffer.readInt16LE(startIndex);
//             row.push(temperature);
//         }
//
//         dataArray.push(row);
//     }
//
//     return dataArray;
// }
