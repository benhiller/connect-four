CanvasRenderingContext2D.prototype.fillCircle = function(x, y, radius) {
  this.beginPath();
  this.arc(x, y, radius, 0, Math.PI*2, true);
  this.closePath();
  this.fill();
}

CanvasRenderingContext2D.prototype.strokeCircle = function(x, y, radius) {
  this.beginPath();
  this.arc(x, y, radius, 0, Math.PI*2, true);
  this.closePath();
  this.stroke();
}

CanvasRenderingContext2D.prototype.drawPiece = function(outterStart, outterEnd, innerStart, innerEnd, circleStart, circleEnd, x, y) {
  var outter = this.createLinearGradient(x - 22, y, x + 22, y);
  outter.addColorStop(0, outterStart);
  outter.addColorStop(1, outterEnd);
  this.fillStyle = outter;
  this.fillCircle(x, y, 22);
  var inner = this.createLinearGradient(x - 22, y - 22, x + 22, y + 22);
  inner.addColorStop(0, innerStart);
  inner.addColorStop(1, innerEnd);
  this.fillStyle = inner;
  this.fillCircle(x, y, 16);
  var circle = this.createLinearGradient(x - 22, y - 22, x + 22, y + 22);
  circle.addColorStop(0, circleStart);
  circle.addColorStop(1, circleEnd);
  this.strokeStyle = circle;
  this.strokeCircle(x, y, 16);

}

CanvasRenderingContext2D.prototype.drawRedPiece = function(x, y, trans) {
  var alpha = trans ? 0.5 : 1.0;
  this.drawPiece("rgba(218, 59, 33," + alpha + ")", "rgba(198, 39, 6," + alpha + ")",
                 "rgba(180, 17, 1," + alpha +")",   "rgba(255, 0, 0," + alpha +")",
                 "rgba(234, 11, 0," + alpha +")",   "rgba(194, 119, 9," + alpha +")",
                 x, y);
}

CanvasRenderingContext2D.prototype.drawBlackPiece = function(x, y, trans) {
  var alpha = trans ? 0.5 : 1.0;
  this.drawPiece("rgba(46, 46, 46," + alpha +")", "rgba(9, 9, 9," + alpha +")",
                 "rgba(9, 9, 9," + alpha +")",    "rgba(46, 46, 46," + alpha +")",
                 "rgba(85, 85, 85," + alpha +")", "rgba(9, 9, 9," + alpha +")",
                 x, y);
}

function Drawer(ctx, width, height) {
  this.ctx = ctx;
  this.w = width;
  this.h = height;
  this.oldBoard;

  this.clearPreview = function() {
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, 350, 50);
    this.drawPieces(this.oldBoard);
  }

  this.drawPiece = function(col, row, type, preview) {
    var x, y;
    if(preview) {
      this.drawPieces(this.oldBoard);
      ctx.fillStyle = "#FFF";
      ctx.fillRect(0, 0, 350, 50);
      x = this.w*(col/7) + 25;
      y = 25;
    } else {
      x = this.w*(col/7) + 25;
      y = this.h*(row/6) + 75;
    }
    switch(type) {
      case 0:
        this.ctx.fillStyle = "#FFF";
        this.ctx.fillCircle(x, y, 22);
        break;
      case 1:
        this.ctx.drawRedPiece(x, y, false);
        break;
      case 2:
        this.ctx.drawBlackPiece(x, y, false);
        break;
    }
    if(preview && row !== undefined) {
      y = this.h*(row/6) + 75;
      switch(type) {
        case 1:
          this.ctx.drawRedPiece(x, y, true);
          break;
        case 2:
          this.ctx.drawBlackPiece(x, y, true);
          break;
      }
    }
  }

  this.drawPieces = function(board) {
    this.oldBoard = board;
    this.drawBoard();
    for(var col = 0; col < 7; col++) {
      for(var row = 0; row < 6; row++) {
        this.drawPiece(col, row, board[col][row]);
      }
    }
  }

  this.drawBoard = function() {
    this.ctx.fillStyle = "#CAC90F";
    this.ctx.fillRect(0, 50, this.w, this.h);
  }

  this.drawEmptyBoard = function() {
    this.ctx.fillStyle = "#CAC90F";
    this.ctx.fillRect(0, 50, this.w, this.h);
    var board = [];
    for(var i = 0; i < 7; i++) {
      board[i] = [];
      for(var j = 0; j < 6; j++) {
        board[i][j] = 0;
      }
    }
    this.drawPieces(board);
  }
}
