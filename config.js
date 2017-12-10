module.exports = {
  port: process.env.PORT || 8080,
  host: process.env.HOST || 'localhost',
  serverUrl: 'https://realtime.thetrainline.com/departures/wat',
  trainDetailsPath: 'https://realtime.thetrainline.com/callingPattern',
  queryInterval: 10 * 1000,
  infoType: {
    TRAINS_INFO: 'trainsInfo',
    TRAIN_DETAILS: 'trainDetails'
  }
};
