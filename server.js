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

// TODO: Change to take restaurant lists from a file
var restaurantLists = {
	"한식": ["한식A", "한식B"],
	"중식": ["중식A", "중식B"],
	"일식": ["일식A", "일식B"]
};

var fbAdmin = require('firebase-admin');

fbAdmin.initializeApp({
	credential: admin.credential.cert('simukgak-firebase-adminsdk-oa3j3-61a6234572.json'),
	databaseURL: "https://simukgak.firebaseio.com"
});

io.on('connection', function(socket) {
	console.log("Connection established with a client");
	socket.on('restaurantList', function(category) {
		// category: restaurant category as a string
		// return the restaurant list in the given category
		console.log("Category:", category);
		socket.emit('restaurantList', restaurantLists[category]);
	}).on('message', function(data) {
	}).on('disconnect', function() {
	});
});
