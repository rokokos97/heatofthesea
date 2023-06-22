import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import Jimp from 'jimp';
import fs from 'fs';
import util from "util";
const jimpRead = util.promisify(Jimp.read);

const app = express();
app.use(cors());
app.use('/upload', express.static('upload'));

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


  /*
  Simple getColor implementation without the gradient

  const getColor = (value) => {
    if (value > 91) {
      return Jimp.rgbaToInt(255, 0, 0, 255);
    }
    if (value > 81) {
      return Jimp.rgbaToInt(255, 123, 0, 255);
    }
    if (value > 71) {
      return Jimp.rgbaToInt(254, 169, 71, 255);
    }
    if (value > 61) {
      return Jimp.rgbaToInt(254, 202, 0, 255);
    }
    if (value > 51) {
      return Jimp.rgbaToInt(255, 251, 0, 255);
    }
    if (value > 41) {
      return Jimp.rgbaToInt(59, 211, 213, 255);
    }
    if (value > 31) {
      return Jimp.rgbaToInt(0, 172, 255, 255);
    }

    return Jimp.rgbaToInt(68, 76, 214, 255);
  };
   */

  /*
    // Gradient getColor implementation with ifs

  const getColor = (value) => {
    if (value > 100) {
      return Jimp.rgbaToInt(255, 0, 0, 255);
    }
    if (value > 90) {
      const grad = getGradientRgb(0, 1, value, 90);
      return Jimp.rgbaToInt(...grad, 255);
    }
    if (value > 80) {
      const grad = getGradientRgb(1, 2, value, 80);
      return Jimp.rgbaToInt(...grad, 255);
    }
    if (value > 70) {
      const grad = getGradientRgb(2, 3, value, 70);
      return Jimp.rgbaToInt(...grad, 255);
    }
    if (value > 60) {
      const grad = getGradientRgb(3, 4, value, 60);
      return Jimp.rgbaToInt(...grad, 255);
    }
    if (value > 50) {
      const grad = getGradientRgb(4, 5, value, 50);
      return Jimp.rgbaToInt(...grad, 255);
    }

    if (value > 40) {
      const grad = getGradientRgb(5, 6, value, 40);
      return Jimp.rgbaToInt(...grad, 255);
    }

    const grad = getGradientRgb(6, 7, value, 30);
    return Jimp.rgbaToInt(...grad, 255);
  }
   */
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




