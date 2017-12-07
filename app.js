let express = require('express');
let app = express();
let config = require('./config');
let portNumber = 3000;
let twit = config.twit; // Github: ttezel/twit
let stream = twit.stream('statuses/sample');
let emoticonParser = require('./emoticonParser');
let ratioCalculator = require('./calculateRatio');
let redis = require('redis');
let client = redis.createClient();
let server = require('http').createServer(app);
let io = require('socket.io')(server);

//Currently not handling requests yet
app.get('/', function(request, response){
	response.sendFile(__dirname + '/index.html');
});
app.use('/', express.static(__dirname + '/js'));

io.on('connection', function (socket) {
  socket.on('message',function(message_from_browser){
    console.log("Le message: " + message_from_browser); 
  });
  socket.emit('message','Hello, my name is Server');
});



stream.on('message', function (msg) {
	if(msg.lang === "en"){
		emoticonParser.parseEmoticonsAndStoreFreqs(client, msg);
	}
});

//this runs the program
setInterval(function(){
	ratioCalculator.calculateRatio(client);
	client.get('ratio', function(error, ratio){
		const r = parseFloat(ratio).toFixed(2).toString();
		io.emit('ratio', r);
	})
}, 2000);

//LISTENING
app.listen(portNumber, function() {
	console.log('Express is running at http://127.0.0.1:%d/', portNumber);
});

server.listen(8000, function(){
	console.log("Socket-io is listening to 8000");
});

//SIMULATIONS AND TESTING
// simulateTweets();

function simulateTweets(){

	setInterval(function(){
		let testTweet = {
			text: "@DareadDarkgta not a bad idea :)",
			timestamp_ms: 1337,
		};
		emoticonParser.parseEmoticonsAndStoreFreqs(client, testTweet);
	}, 1500);
}