var game;
var gameActive = false;
var us;
var draw;

function handleMove(e) {
  var x = e.pageX - $(this).offset().left;
  var col = parseInt(7*((x - 13)/350));
  $('#badmove').hide();
  try {
    game.dropCell(col);
  } catch (err) {
    console.log(err);
    // handle error, should only be related to trying to go in a full column
    $('#badmove').show();
  }
}

function handleDrop(col) {
  stopPreview();
  $('.turn').toggle();
  var duration = 500;
  draw.animateDrop(game.waitingPlayer, col, game.potentialRow(col) + 1 || 0, duration);
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
  $('#notices div').hide();
  $('#again').show();
  $('#friend').show();
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
  $('#notices div').hide();
  if(us == 1) {
    $('#yourturn').show();
    readyForMove();
  } else {
    $('#theirturn').show();
  }
  $('#actions > *').hide();
}

function gameAbortedByOpponent() {
  doneWithMove();
  gameActive = false;
  $('#again').show();
  $('#friend').show();
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
  if(gameActive && us == game.currentPlayer) {
    var x = e.pageX - $(this).offset().left;
    var col = parseInt(7*((x - 13)/350));
    if(col === previewCol || col > 6) {
      return;
    } else {
      previewCol = col;
      ws.send("Preview: " + col);
      draw.drawPiece(col, game.potentialRow(col), us, true, false);
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
  $('#friend').click(initFriend);
  $('#init-friend').click(getID);
  $('#conn-friend').click(useID);
  $('#join-match-btn').click(joinMatch);
});

function findPlayer() {
  ws.send("Find game");
  $("#actions > *").hide();
  $('#notices div').hide();
  $('#waiting').show();
}

function initFriend() {
  $('#actions > *').hide();
  $('#init-friend, #conn-friend').show();
}

function getID() {
  $('#actions > *').hide();
  ws.send('Need ID');
  $('#waiting').show();
}

function useID() {
  $('#actions > *').hide();
  $('#join-match').show();
}

function joinMatch() {
  $('#actions > *').hide();
  if($('#match-id-input').val() == '') {
    $('#notices > *').hide();
    $('#failed').show();
    $('#again, #friend').show();
    return;
  }
  ws.send('Use ID: ' + $('#match-id-input').val());
  $('#notices div').hide();
  $('#joining-match').show();
}

function sendMove(col) {
  ws.send(col);
  doneWithMove();
}
