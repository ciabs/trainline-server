# UI Dev Tech Task - Server

## Implementation

* Node Server implemented with Node, Express and Socket.io.
* Socket.io is used to emit real-time data.

### Notes

* Sometimes we need to query train details of old trains that are not present in the result of the [https://realtime.thetrainline.com/departures/wat](departures/wat]) (the results are only for present and future trains), it's not possibile to get the proper `callingPatternUrl` so in the method `getTrainDetailsFromApi` I build the url with the following code:
```
let trainDetailsUrl = trainInfo ? 
trainInfo.callingPatternUrl : 
`https://realtime.thetrainline.com/callingPattern/${serviceIdentifier}/${dateFormatted}`;
``` 

## Available Scripts

### `yarn`

To install dependencies.

### `yarn serve`

Runs the node server at [http://localhost:8080](http://localhost:8080).

## Available Routes

### `/health`

To check server status.

### `/trainsInfo`

To get trains info.

### `/trainDetails/:serviceIdentifier`

To get {serviceIdentifier} train details.

## Socket.io endpoints for real-time data

### `trainsInfo @ http://localhost:8080`

Endpoint that emits trains info.

### `trainDetails @ http://localhost:8080`

Endpoint that emits train details.

## Demo
[https://still-caverns-47909.herokuapp.com/](https://still-caverns-47909.herokuapp.com/)
