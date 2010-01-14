var game;
var gameActive = false;
var us;
var draw;

function handleMove(e) {
  var x = e.pageX - $(this).offset().left;
  var col = parseInt(7*(x/350));
  try {
    game.dropCell(col);
  } catch (err) {
    console.log(err);
    // handle error, should only be related to trying to go in a full column
    alert('bad move');
  }
}

function handleDrop(col) {
  stopPreview();
  $('.turn').toggle();
  draw.drawPieces(game.board);
  if(us == game.waitingPlayer) {
    sendMove(col);
    doneWithMove();
  } else {
    readyForMove();
  }
}

function handleWinner(id) {
  gameActive = false;
  doneWithMove();
  $('.turn').hide();
  $('#again').show();
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
  us = turn;
  if(us == 1) {
    $('#yourturn').show();
    readyForMove();
  } else {
    $('#theirturn').show();
  }
  $('#waiting').hide();
  $('#left').hide();
  $('#win').hide();
  $('#tie').hide();
  $('#lose').hide();
  $('#again').hide();
}

function gameAbortedByOpponent() {
  doneWithMove();
  gameActive = false;
  $('#left').show();
  $('.turn').hide();
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
  if(gameActive && us == game.currentPlayer) {
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
  $('#again, #go').click(findPlayer);
});

function findPlayer() {
  ws.send("Find game");
  $("#again, #go").hide();
  $('#waiting').show();
}

function sendMove(col) {
  ws.send(col);
  doneWithMove();
}
