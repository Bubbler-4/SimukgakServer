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

io.on('connection', function(socket) {
	console.log("Connection established with a client");
	socket.on('restaurantList', function(data) {
		console.log("Category:", data);
	}).on('message', function(data) {
	}).on('disconnect', function() {
	});
});
