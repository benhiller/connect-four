var sys = require('sys'),
    io = require('socket.io'),
    fs = require('fs'),
    url = require('url'),
    c4 = require('../connect-four'),
    p = require('path'),
    http = require('http'),
    puts = sys.debug,
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

function Player(client) {
  this.client = client;
}

var contentTypes = {
  '.html' : 'text/html',
  '.js' : 'text/javascript',
  '.css' : 'text/css',
  '.png' : 'image/png'
};

var server = http.createServer(function(req, res) {
  var path = url.parse(req.url).pathname;
  if (path == '/') {
    path = '/index.html';
  } else if (path == '/connect-four.js') {
    path = '/../connect-four.js';
  }

  fs.readFile(__dirname + '/../client' + path, function(err, data) {
    if (err) {
      res.writeHead(404);
      res.write('404');
      res.end();
    }
    res.writeHead(200, { 'Content-Type' : contentTypes[p.extname(path)] });
    res.write(data, 'utf8');
    res.end();
  });
});
server.listen(80);

var socket = io.listen(server);
socket.on('connection', function(client) {
  // Handling a new player
  var player = new Player(client);

  var handleDrop = function(col) {
    player.game.currentPlayer.client.send({ data : 'Move: ' + col });
  };

  var handleWin = function(id) { };

  client.on('message', function(data) {
    if(data == "Find game") {
      var opponent = waiting.shift();
      if(opponent === undefined) {
        waiting.push(player);
      } else {
        opponent.client.send({ data : "Game found: 1" });
        player.client.send({ data: "Game found: 2" });
        game = c4.createGame(opponent, player, handleWin, handleDrop);
        opponent.game = game;
        player.game = game;
      }
    } else if(data == "Need ID") {
      var id = randomString(10);
      while(id in matches) {
        id = randomString(10);
      }
      player.client.send({ data: "ID: " + id });
      matches[id] = player;
    } else if(data.match(/^Use ID: [0-9a-zA-Z]+/)) {
      var id = data.split("Use ID: ")[1];
      if(id in matches) {
        var opp = matches[id];
        delete matches[id];
        opp.client.send({ data : "Game found: 1" });
        player.client.send({ data : "Game found: 2"});
        game = c4.createGame(opp, player, handleWin, handleDrop);
        opp.game = game;
        player.game = game;
      } else {
        player.client.send({ data : 'Invalid ID' });
      }
    }
    // This may be too broad, only tell other player if we are in a game
    // and the current player
    if(player.game !== undefined && player.game.currentPlayer == player) {
      if(data.match(/^Preview: [0-6]$/)) {
        player.game.waitingPlayer.client.send({ data : data });
      } else if(data == "Hide preview") {
        player.game.waitingPlayer.client.send({ data : data });
      } else if(data.match(/^[0-6]$/)) {
        try {
          player.game.dropCell(parseInt(data));
        } catch(err) {
          puts("Bad move");
          // Handle in some fashion...
          // maybe abort game, maybe ask player for another move
        }
      }
    }
  });

  client.on('disconnect', function() {
    var openPlayersIdx = waiting.indexOf(player);
    // Remove the person who left from the waiting array, if they were in it
    if(openPlayersIdx != -1) {
      waiting.splice(openPlayersIdx, 1);
    } else if(player.game !== undefined && player.game.inProgress) {
      // Tell the persons opponent that they left their game,
      // put their opponent back into the waiting array
      var otherPlayer = player.game.currentPlayer == player ? game.waitingPlayer : game.currentPlayer;
      delete otherPlayer.game;
      otherPlayer.client.send({ data: "Opponent left" });
    }
  });
});

// Prevent exceptions from crashing the server
process.addListener("uncaughtException", function(e) {
  puts(inspect(e));
});
