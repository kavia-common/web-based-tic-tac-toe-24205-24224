(function () {
  'use strict';

  const cells = Array.from(document.querySelectorAll('.cell'));
  const statusEl = document.getElementById('status');
  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');
  const scoreTiesEl = document.getElementById('scoreTies');

  const btnUndo = document.getElementById('btnUndo');
  const btnNewGame = document.getElementById('btnNewGame');
  const btnReset = document.getElementById('btnReset');

  // Simple state
  let board = Array(9).fill(null);
  let turn = 'X';
  let history = [];
  let scores = { X: 0, O: 0, T: 0 };
  const wins = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // cols
    [0,4,8], [2,4,6]           // diag
  ];

  function render() {
    board.forEach((val, idx) => {
      const el = cells[idx];
      el.textContent = val ? val : '';
      el.classList.toggle('is-o', val === 'O');
      el.classList.remove('won');
      el.disabled = !!val || isOver();
    });

    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
    scoreTiesEl.textContent = scores.T;

    if (!isOver()) {
      statusEl.textContent = `${turn}'s turn`;
    } else {
      const winner = getWinner();
      statusEl.textContent = winner ? `${winner} wins!` : `It's a tie`;
    }
  }

  function isOver() {
    return !!getWinner() || board.every(Boolean);
  }

  function getWinner() {
    for (const [a,b,c] of wins) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  function markWinningLine() {
    const winner = getWinner();
    if (!winner) return;
    for (const triplet of wins) {
      const [a,b,c] = triplet;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        cells[a].classList.add('won');
        cells[b].classList.add('won');
        cells[c].classList.add('won');
        break;
      }
    }
  }

  function handleCellClick(e) {
    const idx = Number(e.currentTarget.getAttribute('data-index'));
    if (board[idx] || isOver()) return;
    history.push([...board]);
    board[idx] = turn;
    const winner = getWinner();
    if (winner) {
      scores[winner] += 1;
      markWinningLine();
    } else if (board.every(Boolean)) {
      scores.T += 1;
    } else {
      turn = turn === 'X' ? 'O' : 'X';
    }
    render();
  }

  function undo() {
    if (history.length === 0 || isOver()) return;
    board = history.pop();
    turn = turn === 'X' ? 'O' : 'X';
    render();
  }

  function newGame() {
    board = Array(9).fill(null);
    history = [];
    turn = 'X';
    cells.forEach(c => c.classList.remove('won', 'is-o'));
    render();
  }

  function resetScores() {
    scores = { X: 0, O: 0, T: 0 };
    newGame();
  }

  // Attach events
  cells.forEach(c => c.addEventListener('click', handleCellClick));
  btnUndo.addEventListener('click', undo);
  btnNewGame.addEventListener('click', newGame);
  btnReset.addEventListener('click', resetScores);

  // Keyboard support
  cells.forEach((c, i) => {
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        c.click();
      }
      // simple arrow navigation
      const row = Math.floor(i / 3);
      const col = i % 3;
      let target = null;
      if (e.key === 'ArrowRight' && col < 2) target = i + 1;
      if (e.key === 'ArrowLeft' && col > 0) target = i - 1;
      if (e.key === 'ArrowDown' && row < 2) target = i + 3;
      if (e.key === 'ArrowUp' && row > 0) target = i - 3;
      if (target !== null) {
        e.preventDefault();
        cells[target].focus();
      }
    });
  });

  render();
})();
