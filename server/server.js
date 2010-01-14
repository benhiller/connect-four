var sys = require('sys'),
    ws = require('./ws'),
    c4 = require('../connect-four'),
    puts = sys.puts,
    inspect = sys.inspect;

// State
// An array of players waiting for a game
var waiting = [];

// If we aren't adding anything else to this object, just use the ws
function Player(ws) {
  this.ws = ws;
}

// Prevent exceptions from crashing the server
process.addListener("uncaughtException", function(e) {
  puts(inspect(e));
});

ws.createServer(function(websocket) {

  // Handling a new player
  var player = new Player(websocket);
  var opponent = waiting.shift();
  // No open players
  if(opponent === undefined) {
    // Put the player on the queue, so another player can find them
    waiting.push(player);
  } else {
    // Tell both players that a game was found
    player.ws.send("Game found: 1");
    opponent.ws.send("Game found: 2");
    game = c4.createGame(player, opponent, function(x) {}, function(x) {});
    player.game = game;
    opponent.game = game;
  }

  websocket.addListener("receive", function(data) {
    if(data == "Find game") {
      var opponent = waiting.shift();
      if(opponent === undefined) {
        waiting.push(player);
      } else {
        opponent.ws.send("Game found: 1");
        player.ws.send("Game found: 2");
        game = c4.createGame(opponent, player, function(x) {}, function(x) {});
        opponent.game = game;
        player.game = game;
      }
    }
    // This may be too broad, only tell other player if we are in a game
    // and the current player
    if(player.game !== undefined && player.game.currentPlayer == player) {
      if(data.match(/^Preview: [0-6]$/)) {
        player.game.waitingPlayer.ws.send(data);
      } else if(data == "Hide preview") {
        player.game.waitingPlayer.ws.send(data);
      } else {
        player.game.waitingPlayer.ws.send('Move: ' + data);
        var temp = player.game.currentPlayer;
        player.game.currentPlayer = player.game.waitingPlayer;
        player.game.waitingPlayer = temp;
      }
    }
  })
 .addListener("close", function() {
    var openPlayersIdx = waiting.indexOf(player);
    // Remove the person who left from the waiting array, if they were in it
    if(openPlayersIdx != -1) {
      waiting.splice(openPlayersIdx, 1);
    } else {
      // Tell the persons opponent that they left their game,
      // put their opponent back into the waiting array
      var otherPlayer = player.game.currentPlayer == player ? game.waitingPlayer : game.currentPlayer;
      delete otherPlayer.game;
      otherPlayer.ws.send("Opponent left");
      var opponent = waiting.shift();
      if(opponent === undefined) {
        waiting.push(otherPlayer);
      } else {
        opponent.ws.send("Game found: 1");
        otherPlayer.ws.send("Game found: 2");
        game = c4.createGame(opponent, otherPlayer, function(x) {}, function(x) {});
        opponent.game = game;
        otherPlayer.game = game;
      }
    }
  });
}).listen(8080);
