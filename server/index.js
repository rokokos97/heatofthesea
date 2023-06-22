import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import Jimp from 'jimp';
import fs from 'fs';
import util from 'util';
import config from 'config'

const jimpRead = util.promisify(Jimp.read);

const app = express();
app.use(cors());
app.use('/upload', express.static('upload'));

const PORT = config.get('port') ?? 8000

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static('client'));

  const indexPath = path.join('client', 'index.html');

  app.get('*', (req, res) => {
    res.sendFile(indexPath);
  })
}
// Оголошую сховище для файлів
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload');
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

  const SOURCE_MAP_PATH = 'upload/empty-map.jpg';
  const OUTPUT_HEAT_MAP_PATH = 'upload/heatMap.jpeg';

  /*
  Binary file size = 647964000 // (36000 * 17999)
  const BINARY_DIMENSION_X = 36000;
  const DIMENSION_Y = 17999;
   */
  const GRID_FILE_PATH = 'upload/sst.grid';

  const POLYGON_X_DIMENSION = 10;
  const POLYGON_Y_DIMENSION = 10;

  const GROUND_TEMPERATURE_CODE = 255;

  const OUTPUT_IMAGE_WIDTH = 3600;
  const OUTPUT_IMAGE_HEIGHT = 1800;

// RGB code of colors for gradient
  const colors = [
    [255, 0, 0],
    [255, 123, 0],
    [254, 169, 71],
    [254, 202, 0],
    [255, 251, 0],
    [59, 211, 213],
    [0, 172, 255],
    [68, 76, 214]
  ];

  const getGradientRgb = (i, j, value, limit) => {
    const ratio = value <= limit ? 0 : (value - limit) / 10;
    if (!ratio) {
      return colors[j];
    }

    const rgb = [];
    for (let k = 0; k < 3; k++) {
      const diff = Math.floor(Math.abs(colors[j][k] - colors[i][k]) * ratio);
      rgb.push(colors[j][k] + ((colors[j][k] < colors[i][k]) ? diff : -diff));
    }
    return rgb;
  };

  const getColor = (value) => {
    if (value > 100) {
      return Jimp.rgbaToInt(255, 0, 0, 255);
    }

    const tempIndex = Math.floor(value / 10);
    const grad = getGradientRgb(10 - tempIndex - 1, 10 - tempIndex, value, tempIndex * 10);

    return Jimp.rgbaToInt(...grad, 255);
  };

  const printImageRow = (image,row, y) => {
    for (let i = 0; i < row.length; i++ ) {
      const [sumTemp, waterCount, groundCount] = row[i];
      if (waterCount >= groundCount) {
        image.setPixelColor(getColor(sumTemp / waterCount), i, OUTPUT_IMAGE_HEIGHT - y);
      }
      row[i] = [0, 0, 0];
    }
  };

  (async () => {
    let x = 0;
    let y = 1;

    // tuples of [sum temperature for water, water cells count, ground cells count]
    let row = [...new Array(OUTPUT_IMAGE_WIDTH).fill(0)].map(_ => new Array(3).fill(0));

    let xPixelGroup = 0;
    let yPixelGroup = 0;

    const image = await jimpRead(SOURCE_MAP_PATH);
    const readableStream = fs.createReadStream(GRID_FILE_PATH);
    for await (const chunk of readableStream) {
      for (const temperature of chunk) {
        xPixelGroup++;
        if (temperature === GROUND_TEMPERATURE_CODE) {
          row[x][2]++;
        } else {
          row[x][0] += temperature;
          row[x][1]++;
        }

        if (xPixelGroup % POLYGON_X_DIMENSION === 0) {
          x++;
        }

        if (x === OUTPUT_IMAGE_WIDTH) {
          x = 0;
          yPixelGroup++;
          if (yPixelGroup % POLYGON_Y_DIMENSION === 0) {
            y++;
            printImageRow(image, row, y);
          }
        }
      }
    }

    await image.writeAsync(OUTPUT_HEAT_MAP_PATH);
    console.log('Heat map has been generated.');
  })().catch(console.error);
  res.json({
    message: 'File loaded successfully!',
  });
});

async function start(){
  try{
    app.listen(PORT,()=>{
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




