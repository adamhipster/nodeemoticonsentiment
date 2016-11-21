const emoticons = require('./emoticons'); //POSITIVE and NEGATIVE emoticons :)

exports.parseEmoticonsAndStoreFreqs = function(client, tweet){
	let text = tweet.text;
	let timestamp = tweet.timestamp_ms;
	let parsedTweet = parseTweetForEmoticons(text);

	if( parsedTweet.hasEmoticons ){
		console.log("Incoming tweet: " + text);

		let result = {
			amntPos : parsedTweet.positive?parsedTweet.positive.length:0,
			amntNeg : parsedTweet.negative?parsedTweet.negative.length:0,
			text : text,
			timestamp : timestamp,
		};

		storeResult(client, result);
		debug(client, result);
	}
}

function parseTweetForEmoticons(text){
	let emoticonsOfTweet = {
		positive : [],
		negative : [],
		hasEmoticons : false,
	};
	emoticonsOfTweet.positive = text.match(emoticons.POSITIVE_REGEX);
	emoticonsOfTweet.negative = text.match(emoticons.NEGATIVE_REGEX);
	emoticonsOfTweet.hasEmoticons = emoticonsOfTweet.positive || emoticonsOfTweet.negative;
	return emoticonsOfTweet;
}

function storeResult(client, result){
	client.lpush("sentiment_frequencies", JSON.stringify(result), function(error, value){
		if(error) throw error;
	});
}

function debug(client, result){
	client.lpush("sentiment_frequencies_debug", JSON.stringify(result), function(error, value){
		if(error) throw error;
	});
}