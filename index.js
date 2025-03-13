import express from 'express'
import config from './config.js'
import { Worker } from 'worker_threads';
const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

const workers = [];

const camResults = {
  CAM1: {},
  CAM2: {},
  CAM3: {},
  CAM4: {}
};

for (let i = 0; i < 4; i++) {
  const worker = new Worker('./worker.js');
  const id = i + 1;
  workers.push(worker);
  worker.on('message', (message) => {
    try{
      const data = JSON.parse(message);
      if (data.topic === 'event' && data.payload === 'ready') {
        console.log(`Worker ${id} is ready`);
        worker.postMessage(JSON.stringify({topic: 'id', payload: id}));
      } if (data.topic === 'results') {
        console.log(`Worker ${id} results`, data.payload);
        camResults[`CAM${id}`] = data.payload;
      }
    } catch (error) {
      console.error(`Worker ${id} error`, error);
    }
  });
  worker.on('error', (error) => {
    console.error(`Worker ${i} error`, error);
  });
}

app.get('/camdata', (req, res) => {
  res.json(camResults);
});
