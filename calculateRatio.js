let callbackHellCounter = 0;
exports.calculateRatio = function(client){
	let numRedisTweetsPos = 0;
	let numRedisTweetsNeg = 0;

	client.llen("sentiment_frequencies", function(error, llenMessage){
		let numTweets = llenMessage?llenMessage : 0;

		if(numTweets > 0){
			
			let poppedElements = {

				popFreqElements: function (){
					for(let i = 0; i < numTweets; i++){
						this.popFreqEl(i);
					}
				},

				popFreqEl: function (i){
					client.rpop("sentiment_frequencies", function(error, message){ 
						//only when numRedisTweetsPos (etc.) is declared here is it viewed
						//as a number...

						if(error) throw error;
						let tweet = JSON.parse(message);
						numRedisTweetsPos += tweet.amntPos;
						numRedisTweetsNeg += tweet.amntNeg;

						if(i === numTweets-1){
							doTheRest(numRedisTweetsPos, numRedisTweetsNeg, client);
						}
						console.log("Iteration: " + i);
						console.log("Message: " + tweet.text);
						console.log("amntPos: " + tweet.amntPos);
						console.log("amntNeg: " + tweet.amntNeg);
						console.log("pos: " + numRedisTweetsPos);
						console.log("neg: " + numRedisTweetsNeg);
						console.log("\n");
					});
				}
				
			}

			poppedElements.popFreqElements();
			
			callbackHellCounter += 1;
			console.log("\n"+ 
				"---------------------------" +
				"\nEND OF CALLBACK HELL part " + callbackHellCounter + "\n" +
				"---------------------------" + "\n");			

		}
		else{
			client.get("ratio", function(error, ratioMessage){
				console.log("\nRATIO (cached): " + ratioMessage + " \n");
			});
		}
	
	}); 

}

function doTheRest(numRedisTweetsPos, numRedisTweetsNeg, client){
	client.get("amount_positive_tweets", function(error, message){
		let total_positive_tweets = isNumeric(message)?parseInt(message) : 0;
		
		client.get("amount_negative_tweets", function(error, message){
			let total_negative_tweets = isNumeric(message)?parseInt(message) : 0;
			total_positive_tweets += numRedisTweetsPos;
			total_negative_tweets += numRedisTweetsNeg;
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

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}