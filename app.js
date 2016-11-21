require('dotenv').config();
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

//Currently not handling requests yet
app.get('/', function(request, response){
	response.end("Here's a response\n");
});

//Parse for emoticons for every tweet
//If it has emoticons then store the pos/neg freq in redis
stream.on('message', function (msg) {
	let lang = msg.lang;
	if(lang === "en"){
		emoticonParser.parseEmoticonsAndStoreFreqs(client, msg);
	}
});

//Get new freqs and recalculate the ratio
setInterval(function(){
	ratioCalculator.calculateRatio(client);
}, 2000);

app.listen(portNumber, function() {
	console.log('Server running at http://127.0.0.1:%d/', portNumber);
});


//simulating purposes
// setInterval(function(){
// 	let testTweet = {
// 		text: "@DareadDarkgta not a bad idea :)",
// 		timestamp_ms: 1337,
// 	};
// 	emoticonParser.parseEmoticonsAndStoreFreqs(client, testTweet);
// }, 1500);
