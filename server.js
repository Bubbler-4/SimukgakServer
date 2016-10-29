var http = require('http');
var url = require('url');

const PORT = 8080; 

function handleRequest(request, response) {
	var numberStr = url.parse(request.url, true).query.number;
	if(typeof numberStr == 'undefined') {
		response.end('Invalid request');
	}
	else {
		var number = parseInt(numberStr);
		if(isNaN(number)) {
			response.end('Not a number');
		}
		else {
			response.end((number * 2).toString());
		}
	}
}

var server = http.createServer(handleRequest);

var socket = require('socket.io')(server);

socket.on('connection', function(socket) {
	console.log("Connection established with a client");
});

server.listen(process.env.PORT || PORT, function() {
    console.log("Server running on port", PORT);
});