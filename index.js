const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const config = require('./config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let connectedClients = 0;

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

io.on('connection', socket => {
  const clientNumber = ++connectedClients;
  console.log(`New client connected #${clientNumber}`); //eslint-disable-line

  let trainsInfoInterval = setInterval(
    () => getTrainsInfoAndEmit(socket, clientNumber),
    config.queryInterval
  );

  let trainDetailsInterval;

  socket.on('trainDetails', data => {
    clearInterval(trainDetailsInterval);

    trainDetailsInterval = setInterval(
      () => getTrainDetailsAndEmit(socket, data.serviceIdentifier, clientNumber),
      config.queryInterval
    );
  });

  socket.on('disconnect',
    () => {
      console.log(`Client disconnected #${clientNumber}`); //eslint-disable-line
      clearInterval(trainsInfoInterval);
      clearInterval(trainDetailsInterval);
    }
  );
});

const filterTrainsAndMapIntoObject = arr => {
  return arr.reduce((acc, curr) => {
    if (curr.transportMode === 'TRAIN') {
      acc[curr.serviceIdentifier] = curr;
    }
    return acc;
  }, {});
};

const getTrainsInfoAndEmit = (socket, clientNumber) => {
  getTrainsInfoFromApi()
    .then(result => {
      console.log(`Emitting Trains Info to client #${clientNumber}`); //eslint-disable-line
      socket.emit(config.infoType.TRAINS_INFO, result);
    })
    .catch(error => {
      console.error(`${error.message}`); //eslint-disable-line
    });
};

const getTrainDetailsAndEmit = (socket, serviceIdentifier, clientNumber) => {
  getTrainDetailsFromApi(serviceIdentifier)
    .then(result => {
      console.log(`Emitting Train Details for train ${serviceIdentifier} to client #${clientNumber}`); //eslint-disable-line
      socket.emit(config.infoType.TRAIN_DETAILS, result);
    })
    .catch(error => {
      console.error(`${error.message}`); //eslint-disable-line
    });
};

app.get('/health', (req, res) => {
  res.send({ response: `I am alive. ${connectedClients} clients connected` }).status(200);
});

app.get('/trainsInfo', (req, res) => {
  getTrainsInfoFromApi()
    .then(result => res.send(result))
    .catch(error => {
      console.error(`${error.response.status} - ${error.message}`); //eslint-disable-line
      res.status(error.response.status).send(error.message);
    });
});

const getTrainsInfoFromApi = () => {
  return axios.get(config.serverUrl)
    .then(result => {
      return {
        timestamp: new Date(),
        trains: filterTrainsAndMapIntoObject(result.data.services)
      };
    });
};

app.get('/trainDetails/:serviceIdentifier', (req, res) => {
  const serviceIdentifier = req.params.serviceIdentifier;

  getTrainDetailsFromApi(serviceIdentifier)
    .then(result => res.send(result))
    .catch(error => {
      console.error(`${error.response.status} - ${error.message}`); //eslint-disable-line
      res.status(error.response.status).send(error.message);
    });
});

const getTrainDetailsFromApi = serviceIdentifier => {
  return getTrainsInfoFromApi()
    .then(result => {
      const trainInfo = result.trains[serviceIdentifier];
      const date = new Date();
      const dateFormatted = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
      let trainDetailsUrl = trainInfo ? trainInfo.callingPatternUrl : `${config.trainDetailsPath}/${serviceIdentifier}/${dateFormatted}`;

      return axios.get(trainDetailsUrl)
        .then(result => result.data.service);
    });
};

server.listen(config.port, () =>
  console.log(`Listening on port ${config.port}`) //eslint-disable-line
);
