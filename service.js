const ws = require("ws");
const EventEmitter = require("events");

class Game extends EventEmitter {
	constructor() {
		super();

		this.board = new Array(9);
	}

	move( user, x, y ){
		if( this.lastMoved == user ){
			return false;
		}

		const position = (y * 3) + x;
		if( this.board[position] ){
			return false;
		}

		this.lastMoved = user;
		this.board[position] = user;
		this.emit("moved", {user, x, y});
		return true;
	}

	boardState() {
		return this.board;
	}
}

const game = new Game();

const clients = [];

const service = new ws.Server({port: process.env.PORT || 1234})
service.on("connection", function( ws ){

	clients.push(ws);
	let user;

	function moveDispatcher(e) {
		ws.send(JSON.stringify(Object.assign({type: "move"}, e)));
	}

	game.on("moved", moveDispatcher);

	ws.on("close", function(){
		game.off("moved", moveDispatcher);
	});
	ws.on("message", function(m){
		try {
			const frame = JSON.parse(m);
			const type = frame.type;
			if( !user ){
				if( type != "user" ){
					return ws.send( JSON.stringify({type:"error", error: "User name not declare"}));
				}
				console.log("New user ", frame);
				user = frame.user;
			} else {
				switch(type) {
					case "move" :
						console.log("Move!  ", frame);
						const valid = game.move( user, frame.x, frame.y );
						if ( !valid ){
							ws.send( JSON.stringify( {type: "error", error: "Invalid move. Try again?"} ) )
						}
						break;
					case "state":
						console.log("State!  ", frame);
						ws.send( JSON.stringify({type: "state", board: game.boardState() }));
						break;
					default:
						return ws.send( JSON.stringify({type:"error", error: "Unknonw command", command: type}));
				}
			}
		}catch(e){
			console.error(e);
			ws.send( JSON.stringify({type:"error", error: "Unable to parse frame", e}));
		}
	});
});
