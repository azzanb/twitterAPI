const Twit = require('twit'),
	  configKey = require('./config.js'),
	  tweet = new Twit(configKey),
	  ta = require('time-ago')(), //this module will format the twitter time for tweets and messages
	  express = require('express'),
	  path = require('path'),
	  app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug'); 
app.use(express.static(path.join(__dirname, "public")));


const searchTweets = 'https://api.twitter.com/1.1/search/tweets.json?q=Extra_Zany&result_type=recent&count=5';
const searchFriends = 'https://api.twitter.com/1.1/friends/list.json?cursor=-1&screen_name=Extra_Zany&skip_status=true&include_user_entities=false';
const searchMessages = 'https://api.twitter.com/1.1/direct_messages.json?count=5';


//-----APP.JS PROCESS (You'll notice a pattern)-----//
/* 

1)Search tweets, then friends, then messages 
2)Return data in array
3)With each promise resolve return array data to be passed down until app.get()
4)Pass the arrays in res.render() as locals; so, the variables, which are used in sample.pug, can be accessed locally

*/

//-----PUG PROCESS-----//
/* 

1)Convert index.html to pug(template.pug) and extend that into my own sample.pug
2)Block the information I need and access the local variables passed in res.render() to sample.pug
3)Use loops in sample.pug so that html is processed dynamically

*/


tweet.get(searchTweets, (err, data, res) => { 
})
.then(function(data){ 	const statuses = data.data.statuses,
		  arrT = [], 
		  retweetCount = [], 
		  likesCount = [],
		  timeAgo = [];

	for(let i = 0; i < 5; i++){
		arrT.push(statuses[i].text); //tweets	
		retweetCount.push(statuses[i].retweet_count); //how many retweets of the tweet
		likesCount.push(statuses[i].favorite_count); //how many like the tweet recieved 
		timeAgo.push(ta.ago(data.data.statuses[i].created_at)); //how much time has passed since the last message
	}

	return [
		arrT, 
		retweetCount, 
		likesCount, 
		timeAgo
		];
	})
	.then(function(nextData){	
		const finalTweets = nextData[0], 
			  finalRetweetCount = nextData[1],
			  finalLikesCount = nextData[2],
			  timeAgo = nextData[3],

			  finalRealNames = [], //followers' real names
			  finalScreenNames = [], //followers' screen names
			  friendsProfileImage = [];
	
		tweet.get(searchFriends, (err, data, res) => {
			
			for(let i = 0; i < 5; i++){
				finalRealNames.push(data.users[i].name); 	
				finalScreenNames.push(data.users[i].screen_name); 
				friendsProfileImage.push(data.users[i].profile_image_url); 
			}
			
			return finalRealNames, 
			finalScreenNames, 
			finalTweets, 
			finalRetweetCount, 
			finalLikesCount, 
			friendsProfileImage, 
			timeAgo;
		})
		.then(function(){
			const finalMessages = [],
				  messageTimes = [],
				  messageProfileImage = [],
				  myProfileImage = [],
				  numOfFollowers = [],
				  messageTime = [],
				  backgroundURL = [];

			tweet.get(searchMessages, (err, data, res) => {
				backgroundURL.push(data[0].recipient.profile_banner_url);
				numOfFollowers.push(data[0].recipient.friends_count); 
				
				for(let i = 0; i < 5; i++){
					finalMessages.push(data[i].text); //messages
					messageTimes.push(ta.ago(data[i].created_at));
					messageProfileImage.push(data[i].sender.profile_image_url); //profile images of those who sent messages
					myProfileImage.push(data[0].recipient.profile_image_url); 
				}
				
				
				return numOfFollowers, 
				finalMessages, 
				finalRealNames, 
				finalScreenNames, 
				finalTweets, 
				finalRetweetCount, 
				finalLikesCount, 
				friendsProfileImage, 
				messageTimes,  
				messageProfileImage,
				backgroundURL, 
				myProfileImage, 
				timeAgo;
			})
			.then(function(){
				app.get('/', (req, res) => {
					res.render(
						'sample', 
						{
						//below are all the locals that are accessed in sample.pug
						tweets: finalTweets,
						friends: finalRealNames,
						screen: finalScreenNames,
						messages: finalMessages,
						retweets: finalRetweetCount,
						likes: finalLikesCount,
						messageTimes: messageTimes,
						messageImage: messageProfileImage,
						friendsImage: friendsProfileImage,
						myImage: myProfileImage,
						backgroundImage: backgroundURL,
						followers: numOfFollowers,
						tweetTime: timeAgo

						}
					);
				});
			});
		});
	});


app.listen(3000, function(){
	console.log("Works!");
});

