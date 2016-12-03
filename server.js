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

var menuLists = {
	"한식A": {
		"카테고리1": {
			"A11": 5000,
			"A12": 5500
		},
		"카테고리2": {
			"A21": 5500,
			"A22": 6000
		}
	},
	"한식B": {
		"카테고리1": {
			"B11": 5000,
			"B12": 5500
		},
		"카테고리2": {
			"B21": 5500,
			"B22": 6000
		}
	},
	"중식A": {
		"카테고리1": {
			"C11": 5000,
			"C12": 5500
		},
		"카테고리2": {
			"C21": 5500,
			"C22": 6000
		}
	},
	"중식B": {
		"카테고리1": {
			"D11": 5000,
			"D12": 5500
		},
		"카테고리2": {
			"D21": 5500,
			"D22": 6000
		}
	},
	"일식A": {
		"카테고리1": {
			"E11": 5000,
			"E12": 5500
		},
		"카테고리2": {
			"E21": 5500,
			"E22": 6000
		}
	},
	"일식B": {
		"카테고리1": {
			"F11": 5000,
			"F12": 5500
		},
		"카테고리2": {
			"F21": 5500,
			"F22": 6000
		}
	}
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
	}).on('menuList', function(restaurant) {
		// restaurant: restaurant name as a string
		// return the menu list for the given restaurant
		console.log("Restaurant:", restaurant);
		socket.emit('menuList', menuLists[restaurant]);
	}).on('Order', function(order) {
		// order: object with fields store, timestamp, address, payment, items {menu, count}
		// TODO send to the restaurant's device
		console.log("Order:", order);
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
