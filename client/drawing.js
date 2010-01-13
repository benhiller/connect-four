CanvasRenderingContext2D.prototype.fillCircle = function(x, y, radius) {
  this.beginPath();
  this.arc(x, y, radius, 0, Math.PI*2, true);
  this.closePath();
  this.fill();
}

function Drawer(ctx, width, height) {
  this.ctx = ctx;
  this.w = width;
  this.h = height;

  this.clearPreview = function() {
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, 350, 50);
  }

  this.drawPiece = function(col, row, type, preview) {
    var x, y;
    if(preview) {
      ctx.fillStyle = "#FFF";
      ctx.fillRect(0, 0, 350, 50);
      x = 350*(col/7) + 25;
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
        var redOutter = this.ctx.createLinearGradient(x - 22, y, 0, x + 22, y);
        redOutter.addColorStop(0, "#D16565");
        redOutter.addColorStop(1, "#E96D70");
        this.ctx.fillStyle = redOutter;
        this.ctx.fillStyle = redOutter;
        this.ctx.fillCircle(x, y, 18);
        break;
      case 2:
        this.ctx.fillStyle = "#000";
        this.ctx.fillCircle(x, y, 22);
        break;
    }
  }

  this.drawPieces = function(board) {
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
