const emoticons = require('./emoticons'); //POSITIVE and NEGATIVE emoticons :)
let redis = require('redis');
let client = redis.createClient();

exports.analyzeSentiment = function(tweet){
	let text = tweet.text
	let timestamp = tweet.timestamp;
	let emojisOfTweet = {
		positive : [],
		negative : [],
	};
	emojisOfTweet.positive = text.match(emoticons.POSITIVE_REGEX);
	emojisOfTweet.negative = text.match(emoticons.NEGATIVE_REGEX);
	
	if(emojisOfTweet.positive || emojisOfTweet.negative){
		let matchesAmount = {
			positive : emojisOfTweet.positive?emojisOfTweet.positive.length:0,
			negative : emojisOfTweet.negative?emojisOfTweet.negative.length:0,
		};
		console.log(text);
		let sentimentalTweet = {
			amntPos : matchesAmount.positive,
			amntNeg : matchesAmount.negative,
			text : text,
			timestamp : timestamp,
		};
		client.lpush("sentiment_frequencies", JSON.stringify(sentimentalTweet), function(error, value){
  			if(error) throw error;
		});

		//debug: these values should be left untouched
		client.lpush("sentiment_frequencies_debug", JSON.stringify(sentimentalTweet), function(error, value){
  			if(error) throw error;
		});

	}
}

