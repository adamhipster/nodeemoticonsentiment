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

app.get('/', function(request, response){
	console.log(twit.stream('statuses/sample'));
	response.end("Here's a response\n");
});

stream.on('message', function (msg) {
	let lang = msg["lang"];
	if(lang === "en"){
		let tweet = {
			text: msg.text,
			timestamp: msg.timestamp_ms
		};
		emoticonParser.analyzeSentiment(tweet);
	}
});

setInterval(function(){
	ratioCalculator.calculateRatio(client);
}, 5000);

app.listen(portNumber, function() {
	console.log('Server running at http://127.0.0.1:%d/', portNumber);
});