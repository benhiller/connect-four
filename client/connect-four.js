function Game(p1, p2, handleWin, handleDrop) {
  this.currentPlayer = p1;
  this.waitingPlayer = p2;
  this.handleWin = handleWin;
  this.handleDrop = handleDrop;
  this.board = [];
  for(var i = 0; i < 7; i++) {
    this.board[i] = [];
    for(var j = 0; j < 6; j++) {
      this.board[i][j] = 0;
    }
  }
  console.log(this.board);

  this.dropCell = function(col) {
    for(var row = 5; row >= 0; row--) {
      if(this.board[col][row] == 0) {
        this.board[col][row] = this.currentPlayer;
        var temp = this.currentPlayer;
        this.currentPlayer = this.waitingPlayer;
        this.waitingPlayer = temp;
        break;
      } else if(this.board[col][row] != 0 && row == 0) {
        throw "FullColError";
      }
    }
    this.handleDrop(col);
    this.checkForWinner();
  }

  // Returns false if no one has won
  this.checkForWinner = function() {
    function checkWinnerFrom(col, row) {
      console.log(this.board);
      var player = this.board[col][row];
      for(var i = col - 1; i <= col + 1; i++) {
        for(var j = row - 1; j <= row + 1; j++) {
          if(i < 0 || j < 0 || i > 6 || j > 5 || (i == col && j == row)) continue;
          if(this.board[i][j] == player) {
            if(checkWinnerInDirection(col, row, i - col, j - row)) {
              return true;
            }
          }
        }
      }
    }

    function checkWinnerInDirection(col, row, left, up) {
      var player = this.board[col][row];
      for(var i = 0; i <= 3; i ++) {
        var x = col + left*i;
        var y = row + up*i;
        if(x < 0 || y < 0 || x > 6 || y > 5) return false;
        if(this.board[x][y] == player) continue;
        else { return false; }
      }
      return true;
    }

    for(var col = 0; col < 7; col++) {
      for(var row = 0; row < 6; row++) {
        if(this.board[col][row] == 0) continue;
        if(checkWinnerFrom(col, row)) {
          this.handleWin(this.board[col][row]);
        }
      }
    }
  }
}
