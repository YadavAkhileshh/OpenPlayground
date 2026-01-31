
    let board = null;
    let game = new Chess();
    let modeSelect = document.getElementById('mode');
    let difficultySelect = document.getElementById('difficulty');
    let statusEl = document.getElementById('status');

    // Stockfish Web Worker
    let stockfish = new Worker('https://cdn.jsdelivr.net/npm/stockfish/stockfish.js');

    stockfish.postMessage('uci');

    stockfish.onmessage = (e) => {
      if (e.data.startsWith('bestmove')) {
        const move = e.data.split(' ')[1];
        game.move({ from: move.substring(0,2), to: move.substring(2,4), promotion: 'q' });
        board.position(game.fen());
        updateStatus();
      }
    };

    function onDragStart(source, piece) {
      if (game.game_over()) return false;
      if (piece.startsWith('b') && modeSelect.value === 'ai') return false;
    }

    function onDrop(source, target) {
      const move = game.move({ from: source, to: target, promotion: 'q' });
      if (move === null) return 'snapback';

      updateStatus();

      if (modeSelect.value === 'ai' && !game.game_over()) {
        setTimeout(makeAIMove, 300);
      }
    }

    function makeAIMove() {
      const depth = difficultySelect.value;
      stockfish.postMessage('position fen ' + game.fen());
      stockfish.postMessage('go depth ' + depth);
    }

    function updateStatus() {
      let status = '';
      const moveColor = game.turn() === 'b' ? 'Black' : 'White';

      if (game.in_checkmate()) {
        status = 'Checkmate! ' + moveColor + ' loses.';
      } else if (game.in_draw()) {
        status = 'Draw!';
      } else {
        status = moveColor + ' to move';
        if (game.in_check()) status += ' (Check)';
      }

      statusEl.textContent = status;
    }

    function resetGame() {
      game.reset();
      board.start();
      updateStatus();
    }

    const config = {
      draggable: true,
      position: 'start',
      onDragStart,
      onDrop,
      onSnapEnd: () => board.position(game.fen())
    };

    board = Chessboard('board', config);
    updateStatus();
  