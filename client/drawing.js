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
        var redOutter = this.ctx.createLinearGradient(x - 22, y, x + 22, y);
        redOutter.addColorStop(0, "#B51C1C");
        redOutter.addColorStop(1, "#C40E01");
        this.ctx.fillStyle = redOutter;
        this.ctx.fillCircle(x, y, 22);
        var circle = this.ctx.createLinearGradient(x, y - 22, x, y + 22);
        circle.addColorStop(0, "#FF798C");
        circle.addColorStop(1, "#600200");
        this.ctx.strokeStyle = circle;
        this.ctx.strokeCircle(x, y, 16);
        var redInner = this.ctx.createLinearGradient(x, y - 22, x, y + 22);
        redInner.addColorStop(0, "#C70002");
        redInner.addColorStop(1, "#B90102");
        this.ctx.fillStyle = redInner;
        this.ctx.fillCircle(x, y, 15);
        break;
      case 2:
        var blackOutter = this.ctx.createLinearGradient(x - 22, y, x + 22, y);
        blackOutter.addColorStop(0, "#000");
        blackOutter.addColorStop(1, "#000");
        this.ctx.fillStyle = blackOutter;
        this.ctx.fillCircle(x, y, 22);
        var circle = this.ctx.createLinearGradient(x, y - 22, x, y + 22);
        circle.addColorStop(0, "#CFCFCF");
        circle.addColorStop(1, "#1D1D1D");
        this.ctx.strokeStyle = circle;
        this.ctx.strokeCircle(x, y, 16);
        var blackInner = this.ctx.createLinearGradient(x, y - 22, x, y + 22);
        blackInner.addColorStop(0, "#000");
        blackInner.addColorStop(1, "#000");
        this.ctx.fillStyle = blackInner;
        this.ctx.fillCircle(x, y, 15);

        break;
    }
  }

  this.drawPieces = function(board) {
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

  this.animatePiece = function() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillCircle(100, 100, 25);
  }
}
