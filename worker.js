import tf from '@tensorflow/tfjs-node';
import cocoSsd from '@tensorflow-models/coco-ssd';
// import * as poseDetection from '@tensorflow-models/pose-detection';
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
    let start = timestamp;
    const imageUrl = `${baseImageUrl}&date=${timestamp}`;
    // Fetch the image from the URL
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
  
    
    // Decode image into tensor using @tensorflow/tfjs-node
    const tensor = tf.node.decodeImage(imageBuffer);
    const fetchDecodeTime = Date.now() - start;

    // Run object detection
    start = Date.now();
    const predictions = await model.detect(tensor);
    const predictTime = Date.now() - start;
    
    // Use the original tensor for pose detection
    // start = Date.now();
    // const poses = await poseDetector.estimatePoses(tensor);
    // const poseTime = Date.now() - start;
    
    // Get image dimensions
    const [height, width, channels] = tensor.shape;
    const results = {
      image: {
        height: height,
        width: width,
        channels: channels
      },
      predictions,
      // poses,
      timestamp,
      fetchDecodeTime,
      predictTime,
      // poseTime,
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
let poseDetector;
async function main() {
  console.log('Loading models...');
  model = await cocoSsd.load();
  
  // too much ram for heroku ----------------------
  // model = await cocoSsd.load({base: 'mobilenet_v2'});
  // Configure MoveNet Thunder to maximize accuracy at the expense of performance
  // const moveNetModel = poseDetection.SupportedModels.MoveNet;
  // poseDetector = await poseDetection.createDetector(moveNetModel, {
  //   modelType: 'SinglePose.Thunder',  // The most accurate MoveNet model
  //   enableSmoothing: true,
  //   scoreThreshold: 0.05,             // Extremely low threshold to maximize recall
  //   minPoseScore: 0.05                // Detect even low-confidence poses
  // });
  // too much ram for heroku ----------------------

  console.log('All models loaded');
  parentPort.postMessage(JSON.stringify({topic: 'event', payload: 'ready'}));
}

main();