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
  var alphaInner = trans ? 0.15 : 1.0;
  this.drawPiece("rgba(218, 59, 33," + alpha + ")", "rgba(198, 39, 6," + alpha + ")",
                 "rgba(180, 17, 1," + alphaInner + ")",   "rgba(255, 0, 0," + alphaInner +")",
                 "rgba(234, 11, 0," + alphaInner + ")",   "rgba(194, 119, 9," + alphaInner +")",
                 x, y);
}

CanvasRenderingContext2D.prototype.drawBlackPiece = function(x, y, trans) {
  var alpha = trans ? 0.5 : 1.0;
  var alphaInner = trans ? 0.10 : 1.0;
  this.drawPiece("rgba(46, 46, 46," + alpha +")", "rgba(9, 9, 9," + alpha +")",
                 "rgba(9, 9, 9," + alphaInner +")",    "rgba(46, 46, 46," + alphaInner +")",
                 "rgba(85, 85, 85," + alphaInner +")", "rgba(9, 9, 9," + alphaInner + ")",
                 x, y);
}

function Drawer(ctx, width, height) {
  this.ctx = ctx;
  this.w = width;
  this.h = height;
  this.oldBoard;

  this.clearPreview = function() {
    ctx.fillStyle = "#FFF";
    ctx.fillRect(10, 0, 350, 50);
    this.drawPieces(this.oldBoard, false);
  }

  this.drawPiece = function(col, row, type, preview, emptyTrans) {
    var x, y;
    if(preview) {
      this.drawPieces(this.oldBoard, false);
      ctx.fillStyle = "#FFF";
      ctx.fillRect(10, 0, 350, 50);
      x = this.w*(col/7) + 25 + 13;
      y = 25;
    } else {
      x = this.w*(col/7) + 25 + 13;
      y = this.h*(row/6) + 75;
    }
    switch(type) {
      case 0:
        this.ctx.fillStyle = emptyTrans ? "rgba(255, 255, 255, 0.5)" : "#FFF";
        console.log(this.ctx.fillStyle);
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

  this.drawPieces = function(board, emptyTrans) {
    this.oldBoard = board;
    this.drawBoard();
    for(var col = 0; col < 7; col++) {
      for(var row = 0; row < 6; row++) {
        this.drawPiece(col, row, board[col][row], false, emptyTrans);
      }
    }
  }

  this.drawBoard = function() {
    this.ctx.fillStyle = "#CAC90F";
    this.ctx.fillRect(10, 50, this.w + 6, this.h);
    var edge = this.ctx.createLinearGradient(0, 50, 0, 400);
    edge.addColorStop(0.0, "rgb(93, 179, 254)");
    edge.addColorStop(0.65, "rgb(93, 179, 254)");
    edge.addColorStop(0.75, "rgb(70, 139, 200)");
    edge.addColorStop(1, "rgb(93, 179, 245)");

    this.ctx.fillStyle = edge;
    this.ctx.fillRect(0, 50, 10, 400);
    this.ctx.fillRect(366, 50, 10, 400);
  }

  this.drawEmptyBoard = function() {
    this.drawBoard();
    var board = [];
    for(var i = 0; i < 7; i++) {
      board[i] = [];
      for(var j = 0; j < 6; j++) {
        board[i][j] = 0;
      }
    }
    this.drawPieces(board, false);
  }

  this.animate = function() {
    var self = this;
    var y = 50;
    var vel = 0;
    var acc = 9.8;
    var maxY = 320;
    var step = 10;
    var stop = false;
    var draw = function() {
      self.clearPreview();
      self.ctx.fillStyle = "#888";
      self.ctx.fillCircle(38, y, 22);
      self.drawPieces(self.oldBoard, true);
      y += vel * step/30;
      vel += acc * step/30;
      if(stop) {
        return;
      }
      if(y >= maxY) {
        y = maxY;
        stop = true;
      }
      setTimeout(arguments.callee, step);
    }
    setTimeout(draw, step);
  }
}
