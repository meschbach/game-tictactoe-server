const ws = require("ws");

const clients = [];

const service = new ws.Server({port: process.env.PORT || 1234})
service.on("connection", function( ws ){

	clients.push(ws);

	ws.on("message", function(m){
		try {
			if( !m.type ){
				clients.forEach( (c) => {
					c.send(m);
				});
			} else {
				console.log(m);
			}
		}catch(e){
			console.error(e);
		}
	});
});
