exports.calculateRatio = function(client){

	client.llen("sentiment_frequencies", function(error, llenMessage){
		let numTweets = llenMessage?llenMessage:0;

		if(numTweets > 0){
			
			let poppedElements = {
				numRedisTweetsPos : 0,
				numRedisTweetsNeg : 0,

				popFreqElements: function (){
					for(let i = 0; i < numTweets; i++){
						(function (i){
							client.rpop("sentiment_frequencies", function(error, message){ 
								if(error) throw error;
								let tweet = JSON.parse(message);
								this.numRedisTweetsPos = tweet.amntPos;
								this.numRedisTweetsNeg = tweet.amntNeg;

								if(i === numTweets-1){
									doTheRest(this.numRedisTweetsPos, this.numRedisTweetsNeg, client);
								}
								console.log("Iteration: " + i);
								console.log("pos: " + this.numRedisTweetsPos);
								console.log("neg: " + this.numRedisTweetsNeg);
							});
						}(i));
					}
				}
			}

			poppedElements.popFreqElements();
			console.log("END OF CALLBACK HELL\n\n");			

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
			console.log("Le numbers:" + total_positive_tweets + " / " + total_positive_tweets + "+" + total_negative_tweets + "\n");
			
			client.set("amount_positive_tweets", total_positive_tweets);
			client.set("amount_negative_tweets", total_negative_tweets);
			client.set("ratio", ratio);
		});
	});
	
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}