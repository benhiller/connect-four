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
        this.ctx.fillStyle = emptyTrans ? "rgba(255, 255, 255, 0.0)" : "#FFF";
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
    for(var i = 0; i < 7; i++) {
      this.ctx.beginPath();
      for(var j = 0; j < 6; j++) {
        var x = this.w*(i/7) + 25 + 13;
        var y = this.h*(j/6) + 75;
        this.ctx.arc(x, y, 22, 0, Math.PI*2, true);
      }
      this.ctx.rect(10 + i*(this.w + 6)/7, 50, (this.w + 6)/7, this.h);
      this.ctx.closePath();
      this.ctx.fill();
    }
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

  this.animateDrop = function(type, col, row, duration) {
    var self = this;
    var oldBoard = this.oldBoard;
    var draw = function(y) {
      self.clearPreview();
      self.ctx.fillStyle = "#888";
      var x = self.w*(col/7) + 25 + 13;
      if(type == 1) {
        self.ctx.drawRedPiece(x, y, false);
      } else {
        self.ctx.drawBlackPiece(x, y, false);
      }
      self.drawPieces(oldBoard, true);
    }
    var endY = this.h*(row/6) + 75;
    console.log(row);
    this.animate(50, endY - 50, draw, duration, 5, col, row, type);
  }

  this.animate = function(startY, endY, draw, duration, step, col, row, type) {
    var draw = draw;
    var start = new Date().getTime();
    var elapsed = 0;
    var self = this;
    var update = function() {
      var now = new Date().getTime();
      elapsed += now - start;
      if(elapsed > duration) {
        elapsed = duration;
      }
      start = now;
      var y = easeOutBounce(elapsed, startY, endY, duration);
      draw(y);
      if(elapsed == duration) {
        self.oldBoard[col][row] = type;
        return;
      }
      setTimeout(arguments.callee, step);
    }
    setTimeout(update, step);
  }
}

// taken from jquery easing plugin
// t = current time
// b = start value
// c = change in value -- NOT end value
// d = total time
function easeOutBounce(t, b, c, d) {
  if ((t/=d) < (1/2.75)) {
    return c*(7.5625*t*t) + b;
  } else if (t < (2/2.75)) {
    return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
  } else if (t < (2.5/2.75)) {
    return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
  } else {
    return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
  }
}
