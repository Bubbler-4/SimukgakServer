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

server.listen(PORT, function() {
    console.log("Server listening on: http://localhost:%s", PORT);
});