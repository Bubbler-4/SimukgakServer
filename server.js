var http = require('http');
var url = require('url');

const PORT = 8080; 

function handleRequest(request, response) {
	response.end("This server is not for web access. Sorry.")
}

var server = http.createServer(handleRequest);

server.listen(process.env.PORT || PORT, function() {
    console.log("Server running on port", PORT);
});

var io = require('socket.io')(server);

var fbAdmin = require('firebase-admin');

fbApp = fbAdmin.initializeApp({
	credential: fbAdmin.credential.cert('simukgak-firebase-adminsdk-oa3j3-61a6234572.json'),
	databaseURL: "https://simukgak.firebaseio.com"
});

var FCM = require('fcm-push');
var fcm = new FCM('AAAAdAxE6Hg:APA91bF0MoaZyRtvgZ2hoRNshMbCwFvn32Jpb8jpiqrozCyQiQGlXqrxk-VLp1xnjrqkU20kPQg8MvIillGsotRtPyc4MqiENvb9HQBExjuG_rrXgaktwmscyPej-8VvnuZ_vzV167ohpWJAa3XkRKBeyKteVvi2jQ');

// TODO: Change to take restaurant lists from a file
var restaurantLists = {
	"한식": ["한식A", "한식B"],
	"중식": ["중식A", "중식B"],
	"일식": ["일식A", "일식B"]
};

var tokenList = {};
var user2ID = {};
var users2msgID = {};

var dutchMsgID = 101;

var nextDutchMsgID = function() {
	var x = dutchMsgID;
	dutchMsgID += 1;
	if(dutchMsgID > 10000000) {
		dutchMsgID = 101;
	}
	return x;
};

io.on('connection', function(socket) {
	console.log("Connection established with a client");
	
	socket.on('FBToken', function(token, user) {
		// register username
		console.log('Received token', token, 'whose username is', user);
		tokenList[user] = token;
		user2ID[user] = socket.id;
	}).on('restaurantList', function(category) {
		// category: restaurant category as a string
		// return the restaurant list in the given category
		console.log("Category:", category);
		socket.emit('restaurantList', restaurantLists[category]);
	}).on('DutchRequest', function(nameFrom, nameTo, price) {
		// Message test
		var message = {
			to: tokenList[nameTo],
			data: {
				title: '"더치페이 요청"',
				message: '"' + nameFrom + '에게 ' + price + '원을 보내주세요."',
				timestamp: Date.now(),
				messageID: nextDutchMsgID()
			},
			notification: {
				title: '"더치페이 요청"',
				body: '"' + nameFrom + '에게 ' + price + '원을 보내주세요."'
			}
		};
		console.log(message);
		fcm.send(message, function(err, response) {
			if(err) {
				console.log('Error while sending push notification');
				console.log(err);
			}
			else {
				console.log('Push notification successful');
				if(users2msgID[nameFrom] == null) {
					users2msgID[nameFrom] = {};
				}
				if(users2msgID[nameFrom][nameTo] == null) {
					users2msgID[nameFrom][nameTo] = [];
				}
				users2msgID[nameFrom][nameTo].push(message.data.messageID);
			}
		});
	}).on('DutchDismiss', function(nameFrom, nameTo) {
		// Dismiss all messages from nameFrom to nameTo
		if(users2msgID[nameFrom] == null) {
			users2msgID[nameFrom] = {};
		}
		if(users2msgID[nameFrom][nameTo] == null) {
			users2msgID[nameFrom][nameTo] = [];
		}
		var len = users2msgID[nameFrom][nameTo].length;
		for(var i = 0; i < len; i += 1) {
			var message = {
				to: tokenList[nameTo],
				data: {
					messageID: users2msgID[nameFrom][nameTo][i],
					dismiss: true
				}
			};
			console.log(message);
			fcm.send(message, function(err, response) {
				if(err) {
					console.log('Error while sending push notification');
					console.log(err);
				}
				else {
					console.log('Push notification successful');
				}
			});
		}
		users2msgID[nameFrom][nameTo] = [];
	}).on('disconnect', function() {
	});
});
