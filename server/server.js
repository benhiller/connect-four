var sys = require('sys'),
    ws = require('./ws'),
    c4 = require('../connect-four'),
    puts = sys.puts,
    inspect = sys.inspect;

// State
// An array of players waiting for a game
var waiting = [];
var matches = {};

// Copied from http://www.mediacollege.com/internet/javascript/number/random.html
function randomString(length) {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var randomstring = '';
  for (var i=0; i < length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum,rnum+1);
  }
  return randomstring;
}

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

  var handleDrop = function(col) {
    player.game.currentPlayer.ws.send('Move: ' + col);
  };

  var handleWin = function(id) {
  };

  websocket.addListener("receive", function(data) {
    if(data == "Find game") {
      var opponent = waiting.shift();
      if(opponent === undefined) {
        waiting.push(player);
      } else {
        opponent.ws.send("Game found: 1");
        player.ws.send("Game found: 2");
        game = c4.createGame(opponent, player, handleWin, handleDrop);
        opponent.game = game;
        player.game = game;
      }
    } else if(data == "Need ID") {
      var id = randomString(10);
      while(id in matches) {
        id = randomString(10);
      }
      player.ws.send("ID: " + id);
      matches[id] = player;
    } else if(data.match(/^Use ID: [0-9a-zA-Z]+/)) {
      var id = data.split("Use ID: ")[1];
      if(id in matches) {
        var opp = matches[id];
        delete matches[id];
        opp.ws.send("Game found: 1");
        player.ws.send("Game found: 2");
        game = c4.createGame(opp, player, handleWin, handleDrop);
        opp.game = game;
        player.game = game;
      } else {
        player.ws.send('Invalid ID');
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
        player.game.dropCell(parseInt(data));
      }
    }
  })
 .addListener("close", function() {
    var openPlayersIdx = waiting.indexOf(player);
    // Remove the person who left from the waiting array, if they were in it
    if(openPlayersIdx != -1) {
      waiting.splice(openPlayersIdx, 1);
    } else if(player.game !== undefined && player.game.inProgress) {
      // Tell the persons opponent that they left their game,
      // put their opponent back into the waiting array
      var otherPlayer = player.game.currentPlayer == player ? game.waitingPlayer : game.currentPlayer;
      delete otherPlayer.game;
      otherPlayer.ws.send("Opponent left");
    }
  });
}).listen(8080);
