// TODO: don't deal with previews right now

// Interface:
// currentPlayer, waitingPlayer :: Int,
// board :: [[Int]],
// dropCell :: Int -> (), can throw exception on bad move,
var game;
var us;
// Interface:
// drawEmptyBoard, drawBoard :: (),
// drawPieces :: [[Int]] -> (),
// drawPiece :: Int -> Int -> Int -> Bool -> ()
var draw;

// If placing piece
// TODO  stopPreview();

function handleMove(e) {
  var x = e.pageX - $(this).offset().left;
  var col = parseInt(7*(x/350));
  // WS.send
  //try {
    game.dropCell(col);
    sendMove(col);
    draw.drawPieces(game.board);
  //} catch (err) {
  //  console.log(err);
    // handle error, should only be related to trying to go in a full column
  //  alert('bad move');
  //}
}

function handleDrop(col) {
  if(us == game.currentPlayer) {
    sendMove(col);
    draw.drawPieces(game.board);
    doneWithMove();
  } else {
    readyForMove();
  }
}

function handleWinner(id) {
  game = undefined;
  doneWithMove();
  alert(id);
}

function newGame(turn) {
  game = new Game(1, 2, handleWinner, handleDrop);
  us = turn;
  if(us == 1) {
    readyForMove();
  }
  $('#waiting').hide();
  $('#left').hide();
}

function gameAbortedByOpponent() {
  game = undefined;
  us = undefined;
  $('#left').show();
}

function opponentMoved(col) {
  game.dropCell(col);
}

function readyForMove() {
  $('#board').click(handleMove);
}

function doneWithMove() {
  $('#board').unbind('click');
}

// Preview code
/*
var previewCol;
var showP;

function showPreview() {
  if(currentPlayer == id) {
    showP = true;
  } else {
    showP = false;
  }
}

function stopPreview() {
  var canvas = document.getElementById('board');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = "#FFF";
  ctx.fillRect(0, 0, 350, 50);
  showP = false;
  previewCol = undefined;
}

function hidePreview() {
  console.log('a');
  ws.send("Hide preview");
  var canvas = document.getElementById('board');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = "#FFF";
  ctx.fillRect(0, 0, 350, 50);
  showP = false;
  previewCol = undefined;
}

function updatePreview(e) {
  if(showP) {
    var x = e.pageX - $(this).offset().left;
    var col = parseInt(7*(x/350));
    if(col === previewCol) {
      return;
    } else {
      previewCol = col;
      ws.send("Preview: " + col);
      drawPreview(col);
    }
  }
  console.log('update');
}
*/

$(document).ready(function() {
  var ctx = document.getElementById('board').getContext('2d');
  draw = new Drawer(ctx, 350, 300);
  draw.drawEmptyBoard();
 // TODO preview stuff
 // $('#board').mouseenter(showPreview);
 // $('#board').mouseleave(hidePreview);
 // $('#board').mousemove(updatePreview);
});

function sendMove(col) {
  ws.send(col);
  doneWithMove();
}
