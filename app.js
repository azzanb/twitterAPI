const tweet = require('./config.js'),
	  ta = require('time-ago')(), //this module will format the twitter time for tweets and messages
	  express = require('express'),
	  path = require('path'),
	  app = express();

//set up pug for html/css template viewing 
app.set('views', __dirname + '/views');
app.set('view engine', 'pug'); 
app.use(express.static(path.join(__dirname, "public")));


const searchTweets = 'https://api.twitter.com/1.1/search/tweets.json?q=Extra_Zany&result_type=recent&count=5';
const searchFriends = 'https://api.twitter.com/1.1/friends/list.json?cursor=-1&screen_name=Extra_Zany&skip_status=true&include_user_entities=false';
const searchMessages = 'https://api.twitter.com/1.1/direct_messages.json?count=5';


//-----JS PROCESS (You'll see a pattern)-----//
/* 

1)Search tweets, then friends, then messages 
2)Return data in array
3)With each promise resolve return array data to be passed down until app.get()
4)Pass the arrays in res.render() as locals; so, the variables, which are used in sample.pug, can be accessed locally

*/

//-----PUG PROCESS-----//
/* 

1)Convert index.html to pug(template.pug) and extend that into my own sample.pug
2)Block the information I need and access the local variables passed in res.render() in sample.pug
3)Use loops in sample.pug so that html is processed dynamically

*/


tweet.get(searchTweets, (err, data, res) => { 
})
.then(function(data){ 	const statuses = data.data.statuses,
		  arrT = [], //these are tweets
		  retweetCount = [], 
		  likesCount = [],
		  timeAgo = [];

	for(let i = 0; i < 5; i++){
		arrT.push(statuses[i].text);	
		retweetCount.push(statuses[i].retweet_count);
		likesCount.push(statuses[i].favorite_count);
		timeAgo.push(ta.ago(data.data.statuses[i].created_at));
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
				  messageTime = [];

			tweet.get(searchMessages, (err, data, res) => {
				numOfFollowers.push(data[0].recipient.friends_count); //counts the number of people I'm following and pushes into array
				
				for(let i = 0; i < 5; i++){
					finalMessages.push(data[i].text);
					messageTimes.push(ta.ago(data[i].created_at));
					messageProfileImage.push(data[i].sender.profile_image_url);
					myProfileImage.push(data[0].recipient.profile_image_url);
				}
				
				//the total list of arrays (containing all necessary twitter information) that will be passed as variables to res.render().
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
				myProfileImage, 
				timeAgo;
			})
			.then(function(){
				app.get('/', (req, res) => {
					res.render(
						'sample', 
						{
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

