const ws = require("ws");

const service = new ws.Server({port: process.env.PORT || 1234})
service.on("connection", function( ws ){
	ws.on("message", function(m){
		try {
			console.log(m);
		}catch(e){
			console.error(e);
		}
	});
});
