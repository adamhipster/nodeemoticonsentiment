exports.calculateRatio = function(client){
	let numTweets = 0; 
	client.llen("sentiment_frequencies", function(error, message){
		numTweets = message;
	});
	console.log("numTweets: " + numTweets);

	if(numTweets > 0){

		let numRedisTweetsPos = 0;
		let numRedisTweetsNeg = 0;
		for(let i = 0; i < numTweets; i++){
			client.rpop("sentiment_frequencies", function(error, message){ 
				if(error) throw error;
				let tweet = JSON.parse(message);
				numRedisTweetsPos = tweet.amntPos;
				numRedisTweetsNeg = tweet.amntNeg;
			});
		}

		let total_positive_tweets = 0;
		client.get("amount_positive_tweets", function(error, message){
			total_positive_tweets = isNumeric(message)?parseInt(message) : 0;
		});
		
		let total_negative_tweets = 0;
		client.get("amount_negative_tweets", function(error, message){
			total_negative_tweets = isNumeric(message)?parseInt(message) : 0;
		});

		total_positive_tweets += numRedisTweetsPos;
		total_negative_tweets += numRedisTweetsNeg;
		let ratio = total_negative_tweets/(total_positive_tweets+total_negative_tweets);
		client.set("amount_positive_tweets", total_positive_tweets);
		client.set("amount_negative_tweets", total_negative_tweets);
		client.set("ratio", ratio);
		console.log("\nRATIO: " + ratio + " \n");
	}
	else{
		client.get("ratio", function(error, ratioMessage){
			console.log("\nRATIO (cached): " + ratioMessage + " \n");
		});
	}

} 

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
