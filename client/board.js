var game;
var gameActive = false;
var us;
var draw;

function handleMove(e) {
  var x = e.pageX - $(this).offset().left;
  var col = parseInt(7*(x/350));
  try {
    game.dropCell(col);
    sendMove(col);
    draw.drawPieces(game.board);
  } catch (err) {
    console.log(err);
    // handle error, should only be related to trying to go in a full column
    alert('bad move');
  }
}

function handleDrop(col) {
  stopPreview();
  draw.drawPieces(game.board);
  if(us == game.waitingPlayer) {
    sendMove(col);
    doneWithMove();
  } else {
    draw.drawPieces(game.board);
    readyForMove();
  }
}

function handleWinner(id) {
  gameActive = false;
  doneWithMove();
  if(id == 0) {
    $("#tie").show();
  } else if(id == us) {
    $('#win').show();
  } else {
    $('#lose').show();
  }
}

function newGame(turn) {
  draw.drawEmptyBoard();
  gameActive = true;
  game = new Game(1, 2, handleWinner, handleDrop);
  draw.drawPieces(game.board);
  us = turn;
  if(us == 1) {
    readyForMove();
  }
  $('#waiting').hide();
  $('#left').hide();
  $('#win').hide();
  $('#tie').hide();
  $('#lose').hide();
}

function gameAbortedByOpponent() {
  doneWithMove();
  gameActive = false;
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

var previewCol;
var showP;

// No matter what, force the preview to be un-drawn
function stopPreview() {
  draw.clearPreview();
  previewCol = undefined;
}

function hidePreview() {
  if(gameActive && us == game.currentPlayer) {
    ws.send("Hide preview");
    draw.clearPreview();
    previewCol = undefined;
  }
}

function updatePreview(e) {
  console.log("update");
  if(us == game.currentPlayer && gameActive) {
    var x = e.pageX - $(this).offset().left;
    var col = parseInt(7*(x/350));
    if(col === previewCol) {
      return;
    } else {
      previewCol = col;
      ws.send("Preview: " + col);
      draw.drawPiece(col, 0, us, true);
    }
  }
}

$(document).ready(function() {
  var ctx = document.getElementById('board').getContext('2d');
  draw = new Drawer(ctx, 350, 300);
  draw.drawEmptyBoard();
  $('#board').mouseleave(hidePreview);
  $('#board').mousemove(updatePreview);
});

function sendMove(col) {
  ws.send(col);
  doneWithMove();
}
