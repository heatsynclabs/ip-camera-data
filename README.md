# IP Camera Data

A Node.js application that processes IP camera feeds using TensorFlow.js object detection.

## Features

- Connects to multiple IP cameras (up to 4)
- Uses TensorFlow.js with COCO-SSD model to detect objects in camera feeds
- Processes camera feeds in separate worker threads for better performance
- Provides a REST API endpoint to access detection results

## Requirements

- Node.js v16 or higher
- NPM or Yarn

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ip-camera-data.git
cd ip-camera-data

# Install dependencies
npm install
```

## Configuration

Edit the `config.js` file to set your IP camera URLs and server port:

```javascript
const config = {
  port: 8080,  // HTTP server port
  CAM1: process.env.CAM1 || 'https://your-camera-url-1',
  CAM2: process.env.CAM2 || 'https://your-camera-url-2',
  CAM3: process.env.CAM3 || 'https://your-camera-url-3',
  CAM4: process.env.CAM4 || 'https://your-camera-url-4',
};
```

You can also set the camera URLs via environment variables.

## Usage

Start the application:

```bash
node index.js
```

Access the camera data via the REST API:

```
GET http://localhost:8080/camdata
```

This will return a JSON object with detection results from all cameras:

```json
{
  "CAM1": {
    "image": { "height": 480, "width": 640, "channels": 3 },
    "predictions": [
      { "bbox": [x, y, width, height], "class": "person", "score": 0.8912 },
      ...
    ],
    "timestamp": 1678912345678
  },
  "CAM2": { ... },
  "CAM3": { ... },
  "CAM4": { ... }
}
```

## How It Works

1. The application starts an Express server and creates worker threads for each camera
2. Each worker loads the TensorFlow.js COCO-SSD model for object detection
3. Workers continuously fetch images from the configured camera URLs
4. Object detection is performed on each image
5. Results are sent back to the main thread and stored
6. The REST API endpoint `/camdata` provides access to the latest detection results

## License

ISC