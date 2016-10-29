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

server.listen(process.env.PORT || PORT, function() {
    console.log("Server running on port", PORT);
});

var io = require('socket.io')(server);

var id2socket = {};
var socket2id = {};

io.on('connection', function(socket) {
	console.log("Connection established with a client");
	socket.on('id', function(data) {
		console.log("The socket's ID is", data);
		id2socket[data] = socket.id;
		socket2id[socket.id] = data;
	}).on('message', function(data) {
		var id = data.id;
		var msg = data.msg;
		console.log("Received a message to", id, "saying:", msg);
		if(id2socket[id]) {
			console.log("Sending the message");
			io.sockets.in(id2socket[id]).emit('message', {
				id: socket2id[socket.id],
				msg: msg
			});
		}
	});
});
