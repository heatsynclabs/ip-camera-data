const config = {
  port: process.env.PORT || 8080,
  CAM1: process.env.CAM1 || 'https://live.heatsynclabs.org/snapshot.php?camera=1',
  CAM2: process.env.CAM2 || 'https://live.heatsynclabs.org/snapshot.php?camera=2',
  CAM3: process.env.CAM3 || 'https://live.heatsynclabs.org/snapshot.php?camera=3',
  CAM4: process.env.CAM4 || 'https://live.heatsynclabs.org/snapshot.php?camera=4',
};

export default config;
