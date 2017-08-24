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

//Will be used on line 72
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

tweet.get('account/verify_credentials', { skip_status: true }, function(err, data, res){	
})
.then(function(result){
	const myScreenName = result.data.screen_name,
		  myName = result.data.name,
		  friends = result.data.friends_count,
		  myImage = result.data.profile_image_url;

	const statuses = [],
	      retweetCount = [], 
	      likesCount = [],
	      tweetTimeAgo = [];

	tweet.get('search/tweets', {q: myScreenName, count: 5}, function(err, data, res){
		for(let i = 0; i < 5; i++){
			statuses.push(data.statuses[i].text);
			retweetCount.push(data.statuses[i].retweet_count);
			likesCount.push(data.statuses[i].favorite_count);
			tweetTimeAgo.push(ta.ago(data.statuses[i].created_at));
		}
		return statuses, friends, myImage, myScreenName, myName, retweetCount, likesCount, tweetTimeAgo;
	})
	.then(function(){
		const realNames = [], //followers' real names
		  	  screenNames = [], //followers' screen names
		  	  friendsProfileImage = [];

		tweet.get('friends/list', {screen_name: myScreenName}, function(err, data, res){
			for(let i = 0; i < 5; i++){
				realNames.push(data.users[i].name);
				screenNames.push(data.users[i].screen_name);
				friendsProfileImage.push(data.users[i].profile_image_url);
			}
			return realNames, screenNames, friendsProfileImage;
		})
		.then(function(){
			const messages = [],
				  messageTimeAgo = [], 
				  messageImage = [];

			tweet.get(searchMessages, (err, data, res) => {
				for(let i = 0; i < 5; i++){
					messages.push(data[i].text);
					messageImage.push(data[i].sender.profile_image_url);
					messageTimeAgo.push(ta.ago(data[i].created_at));
				}
				return messages, messageTimeAgo, messageImage;	
			})
			.then(() => {
				app.get('/', (req, res) => {
					res.render(
						'sample', 
						{
						//below are all the locals that are accessed in sample.pug
						tweets: statuses,
						realNames: realNames,
						screen: screenNames,
						myScreenName: myScreenName,
						myName: myName,
						messages: messages,
						retweets: retweetCount,
						likes: likesCount,
						messageTimes: messageTimeAgo,
						messageImage: messageImage,
						friendsImage: friendsProfileImage,
						myImage: myImage,
						friends: friends,
						tweetTime: tweetTimeAgo
						}
					);
				});
			});
		});
	});
});
	

app.listen(3000, function(){
	console.log("Works!");
});

