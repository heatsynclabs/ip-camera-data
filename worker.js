import tf from '@tensorflow/tfjs-node';
import cocoSsd from '@tensorflow-models/coco-ssd';
import { parentPort } from 'worker_threads';
import config from './config.js';
let baseImageUrl = '';

// Listen for messages from the main thread
parentPort.on('message', (message) => {
  try{
    const data = JSON.parse(message);
    if (data.topic === 'id') {
      console.log(`Worker ${data.payload} received`);
      baseImageUrl = config[`CAM${data.payload}`];
      detectPeopleFromURL();
    }
  } catch (error) {
    console.error(`Worker error`, error);
  }

  
});

async function detectPeopleFromURL() {
  
  try{
    const timestamp = Date.now();
    const imageUrl = `${baseImageUrl}&date=${timestamp}`;
    // Fetch the image from the URL
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
  
    
    // Decode image into tensor using @tensorflow/tfjs-node
    const tensor = tf.node.decodeImage(imageBuffer);

    // console.log('tensor', tensor, imageUrl);
    
  
    // const poses = await detector.estimatePoses(tensor);
    // console.log('poses', poses, imageUrl);
    // Run object detection
    const predictions = await model.detect(tensor);
  
    // console.log('predictions', predictions, imageUrl);
  
    // Filter only "person" detections
    // const people = predictions.filter(p => {
    //   // console.log('p', p);
    //   return p.class === 'person';
    // });
  
    // if (people.length > 0) {
    //   console.log(people.map(p => ({
    //     bbox: p.bbox, // [x, y, width, height]
    //     score: p.score,
    //     class: p.class
    //   })), imageUrl);
    // }
  
    const [height, width, channels] = tensor.shape;
    const results = {
      image: {
        height: height,
        width: width,
        channels: channels
      },
      predictions: predictions,
      timestamp: timestamp,
    }
    tensor.dispose(); // Free up memory
    parentPort.postMessage(JSON.stringify({topic: 'results', payload: results}));
  } catch (e) {
    console.log('error', e);
  } finally {
    setTimeout(detectPeopleFromURL, 1000);
  }
}


let model;
async function main() {
  console.log('Loading model...');
  model = await cocoSsd.load();
  parentPort.postMessage(JSON.stringify({topic: 'event', payload: 'ready'}));
}

main();