function Board(rows) {
  this.rows = rows;
}

Board.prototype.clear = function () {
  const board = document.getElementById("board");
  while (board.firstChild) board.removeChild(board.firstChild);
};

Board.prototype.draw = function () {
  const board = document.getElementById("board");
  const checkerBoard = document.createElement("fieldset");
  const rows = this.rows;
  let row, squares;
  for (const rowNum in rows) {
    squares = rows[rowNum].squares;
    row = new Row(rowNum, squares);
    checkerBoard.prepend(row.draw());
  }
  board.appendChild(checkerBoard);
};

Board.prototype.redraw = function () {
  this.clear();
  this.draw();
};
function Checker(color = "black", isKing = false) {
  this.color = color;
  this.isKing = isKing;
}

Checker.prototype.draw = function () {
  const checker = document.createElement("div");
  checker.classList.add("checker");
  checker.classList.add(this.color);
  if (this.isKing) checker.classList.add("king");
  return checker;
};

Checker.prototype.crown = function () {
  this.isKing = true;
};
function Row(rowNum, squares) {
  this.rowNum = rowNum;
  this.squares = squares;
}

Row.prototype.draw = function () {
  const squares = this.squares;
  const rowNum = this.rowNum;
  const row = document.createElement("div");
  let checker, square;
  row.className = "row";
  row.dataset.rowNum = rowNum;
  for (const squareNum in squares) {
    checker = squares[squareNum].checker;
    square = checker
      ? new Square(
          rowNum,
          squareNum,
          new Checker(checker.color, checker.isKing)
        )
      : new Square(rowNum, squareNum, checker);
    row.prepend(square.draw());
  }
  return row;
};
function Square(rowNum, squareNum, checker = null) {
  this.rowNum = rowNum;
  this.squareNum = squareNum;
  this.checker = checker;
}

Square.prototype.draw = function () {
  const square = document.createElement("div");
  const checker = this.checker;
  square.className = "square";
  square.dataset.rowNum = this.rowNum;
  square.dataset.squareNum = this.squareNum;
  if (checker) square.appendChild(checker.draw());
  return square;
};

Square.prototype.clear = function () {
  const square = document.querySelector(
    `[data-square-num=\"${this.squareNum}\"]`
  );
  if (square.firstChild) square.removeChild(square.firstChild);
  return square;
};

Square.prototype.redraw = function () {
  const square = this.clear();
  const checker = this.checker;
  if (checker) square.appendChild(checker.draw());
};
function Jump(rows, start, end, capture) {
  this.rows = rows;
  this.start = start;
  this.end = end;
  this.capture = capture;
}

Jump.prototype.execute = function () {
  this.end.checker = this.start.checker;
  this.start.checker = null;
  this.capture.checker = null;
  this.kingCheck();
  this.save();
  this.start.clear();
  this.capture.clear();
  this.end.redraw();
};

Jump.prototype.save = function () {
  const rows = this.rows;
  rows[this.end.rowNum]["squares"][this.end.squareNum] = {
    checker: { ...this.end.checker },
  };
  rows[this.start.rowNum]["squares"][this.start.squareNum] = {
    checker: this.start.checker,
  };
  rows[this.capture.rowNum]["squares"][this.capture.squareNum] = {
    checker: this.capture.checker,
  };
};

Jump.prototype.kingCheck = function () {
  const color = this.end.checker.color;
  const endRow = +this.end.rowNum;
  if (color === "red") {
    if (endRow === 8) {
      this.end.checker.crown();
    }
  } else {
    if (endRow === 1) {
      this.end.checker.crown();
    }
  }
};
function Move(rows, start, end) {
  this.rows = rows;
  this.start = start;
  this.end = end;
}

Move.prototype.execute = function () {
  this.end.checker = this.start.checker;
  this.start.checker = null;
  this.kingCheck();
  this.save();
  this.start.clear();
  this.end.redraw();
};

Move.prototype.save = function () {
  const rows = this.rows;
  rows[this.end.rowNum]["squares"][this.end.squareNum] = {
    checker: { ...this.end.checker },
  };
  rows[this.start.rowNum]["squares"][this.start.squareNum] = {
    checker: this.start.checker,
  };
};

Move.prototype.kingCheck = function () {
  const color = this.end.checker.color;
  const endRow = +this.end.rowNum;
  if (color === "red") {
    if (endRow === 8) {
      this.end.checker.crown();
    }
  } else {
    if (endRow === 1) {
      this.end.checker.crown();
    }
  }
};
function BasicAI(player) {
  this.player = player;
}

BasicAI.prototype.raiseCover = function () {
  const aiCover = document.getElementById("ai-cover");
  aiCover.classList.add("ai-cover");
};

BasicAI.prototype.lowerCover = function () {
  const aiCover = document.getElementById("ai-cover");
  aiCover.classList.remove("ai-cover");
};

BasicAI.prototype.move = function () {
  const self = this;
  const player = self.player;
  let randomNum, activeSquares, activeCheckerSquares, activeEmptySquares;
  self.raiseCover();
  const intervalId = setInterval(function () {
    if (player.isActive) {
      activeSquares = [...document.getElementsByClassName("highlight")];
      activeCheckerSquares = activeSquares.filter(
        (square) => square.firstChild
      );
      activeEmptySquares = [];
      randomNum = Math.floor(Math.random() * activeCheckerSquares.length);
      activeCheckerSquares[randomNum].click();

      setTimeout(function () {
        activeSquares = [];
        activeCheckerSquares = [];
        activeSquares = [...document.getElementsByClassName("highlight")];
        activeSquares.forEach((el) => {
          if (!el.firstChild) {
            activeEmptySquares.push(el);
          }
        });
        randomNum = Math.floor(Math.random() * activeEmptySquares.length);
        activeEmptySquares[randomNum].click();
        activeSquares = [];
        activeEmptySquares = [];
      }, 500);
    } else {
      clearInterval(intervalId);
      self.lowerCover();
    }
  }, 1000);
};
function EventManager(game) {
  this.game = game;
}

EventManager.prototype.attachInitialListeners = function (player) {
  const self = this;
  const squares = player.activeSquares;
  let el = null;

  self.attachSelectionListeners(player);

  squares.forEach((square) => {
    el = document.querySelector(`[data-square-num=\"${square.squareNum}\"]`);
    el.addEventListener("click", function (e) {
      e.stopImmediatePropagation();
      self.attachSelectionListeners(player);
      document.querySelectorAll(".highlight > .checker").forEach((el) => {
        el.classList.remove("selected");
      });
      if (e.target.classList.contains("square")) {
        e.target.firstChild.classList.add("selected");
      } else {
        e.target.classList.add("selected");
      }
    });

    el.classList.add("highlight");
  });
};

EventManager.prototype.attachSelectionListeners = function (player) {
  const self = this;
  const squares = player.activeSquares;
  let el = null;

  document.querySelectorAll(".highlight").forEach((el) => {
    if (!el.firstChild) self.removeAllListeners(el);
  });

  squares.forEach((square) => {
    el = document.querySelector(`[data-square-num=\"${square.squareNum}\"]`);
    el.classList.add("highlight");

    if (el.firstChild) {
      el.addEventListener("click", function (e) {
        e.stopPropagation();
        player.updateActiveSquares.call(player, square);
      });
    } else {
      el.addEventListener("click", function (e) {
        e.stopPropagation();
        player.updateActiveSquares.call(player, square);
        self.attachMovementListeners(player);
      });
    }
  });
};

EventManager.prototype.attachMovementListeners = function (player) {
  const self = this;
  const game = self.game;
  let move, jump, isKing;
  if (player.moves.length) {
    for (let i = 0; i < player.moves.length; i++) {
      move = player.moves[i];
      if (
        move.start.squareNum === player.startSquare.squareNum &&
        move.end.squareNum === player.endSquare.squareNum
      ) {
        move.execute();
        player.endTurn();
        self.removeAllListeners();
        game.nextTurn();
        break;
      }
    }
  } else if (player.jumps.length) {
    for (let i = 0; i < player.jumps.length; i++) {
      jump = player.jumps[i];
      if (
        jump.start.squareNum === player.startSquare.squareNum &&
        jump.end.squareNum === player.endSquare.squareNum
      ) {
        isKing = jump.start.checker.isKing;
        jump.execute();
        player.deselectSquares();
        player.clearJumps();
        player.clearActiveSquares();

        if (isKing !== jump.end.checker.isKing) {
          player.endTurn();
          self.removeAllListeners();
          game.nextTurn();
          return;
        }

        player.startSquare = jump.end;
        player.findJumps(game.data.rows);
        if (player.jumps.length) {
          player.updateActiveSquares.call(player, player.startSquare);
          self.removeAllListeners();
          return self.attachInitialListeners(player);
        } else {
          player.endTurn();
          self.removeAllListeners();
          game.nextTurn();
          break;
        }
      }
    }
  }
};

EventManager.prototype.attachModalListeners = function () {
  const self = this;
  const game = self.game;
  const resetBtn = document.getElementsByTagName("button")[0];
  const closeBtn = document.getElementsByTagName("button")[1];
  const span = document.getElementsByClassName("close")[0];
  const modal = document.getElementById("myModal");

  resetBtn.addEventListener("click", function () {
    modal.style.display = "none";
    game.restart();
  });

  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  span.addEventListener("click", function () {
    modal.style.display = "none";
  });
};

EventManager.prototype.removeAllListeners = function (elem = null) {
  if (elem) {
    elem.classList.remove("highlight");
    elem.replaceWith(elem.cloneNode(true));
  } else {
    document.querySelectorAll(".highlight").forEach((el) => {
      el.classList.remove("highlight");
      el.replaceWith(el.cloneNode(true));
    });
  }
};


function Game(data) {
  this.data = data;
  this.dataCopy = JSON.parse(JSON.stringify(data));
  this.players = {
    1: new Player(this.data.players[1].color, this.data.players[1].isActive),
    2: new Player(this.data.players[2].color, this.data.players[2].isActive),
  };
  this.board = new Board(this.data.rows);
  this.eMan = new EventManager(this);
  this.eMan.attachModalListeners();
}

Game.prototype.restart = function () {
  this.board.clear();
  this.data = JSON.parse(JSON.stringify(this.dataCopy));
  this.players = {
    1: new Player(this.data.players[1].color, this.data.players[1].isActive),
    2: new Player(this.data.players[2].color, this.data.players[2].isActive),
  };
  this.board = new Board(this.data.rows);
  this.init();
};

Game.prototype.init = function () {
  this.basicAI = new BasicAI(this.players[1]);
  this.players[1].isAI = true;
  this.board.draw();
  this.start();
};

Game.prototype.getActivePlayer = function () {
  const players = this.players;
  let isActive;
  for (const playerNum in players) {
    isActive = players[playerNum].isActive;
    if (isActive) {
      return players[playerNum];
    }
  }
};

Game.prototype.getInactivePlayer = function () {
  const players = this.players;
  let isActive;
  for (const playerNum in players) {
    isActive = players[playerNum].isActive;
    if (!isActive) {
      return players[playerNum];
    }
  }
};

Game.prototype.toggleActivePlayer = function () {
  const players = this.players;
  let isActive;
  for (const playerNum in players) {
    isActive = players[playerNum].isActive;
    if (isActive) {
      players[playerNum].isActive = false;
    } else {
      players[playerNum].isActive = true;
    }
  }
};

Game.prototype.nextTurn = function () {
  const self = this;
  const eMan = self.eMan;
  const modal = document.getElementById("myModal");
  const message = document.getElementById("message");
  let activePlayer;
  self.toggleActivePlayer();
  activePlayer = self.getActivePlayer();
  activePlayer.findJumps(self.data.rows);
  if (!activePlayer.jumps.length) {
    activePlayer.findMoves(self.data.rows);

    if (!activePlayer.moves.length) {
      message.textContent = `Player ${
        self.getInactivePlayer().color
      } is the winner! Thanks for playing.
      Try again?`;

      modal.style.display = "block";
    } else {
      activePlayer.updateActiveSquares();
      eMan.attachInitialListeners(activePlayer);
      if (activePlayer.isAI) {
        this.basicAI.move();
      }
    }
  } else {
    activePlayer.updateActiveSquares();
    eMan.attachInitialListeners(activePlayer);
    if (activePlayer.isAI) {
      this.basicAI.move();
    }
  }
};

Game.prototype.start = function () {
  const self = this;
  const eMan = self.eMan;
  let activePlayer;
  activePlayer = self.getActivePlayer();
  activePlayer.findMoves(self.data.rows);
  activePlayer.updateActiveSquares();
  eMan.attachInitialListeners(activePlayer);
  if (activePlayer.isAI) {
    this.basicAI.move();
  }
};
function Player(
  color,
  isActive = false,
  isAI = false,
  pieceCount = 12,
  turnCount = 0
) {
  this.color = color;
  this.isActive = isActive;
  this.isAI = isAI;
  this.pieceCount = pieceCount;
  this.turnCount = turnCount;
  this.jumps = [];
  this.moves = [];
  this.activeSquares = [];
  this.startSquare = null;
  this.endSquare = null;
}

Player.prototype.findJumps = function (rows) {
  const startSquare = this.startSquare;
  let rowNum,
    squares,
    square,
    squareNum,
    rowPlusOne,
    rowMinusOne,
    rowPlusTwo,
    rowMinusTwo,
    rowIsOdd,
    isKing,
    leftDiagNear,
    leftDiagFar,
    rightDiagNear,
    rightDiagFar,
    testSquareNum;
  this.clearJumps();
  if (startSquare) {
    rowPlusOne = startSquare.rowNum + 1;
    rowMinusOne = startSquare.rowNum - 1;
    rowPlusTwo = rowPlusOne + 1;
    rowMinusTwo = rowMinusOne - 1;
    rowIsOdd = startSquare.rowNum % 2 !== 0;
    isKing = startSquare.checker.isKing;

    if (this.color === "red" || isKing) {
      if (rowPlusTwo < 9) {
        if (rowIsOdd) {
          testSquareNum = startSquare.squareNum + 9;

          if (rows[rowPlusTwo]["squares"][testSquareNum]) {
            leftDiagFar = rows[rowPlusTwo]["squares"][testSquareNum];
            leftDiagNear = rows[rowPlusOne]["squares"][testSquareNum - 4];
            if (leftDiagFar.checker === null) {
              if (
                leftDiagNear.checker &&
                leftDiagNear.checker.color !== this.color
              ) {
                this.jumps.push(
                  new Jump(
                    rows,
                    new Square(
                      startSquare.rowNum,
                      startSquare.squareNum,
                      new Checker(this.color, isKing)
                    ),
                    new Square(rowPlusTwo, testSquareNum),
                    new Square(
                      rowPlusOne,
                      testSquareNum - 4,
                      new Checker(this.color === "red" ? "black" : "red")
                    )
                  )
                );
              }
            }
          }

          testSquareNum = startSquare.squareNum + 7;

          if (rows[rowPlusTwo]["squares"][testSquareNum]) {
            rightDiagFar = rows[rowPlusTwo]["squares"][testSquareNum];
            rightDiagNear = rows[rowPlusOne]["squares"][testSquareNum - 3];
            if (rightDiagFar.checker === null) {
              if (
                rightDiagNear.checker &&
                rightDiagNear.checker.color !== this.color
              ) {
                this.jumps.push(
                  new Jump(
                    rows,
                    new Square(
                      startSquare.rowNum,
                      startSquare.squareNum,
                      new Checker(this.color, isKing)
                    ),
                    new Square(rowPlusTwo, testSquareNum),
                    new Square(
                      rowPlusOne,
                      testSquareNum - 3,
                      new Checker(this.color === "red" ? "black" : "red")
                    )
                  )
                );
              }
            }
          }
        } else {
          // row is even
          testSquareNum = startSquare.squareNum + 9;

          if (rows[rowPlusTwo]["squares"][testSquareNum]) {
            leftDiagFar = rows[rowPlusTwo]["squares"][testSquareNum];
            leftDiagNear = rows[rowPlusOne]["squares"][testSquareNum - 5];
            if (leftDiagFar.checker === null) {
              if (
                leftDiagNear.checker &&
                leftDiagNear.checker.color !== this.color
              ) {
                this.jumps.push(
                  new Jump(
                    rows,
                    new Square(
                      startSquare.rowNum,
                      startSquare.squareNum,
                      new Checker(this.color, isKing)
                    ),
                    new Square(rowPlusTwo, testSquareNum),
                    new Square(
                      rowPlusOne,
                      testSquareNum - 5,
                      new Checker(this.color === "red" ? "black" : "red")
                    )
                  )
                );
              }
            }
          }

          testSquareNum = startSquare.squareNum + 7;

          if (rows[rowPlusTwo]["squares"][testSquareNum]) {
            rightDiagFar = rows[rowPlusTwo]["squares"][testSquareNum];
            rightDiagNear = rows[rowPlusOne]["squares"][testSquareNum - 4];
            if (rightDiagFar.checker === null) {
              if (
                rightDiagNear.checker &&
                rightDiagNear.checker.color !== this.color
              ) {
                this.jumps.push(
                  new Jump(
                    rows,
                    new Square(
                      startSquare.rowNum,
                      startSquare.squareNum,
                      new Checker(this.color, isKing)
                    ),
                    new Square(rowPlusTwo, testSquareNum),
                    new Square(
                      rowPlusOne,
                      testSquareNum - 4,
                      new Checker(this.color === "red" ? "black" : "red")
                    )
                  )
                );
              }
            }
          }
        }
      }
    }

    if (this.color === "black" || isKing) {
      if (rowMinusTwo > 0) {
        if (rowIsOdd) {
          testSquareNum = startSquare.squareNum - 7;

          if (rows[rowMinusTwo]["squares"][testSquareNum]) {
            leftDiagFar = rows[rowMinusTwo]["squares"][testSquareNum];
            leftDiagNear = rows[rowMinusOne]["squares"][testSquareNum + 4];
            if (leftDiagFar.checker === null) {
              if (
                leftDiagNear.checker &&
                leftDiagNear.checker.color !== this.color
              ) {
                this.jumps.push(
                  new Jump(
                    rows,
                    new Square(
                      startSquare.rowNum,
                      startSquare.squareNum,
                      new Checker(this.color, isKing)
                    ),
                    new Square(rowMinusTwo, testSquareNum),
                    new Square(
                      rowMinusOne,
                      testSquareNum + 4,
                      new Checker(this.color === "red" ? "black" : "red")
                    )
                  )
                );
              }
            }
          }

          testSquareNum = startSquare.squareNum - 9;

          if (rows[rowMinusTwo]["squares"][testSquareNum]) {
            rightDiagFar = rows[rowMinusTwo]["squares"][testSquareNum];
            rightDiagNear = rows[rowMinusOne]["squares"][testSquareNum + 5];
            if (rightDiagFar.checker === null) {
              if (
                rightDiagNear.checker &&
                rightDiagNear.checker.color !== this.color
              ) {
                this.jumps.push(
                  new Jump(
                    rows,
                    new Square(
                      startSquare.rowNum,
                      startSquare.squareNum,
                      new Checker(this.color, isKing)
                    ),
                    new Square(rowMinusTwo, testSquareNum),
                    new Square(
                      rowMinusOne,
                      testSquareNum + 5,
                      new Checker(this.color === "red" ? "black" : "red")
                    )
                  )
                );
              }
            }
          }
        } else {
          // row is even
          testSquareNum = startSquare.squareNum - 7;

          if (rows[rowMinusTwo]["squares"][testSquareNum]) {
            leftDiagFar = rows[rowMinusTwo]["squares"][testSquareNum];
            leftDiagNear = rows[rowMinusOne]["squares"][testSquareNum + 3];
            if (leftDiagFar.checker === null) {
              if (
                leftDiagNear.checker &&
                leftDiagNear.checker.color !== this.color
              ) {
                this.jumps.push(
                  new Jump(
                    rows,
                    new Square(
                      startSquare.rowNum,
                      startSquare.squareNum,
                      new Checker(this.color, isKing)
                    ),
                    new Square(rowMinusTwo, testSquareNum),
                    new Square(
                      rowMinusOne,
                      testSquareNum + 3,
                      new Checker(this.color === "red" ? "black" : "red")
                    )
                  )
                );
              }
            }
          }

          testSquareNum = startSquare.squareNum - 9;

          if (rows[rowMinusTwo]["squares"][testSquareNum]) {
            rightDiagFar = rows[rowMinusTwo]["squares"][testSquareNum];
            rightDiagNear = rows[rowMinusOne]["squares"][testSquareNum + 4];
            if (rightDiagFar.checker === null) {
              if (
                rightDiagNear.checker &&
                rightDiagNear.checker.color !== this.color
              ) {
                this.jumps.push(
                  new Jump(
                    rows,
                    new Square(
                      startSquare.rowNum,
                      startSquare.squareNum,
                      new Checker(this.color, isKing)
                    ),
                    new Square(rowMinusTwo, testSquareNum),
                    new Square(
                      rowMinusOne,
                      testSquareNum + 4,
                      new Checker(this.color === "red" ? "black" : "red")
                    )
                  )
                );
              }
            }
          }
        }
      }
    }
  } else {
    // no start square, find all jumps
    for (rowNum in rows) {
      squares = rows[rowNum]["squares"];
      for (squareNum in squares) {
        square = squares[squareNum];
        if (square.checker) {
          if (square.checker.color === this.color) {
            rowPlusTwo = +rowNum + 2;
            rowPlusOne = +rowNum + 1;
            rowMinusTwo = +rowNum - 2;
            rowMinusOne = +rowNum - 1;
            rowIsOdd = +rowNum % 2 !== 0;
            isKing = square.checker.isKing;

            if (this.color === "red" || isKing) {
              if (rowPlusTwo < 9) {
                if (rowIsOdd) {
                  testSquareNum = +squareNum + 9;

                  if (rows[rowPlusTwo]["squares"][testSquareNum]) {
                    leftDiagFar = rows[rowPlusTwo]["squares"][testSquareNum];
                    leftDiagNear =
                      rows[rowPlusOne]["squares"][testSquareNum - 4];
                    if (leftDiagFar.checker === null) {
                      if (
                        leftDiagNear.checker &&
                        leftDiagNear.checker.color !== this.color
                      ) {
                        this.jumps.push(
                          new Jump(
                            rows,
                            new Square(
                              +rowNum,
                              +squareNum,
                              new Checker(this.color, isKing)
                            ),
                            new Square(rowPlusTwo, testSquareNum),
                            new Square(
                              rowPlusOne,
                              testSquareNum - 4,
                              new Checker(
                                this.color === "red" ? "black" : "red"
                              )
                            )
                          )
                        );
                      }
                    }
                  }

                  testSquareNum = +squareNum + 7;

                  if (rows[rowPlusTwo]["squares"][testSquareNum]) {
                    rightDiagFar = rows[rowPlusTwo]["squares"][testSquareNum];
                    rightDiagNear =
                      rows[rowPlusOne]["squares"][testSquareNum - 3];
                    if (rightDiagFar.checker === null) {
                      if (
                        rightDiagNear.checker &&
                        rightDiagNear.checker.color !== this.color
                      ) {
                        this.jumps.push(
                          new Jump(
                            rows,
                            new Square(
                              +rowNum,
                              +squareNum,
                              new Checker(this.color, isKing)
                            ),
                            new Square(rowPlusTwo, testSquareNum),
                            new Square(
                              rowPlusOne,
                              testSquareNum - 3,
                              new Checker(
                                this.color === "red" ? "black" : "red"
                              )
                            )
                          )
                        );
                      }
                    }
                  }
                } else {
                  // row is even
                  testSquareNum = +squareNum + 9;

                  if (rows[rowPlusTwo]["squares"][testSquareNum]) {
                    leftDiagFar = rows[rowPlusTwo]["squares"][testSquareNum];
                    leftDiagNear =
                      rows[rowPlusOne]["squares"][testSquareNum - 5];
                    if (leftDiagFar.checker === null) {
                      if (
                        leftDiagNear.checker &&
                        leftDiagNear.checker.color !== this.color
                      ) {
                        this.jumps.push(
                          new Jump(
                            rows,
                            new Square(
                              +rowNum,
                              +squareNum,
                              new Checker(this.color, isKing)
                            ),
                            new Square(rowPlusTwo, testSquareNum),
                            new Square(
                              rowPlusOne,
                              testSquareNum - 5,
                              new Checker(
                                this.color === "red" ? "black" : "red"
                              )
                            )
                          )
                        );
                      }
                    }
                  }

                  testSquareNum = +squareNum + 7;

                  if (rows[rowPlusTwo]["squares"][testSquareNum]) {
                    rightDiagFar = rows[rowPlusTwo]["squares"][testSquareNum];
                    rightDiagNear =
                      rows[rowPlusOne]["squares"][testSquareNum - 4];
                    if (rightDiagFar.checker === null) {
                      if (
                        rightDiagNear.checker &&
                        rightDiagNear.checker.color !== this.color
                      ) {
                        this.jumps.push(
                          new Jump(
                            rows,
                            new Square(
                              +rowNum,
                              +squareNum,
                              new Checker(this.color, isKing)
                            ),
                            new Square(rowPlusTwo, testSquareNum),
                            new Square(
                              rowPlusOne,
                              testSquareNum - 4,
                              new Checker(
                                this.color === "red" ? "black" : "red"
                              )
                            )
                          )
                        );
                      }
                    }
                  }
                }
              }
            }

            if (this.color === "black" || isKing) {
              if (rowMinusTwo > 0) {
                if (rowIsOdd) {
                  testSquareNum = +squareNum - 7;

                  if (rows[rowMinusTwo]["squares"][testSquareNum]) {
                    leftDiagFar = rows[rowMinusTwo]["squares"][testSquareNum];
                    leftDiagNear =
                      rows[rowMinusOne]["squares"][testSquareNum + 4];
                    if (leftDiagFar.checker === null) {
                      if (
                        leftDiagNear.checker &&
                        leftDiagNear.checker.color !== this.color
                      ) {
                        this.jumps.push(
                          new Jump(
                            rows,
                            new Square(
                              +rowNum,
                              +squareNum,
                              new Checker(this.color, isKing)
                            ),
                            new Square(rowMinusTwo, testSquareNum),
                            new Square(
                              rowMinusOne,
                              testSquareNum + 4,
                              new Checker(
                                this.color === "red" ? "black" : "red"
                              )
                            )
                          )
                        );
                      }
                    }
                  }

                  testSquareNum = +squareNum - 9;

                  if (rows[rowMinusTwo]["squares"][testSquareNum]) {
                    rightDiagFar = rows[rowMinusTwo]["squares"][testSquareNum];
                    rightDiagNear =
                      rows[rowMinusOne]["squares"][testSquareNum + 5];
                    if (rightDiagFar.checker === null) {
                      if (
                        rightDiagNear.checker &&
                        rightDiagNear.checker.color !== this.color
                      ) {
                        this.jumps.push(
                          new Jump(
                            rows,
                            new Square(
                              +rowNum,
                              +squareNum,
                              new Checker(this.color, isKing)
                            ),
                            new Square(rowMinusTwo, testSquareNum),
                            new Square(
                              rowMinusOne,
                              testSquareNum + 5,
                              new Checker(
                                this.color === "red" ? "black" : "red"
                              )
                            )
                          )
                        );
                      }
                    }
                  }
                } else {
                  // row is even
                  testSquareNum = +squareNum - 7;

                  if (rows[rowMinusTwo]["squares"][testSquareNum]) {
                    leftDiagFar = rows[rowMinusTwo]["squares"][testSquareNum];
                    leftDiagNear =
                      rows[rowMinusOne]["squares"][testSquareNum + 3];
                    if (leftDiagFar.checker === null) {
                      if (
                        leftDiagNear.checker &&
                        leftDiagNear.checker.color !== this.color
                      ) {
                        this.jumps.push(
                          new Jump(
                            rows,
                            new Square(
                              +rowNum,
                              +squareNum,
                              new Checker(this.color, isKing)
                            ),
                            new Square(rowMinusTwo, testSquareNum),
                            new Square(
                              rowMinusOne,
                              testSquareNum + 3,
                              new Checker(
                                this.color === "red" ? "black" : "red"
                              )
                            )
                          )
                        );
                      }
                    }
                  }

                  testSquareNum = +squareNum - 9;

                  if (rows[rowMinusTwo]["squares"][testSquareNum]) {
                    rightDiagFar = rows[rowMinusTwo]["squares"][testSquareNum];
                    rightDiagNear =
                      rows[rowMinusOne]["squares"][testSquareNum + 4];
                    if (rightDiagFar.checker === null) {
                      if (
                        rightDiagNear.checker &&
                        rightDiagNear.checker.color !== this.color
                      ) {
                        this.jumps.push(
                          new Jump(
                            rows,
                            new Square(
                              +rowNum,
                              +squareNum,
                              new Checker(this.color, isKing)
                            ),
                            new Square(rowMinusTwo, testSquareNum),
                            new Square(
                              rowMinusOne,
                              testSquareNum + 4,
                              new Checker(
                                this.color === "red" ? "black" : "red"
                              )
                            )
                          )
                        );
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

Player.prototype.findMoves = function (rows) {
  const startSquare = this.startSquare;
  let rowNum,
    squares,
    square,
    squareNum,
    rowPlusOne,
    rowMinusOne,
    rowIsOdd,
    isKing,
    leftDiagNear,
    rightDiagNear,
    testSquareNum;
  this.clearMoves();
  if (startSquare) {
    rowPlusOne = startSquare.rowNum + 1;
    rowMinusOne = startSquare.rowNum - 1;
    rowIsOdd = startSquare.rowNum % 2 !== 0;
    isKing = startSquare.checker.isKing;

    if (this.color === "red" || isKing) {
      if (rowPlusOne < 9) {
        if (rowIsOdd) {
          testSquareNum = startSquare.squareNum + 5;

          if (rows[rowPlusOne]["squares"][testSquareNum]) {
            leftDiagNear = rows[rowPlusOne]["squares"][testSquareNum];
            if (leftDiagNear.checker === null) {
              this.moves.push(
                new Move(
                  rows,
                  new Square(
                    startSquare.rowNum,
                    startSquare.squareNum,
                    new Checker(this.color, isKing)
                  ),
                  new Square(rowPlusOne, testSquareNum)
                )
              );
            }
          }

          testSquareNum = startSquare.squareNum + 4;

          if (rows[rowPlusOne]["squares"][testSquareNum]) {
            rightDiagNear = rows[rowPlusOne]["squares"][testSquareNum];
            if (rightDiagNear.checker === null) {
              this.moves.push(
                new Move(
                  rows,
                  new Square(
                    startSquare.rowNum,
                    startSquare.squareNum,
                    new Checker(this.color, isKing)
                  ),
                  new Square(rowPlusOne, testSquareNum)
                )
              );
            }
          }
        } else {
          // row is even
          testSquareNum = startSquare.squareNum + 4;

          if (rows[rowPlusOne]["squares"][testSquareNum]) {
            leftDiagNear = rows[rowPlusOne]["squares"][testSquareNum];
            if (leftDiagNear.checker === null) {
              this.moves.push(
                new Move(
                  rows,
                  new Square(
                    startSquare.rowNum,
                    startSquare.squareNum,
                    new Checker(this.color, isKing)
                  ),
                  new Square(rowPlusOne, testSquareNum)
                )
              );
            }
          }

          testSquareNum = startSquare.squareNum + 3;

          if (rows[rowPlusOne]["squares"][testSquareNum]) {
            rightDiagNear = rows[rowPlusOne]["squares"][testSquareNum];
            if (rightDiagNear.checker === null) {
              this.moves.push(
                new Move(
                  rows,
                  new Square(
                    startSquare.rowNum,
                    startSquare.squareNum,
                    new Checker(this.color, isKing)
                  ),
                  new Square(rowPlusOne, testSquareNum)
                )
              );
            }
          }
        }
      }
    }

    if (this.color === "black" || isKing) {
      if (rowMinusOne > 0) {
        if (rowIsOdd) {
          // row is odd
          testSquareNum = startSquare.squareNum - 3;

          if (rows[rowMinusOne]["squares"][testSquareNum]) {
            leftDiagNear = rows[rowMinusOne]["squares"][testSquareNum];
            if (leftDiagNear.checker === null) {
              this.moves.push(
                new Move(
                  rows,
                  new Square(
                    +rowNum,
                    +squareNum,
                    new Checker(this.color, isKing)
                  ),
                  new Square(rowMinusOne, testSquareNum)
                )
              );
            }
          }

          testSquareNum = startSquare.squareNum - 4;

          if (rows[rowMinusOne]["squares"][testSquareNum]) {
            rightDiagNear = rows[rowMinusOne]["squares"][testSquareNum];
            if (rightDiagNear.checker === null) {
              this.moves.push(
                new Move(
                  rows,
                  new Square(
                    startSquare.rowNum,
                    startSquare.squareNum,
                    new Checker(this.color, isKing)
                  ),
                  new Square(rowMinusOne, testSquareNum)
                )
              );
            }
          }
        } else {
          // row is even
          testSquareNum = startSquare.squareNum - 4;

          if (rows[rowMinusOne]["squares"][testSquareNum]) {
            leftDiagNear = rows[rowMinusOne]["squares"][testSquareNum];
            if (leftDiagNear.checker === null) {
              this.moves.push(
                new Move(
                  rows,
                  new Square(
                    +rowNum,
                    +squareNum,
                    new Checker(this.color, isKing)
                  ),
                  new Square(rowMinusOne, testSquareNum)
                )
              );
            }
          }

          testSquareNum = startSquare.squareNum - 5;

          if (rows[rowMinusOne]["squares"][testSquareNum]) {
            rightDiagNear = rows[rowMinusOne]["squares"][testSquareNum];
            if (rightDiagNear.checker === null) {
              this.moves.push(
                new Move(
                  rows,
                  new Square(
                    startSquare.rowNum,
                    startSquare.squareNum,
                    new Checker(this.color, isKing)
                  ),
                  new Square(rowMinusOne, testSquareNum)
                )
              );
            }
          }
        }
      }
    }
  } else {
    // no start square, find all moves
    for (rowNum in rows) {
      squares = rows[rowNum]["squares"];
      for (squareNum in squares) {
        square = squares[squareNum];
        if (square.checker) {
          if (square.checker.color === this.color) {
            rowPlusOne = +rowNum + 1;
            rowMinusOne = +rowNum - 1;
            rowIsOdd = +rowNum % 2 !== 0;
            isKing = square.checker.isKing;

            if (this.color === "red" || isKing) {
              if (rowPlusOne < 9) {
                if (rowIsOdd) {
                  testSquareNum = +squareNum + 5;

                  if (rows[rowPlusOne]["squares"][testSquareNum]) {
                    leftDiagNear = rows[rowPlusOne]["squares"][testSquareNum];
                    if (leftDiagNear.checker === null) {
                      this.moves.push(
                        new Move(
                          rows,
                          new Square(
                            +rowNum,
                            +squareNum,
                            new Checker(this.color, isKing)
                          ),
                          new Square(rowPlusOne, testSquareNum)
                        )
                      );
                    }
                  }

                  testSquareNum = +squareNum + 4;

                  if (rows[rowPlusOne]["squares"][testSquareNum]) {
                    rightDiagNear = rows[rowPlusOne]["squares"][testSquareNum];
                    if (rightDiagNear.checker === null) {
                      this.moves.push(
                        new Move(
                          rows,
                          new Square(
                            +rowNum,
                            +squareNum,
                            new Checker(this.color, isKing)
                          ),
                          new Square(rowPlusOne, testSquareNum)
                        )
                      );
                    }
                  }
                } else {
                  // row is even
                  testSquareNum = +squareNum + 4;

                  if (rows[rowPlusOne]["squares"][testSquareNum]) {
                    leftDiagNear = rows[rowPlusOne]["squares"][testSquareNum];
                    if (leftDiagNear.checker === null) {
                      this.moves.push(
                        new Move(
                          rows,
                          new Square(
                            +rowNum,
                            +squareNum,
                            new Checker(this.color, isKing)
                          ),
                          new Square(rowPlusOne, testSquareNum)
                        )
                      );
                    }
                  }

                  testSquareNum = +squareNum + 3;

                  if (rows[rowPlusOne]["squares"][testSquareNum]) {
                    rightDiagNear = rows[rowPlusOne]["squares"][testSquareNum];
                    if (rightDiagNear.checker === null) {
                      this.moves.push(
                        new Move(
                          rows,
                          new Square(
                            +rowNum,
                            +squareNum,
                            new Checker(this.color, isKing)
                          ),
                          new Square(rowPlusOne, testSquareNum)
                        )
                      );
                    }
                  }
                }
              }
            }

            if (this.color === "black" || isKing) {
              if (rowMinusOne > 0) {
                if (rowIsOdd) {
                  testSquareNum = +squareNum - 3;

                  if (rows[rowMinusOne]["squares"][testSquareNum]) {
                    leftDiagNear = rows[rowMinusOne]["squares"][testSquareNum];
                    if (leftDiagNear.checker === null) {
                      this.moves.push(
                        new Move(
                          rows,
                          new Square(
                            +rowNum,
                            +squareNum,
                            new Checker(this.color, isKing)
                          ),
                          new Square(rowMinusOne, testSquareNum)
                        )
                      );
                    }
                  }

                  testSquareNum = +squareNum - 4;

                  if (rows[rowMinusOne]["squares"][testSquareNum]) {
                    rightDiagNear = rows[rowMinusOne]["squares"][testSquareNum];
                    if (rightDiagNear.checker === null) {
                      this.moves.push(
                        new Move(
                          rows,
                          new Square(
                            +rowNum,
                            +squareNum,
                            new Checker(this.color, isKing)
                          ),
                          new Square(rowMinusOne, testSquareNum)
                        )
                      );
                    }
                  }
                } else {
                  // row is even
                  testSquareNum = +squareNum - 4;

                  if (rows[rowMinusOne]["squares"][testSquareNum]) {
                    leftDiagNear = rows[rowMinusOne]["squares"][testSquareNum];
                    if (leftDiagNear.checker === null) {
                      this.moves.push(
                        new Move(
                          rows,
                          new Square(
                            +rowNum,
                            +squareNum,
                            new Checker(this.color, isKing)
                          ),
                          new Square(rowMinusOne, testSquareNum)
                        )
                      );
                    }
                  }

                  testSquareNum = +squareNum - 5;

                  if (rows[rowMinusOne]["squares"][testSquareNum]) {
                    rightDiagNear = rows[rowMinusOne]["squares"][testSquareNum];
                    if (rightDiagNear.checker === null) {
                      this.moves.push(
                        new Move(
                          rows,
                          new Square(
                            +rowNum,
                            +squareNum,
                            new Checker(this.color, isKing)
                          ),
                          new Square(rowMinusOne, testSquareNum)
                        )
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

Player.prototype.clearJumps = function () {
  this.jumps = [];
};

Player.prototype.clearMoves = function () {
  this.moves = [];
};

Player.prototype.clearActiveSquares = function () {
  this.activeSquares = [];
};

Player.prototype.decrementPieceCount = function () {
  this.pieceCount--;
};

Player.prototype.incrementTurnCount = function () {
  this.turnCount++;
};

Player.prototype.deselectSquares = function (modifier = "start") {
  if (modifier !== "start") {
    this.endSquare = null;
  } else {
    this.startSquare = null;
    this.endSquare = null;
  }
};

Player.prototype.selectSquare = function (square) {
  if (square.checker) {
    this.deselectSquares();
    this.startSquare = square;
  } else {
    this.deselectSquares("end");
    this.endSquare = square;
  }
};

Player.prototype.updateActiveSquares = function (square = null) {
  const jumps = this.jumps;
  const moves = this.moves;
  let uniqueSquareNums = new Set();
  let startSquareNum, endSquareNum;
  this.clearActiveSquares();
  if (square) this.selectSquare(square);
  if (jumps.length) {
    jumps.forEach((jump) => {
      startSquareNum = jump.start.squareNum;
      endSquareNum = jump.end.squareNum;

      if (!uniqueSquareNums.has(startSquareNum)) {
        uniqueSquareNums.add(startSquareNum);
        this.activeSquares.push(jump.start);
      }

      if (this.startSquare) {
        if (startSquareNum === this.startSquare.squareNum) {
          if (!uniqueSquareNums.has(endSquareNum)) {
            uniqueSquareNums.add(endSquareNum);
            this.activeSquares.push(jump.end);
          }
        }
      }
    });
  } else if (moves.length) {
    moves.forEach((move) => {
      startSquareNum = move.start.squareNum;
      endSquareNum = move.end.squareNum;

      if (!uniqueSquareNums.has(startSquareNum)) {
        uniqueSquareNums.add(startSquareNum);
        this.activeSquares.push(move.start);
      }

      if (this.startSquare) {
        if (startSquareNum === this.startSquare.squareNum) {
          if (!uniqueSquareNums.has(endSquareNum)) {
            uniqueSquareNums.add(endSquareNum);
            this.activeSquares.push(move.end);
          }
        }
      }
    });
  }
};

Player.prototype.endTurn = function () {
  this.deselectSquares();
  this.clearActiveSquares();
  this.clearMoves();
  this.clearJumps();
  this.incrementTurnCount();
};
const initialData = {
  players: {
    1: {
      color: "black",
      isActive: true,
      isAI: false,
      pieceCount: 12,
      turnCount: 0,
    },
    2: {
      color: "red",
      isActive: false,
      isAI: false,
      pieceCount: 12,
      turnCount: 0,
    },
  },

  rows: {
    1: {
      squares: {
        1: {
          checker: {
            color: "red",
            isKing: false,
          },
        },
        2: {
          checker: {
            color: "red",
            isKing: false,
          },
        },
        3: {
          checker: {
            color: "red",
            isKing: false,
          },
        },
        4: {
          checker: {
            color: "red",
            isKing: false,
          },
        },
      },
    },
    2: {
      squares: {
        5: {
          checker: {
            color: "red",
            isKing: false,
          },
        },
        6: {
          checker: {
            color: "red",
            isKing: false,
          },
        },
        7: {
          checker: {
            color: "red",
            isKing: false,
          },
        },
        8: {
          checker: {
            color: "red",
            isKing: false,
          },
        },
      },
    },
    3: {
      squares: {
        9: {
          checker: {
            color: "red",
            isKing: false,
          },
        },
        10: {
          checker: {
            color: "red",
            isKing: false,
          },
        },
        11: {
          checker: {
            color: "red",
            isKing: false,
          },
        },
        12: {
          checker: {
            color: "red",
            isKing: false,
          },
        },
      },
    },
    4: {
      squares: {
        13: { checker: null },
        14: { checker: null },
        15: { checker: null },
        16: { checker: null },
      },
    },
    5: {
      squares: {
        17: { checker: null },
        18: { checker: null },
        19: { checker: null },
        20: { checker: null },
      },
    },
    6: {
      squares: {
        21: {
          checker: {
            color: "black",
            isKing: false,
          },
        },
        22: {
          checker: {
            color: "black",
            isKing: false,
          },
        },
        23: {
          checker: {
            color: "black",
            isKing: false,
          },
        },
        24: {
          checker: {
            color: "black",
            isKing: false,
          },
        },
      },
    },
    7: {
      squares: {
        25: {
          checker: {
            color: "black",
            isKing: false,
          },
        },
        26: {
          checker: {
            color: "black",
            isKing: false,
          },
        },
        27: {
          checker: {
            color: "black",
            isKing: false,
          },
        },
        28: {
          checker: {
            color: "black",
            isKing: false,
          },
        },
      },
    },
    8: {
      squares: {
        29: {
          checker: {
            color: "black",
            isKing: false,
          },
        },
        30: {
          checker: {
            color: "black",
            isKing: false,
          },
        },
        31: {
          checker: {
            color: "black",
            isKing: false,
          },
        },
        32: {
          checker: {
            color: "black",
            isKing: false,
          },
        },
      },
    },
  },
};
      const game = new Game(initialData);
      game.init();