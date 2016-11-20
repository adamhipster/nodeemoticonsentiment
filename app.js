var express 	= require('express');
var app     	= express();
var config		= require('./config');
var portNumber 	= 3000;
var twit 		= config.twit; // Github: ttezel/twit

app.get('/', function(request, response){
	console.log("sup bro");
	console.log(twit.stream('statuses/sample'));
	response.end("Here's a response\n");
});

var stream = twit.stream('statuses/sample');
stream.on('message', function (msg) {
	console.log(msg);
})

app.listen(portNumber, function() {
	console.log('Server running at http://127.0.0.1:%d/', portNumber);
});