let callbackHellCounter = 0;

exports.calculateRatio = function(client){
	start(client);	
}

function start(client){
	let redisData = {
		posTweets: 0,
		negTweets: 0,
	}
	client.llen("sentiment_frequencies", function(error, llenMessage){
		let numUnprocessedTweets = llenMessage ? llenMessage : 0;
		if(numUnprocessedTweets > 0){
			popTweets(client, numUnprocessedTweets, redisData);
			logCallbackHell();	
		}
		else{
			client.get("ratio", function(error, ratioMessage){
				console.log("\nRATIO (cached): " + ratioMessage + " \n");
			});
		}
	}); 
}

function popTweets (client, numUnprocessedTweets, redisData){
	for(let i = 0; i < numUnprocessedTweets; i++){
		popTweet(client, numUnprocessedTweets, redisData, i);
	}
}

function popTweet (client, numUnprocessedTweets, redisData, i){
	client.rpop("sentiment_frequencies", function(error, message){ 

		if(error) throw error;
		let tweet = JSON.parse(message);
		redisData.posTweets += tweet.amntPos;
		redisData.negTweets += tweet.amntNeg;

		if(i === numUnprocessedTweets-1){
			getFreqsAndCalculateRatio(redisData, client);
		}
	});
}

function getFreqsAndCalculateRatio(redisData, client){
	client.get("amount_positive_tweets", function(error, message){
		let total_positive_tweets = isNumeric(message)?parseInt(message) : 0;
		
		client.get("amount_negative_tweets", function(error, message){
			let total_negative_tweets = isNumeric(message)?parseInt(message) : 0;
			total_positive_tweets += redisData.posTweets;
			total_negative_tweets += redisData.negTweets;
			let ratio = (total_positive_tweets+.01)/(total_positive_tweets+total_negative_tweets+0.01);
			
			console.log("\nRATIO: " + ratio); 
			console.log("Calculation is: " + "total_positive_tweets" + " / " + "total_positive_tweets" + "+" + "total_negative_tweets");
			console.log("Le numbers: " + total_positive_tweets + " / " + total_positive_tweets + "+" + total_negative_tweets + "\n");
			
			client.set("amount_positive_tweets", total_positive_tweets);
			client.set("amount_negative_tweets", total_negative_tweets);
			client.set("ratio", ratio);
		});
	});
	
}

function logCallbackHell(){
	callbackHellCounter += 1;
	console.log("\n"+ 
	"---------------------------" +
	"\nEND OF CALLBACK HELL part " + callbackHellCounter + "\n" +
	"---------------------------" + "\n");		
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}