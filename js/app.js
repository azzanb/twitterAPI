const tweet = require('./config.js');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug'); 

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const searchTweets = 'https://api.twitter.com/1.1/search/tweets.json?q=Extra_Zany&result_type=recent&since_id=897063687382597600';
const searchFriends = 'https://api.twitter.com/1.1/friends/list.json?cursor=-1&screen_name=Extra_Zany&skip_status=true&include_user_entities=false';
const searchMessages = 'https://api.twitter.com/1.1/direct_messages.json?count=5';



tweet.get(searchTweets, (err, data, res) => {
})
.then(function(data){
	const statuses = data.data.statuses,
		  arrT = [],
		  retweetCount = [],
		  tweetDates = [],
		  likesCount = [];
	for(let i = 0; i < (statuses.length) - 2; i++){
		arrT.push(statuses[i].text);	
		retweetCount.push(statuses[i].retweet_count);
		likesCount.push(statuses[i].favorite_count);
		tweetDates.push(statuses[i].created_at);
	}
	return [arrT, retweetCount, likesCount, tweetDates];
	})
	.then(function(nextData){	
		const finalTweets = nextData[0],
			  finalRetweetCount = nextData[1],
			  finalLikesCount = nextData[2],
			  finalTweetDates = nextData[3],
			  finalRealNames = [],
			  finalScreenNames = [],
			  profileImage = [];
	
		tweet.get(searchFriends, (err, data, res) => {
			for(let i = 0; i < 5; i++){
				finalRealNames.push(data.users[i].name);	
				finalScreenNames.push(data.users[i].screen_name);	
				profileImage.push(data.users[i].profile_image_url);
			}
			return finalRealNames, finalScreenNames, finalTweets, finalRetweetCount, finalLikesCount, profileImage, finalTweetDates;
		})
		.then(function(){
			const finalMessages = [],
				  messageTimes = [];
			
			tweet.get(searchMessages, (err, data, res) => {
				//console.log(data);
				for(let i = 0; i < 5; i++){
					finalMessages.push(data[i].text);
					messageTimes.push(data[i].created_at);
				}
				//console.log(finalMessages, finalRealNames, finalTweets, finalRetweetCount, finalLikesCount, profileImage, messageTimes);
				return finalMessages, finalRealNames, finalScreenNames, finalTweets, finalRetweetCount, finalLikesCount, profileImage, messageTimes, finalTweetDates;
			})
			.then(function(){
				app.get('/', (req, res) => {
					res.render(
						'sample', 
						{
						tweets: finalTweets,
						friends: finalRealNames,
						messages: finalMessages,
						retweets: finalRetweetCount,
						likes: finalLikesCount,
						tweetDates: finalTweetDates,
						messageTimes: messageTimes
						}
					);
				});
			});
		});
	});


app.listen(3000, function(){
	console.log("Works");
});




