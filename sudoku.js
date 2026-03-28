// ============================================================
// Sudoku Generator & Solver
// ============================================================

function generateSolved() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  solve(board);
  return board;
}

function solve(board) {
  const empty = findEmpty(board);
  if (!empty) return true;
  const [r, c] = empty;
  const nums = shuffle([1,2,3,4,5,6,7,8,9]);
  for (const n of nums) {
    if (isValid(board, r, c, n)) {
      board[r][c] = n;
      if (solve(board)) return true;
      board[r][c] = 0;
    }
  }
  return false;
}

function findEmpty(board) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] === 0) return [r, c];
  return null;
}

function isValid(board, r, c, n) {
  if (board[r].includes(n)) return false;
  for (let i = 0; i < 9; i++) if (board[i][c] === n) return false;
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (board[br + i][bc + j] === n) return false;
  return true;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function countSolutions(board, limit = 2) {
  const empty = findEmpty(board);
  if (!empty) return 1;
  const [r, c] = empty;
  let count = 0;
  for (let n = 1; n <= 9; n++) {
    if (isValid(board, r, c, n)) {
      board[r][c] = n;
      count += countSolutions(board, limit);
      board[r][c] = 0;
      if (count >= limit) return count;
    }
  }
  return count;
}

const CLUES = { easy: 36, medium: 28, hard: 22 };

function createPuzzle(difficulty) {
  const solution = generateSolved();
  const puzzle = solution.map(r => [...r]);
  const cells = shuffle([...Array(81).keys()]);
  let removed = 0;
  const target = 81 - CLUES[difficulty];
  for (const idx of cells) {
    if (removed >= target) break;
    const r = Math.floor(idx / 9), c = idx % 9;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    const copy = puzzle.map(row => [...row]);
    if (countSolutions(copy) === 1) {
      removed++;
    } else {
      puzzle[r][c] = backup;
    }
  }
  return { puzzle, solution };
}

// ============================================================
// Game State
// ============================================================

const state = {
  puzzle: null,
  solution: null,
  board: null,   // user's current board (0 = empty)
  given: null,   // bool grid
  notes: null,   // 9x9 array of Set
  selected: null,
  noteMode: false,
  difficulty: 'easy',
  timer: 0,
  timerInterval: null,
  hintsUsed: 0,
  won: false,
};

// ============================================================
// DOM helpers
// ============================================================

const $ = id => document.getElementById(id);
const boardEl = $('board');

function buildBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', () => selectCell(r, c));
      boardEl.appendChild(cell);
    }
  }
}

function getCell(r, c) {
  return boardEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
}

function renderBoard() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      renderCell(r, c);
    }
  }
  renderHighlights();
  updateNumpadCompleted();
}

function renderCell(r, c) {
  const cell = getCell(r, c);
  const val = state.board[r][c];
  const noteSet = state.notes[r][c];

  cell.className = 'cell';
  if (state.given[r][c]) cell.classList.add('given');

  const hasNotes = noteSet.size > 0 && val === 0;

  if (hasNotes) {
    cell.classList.add('note-mode');
    const grid = document.createElement('div');
    grid.className = 'notes-grid';
    for (let n = 1; n <= 9; n++) {
      const span = document.createElement('div');
      span.className = 'note-num';
      span.textContent = noteSet.has(n) ? n : '';
      grid.appendChild(span);
    }
    cell.innerHTML = '';
    cell.appendChild(grid);
  } else {
    cell.innerHTML = val || '';
    if (val && !state.given[r][c]) {
      if (!isValidPlacement(r, c, val)) {
        cell.classList.add('error');
      }
    }
  }
}

function isValidPlacement(r, c, val) {
  for (let i = 0; i < 9; i++) {
    if (i !== c && state.board[r][i] === val) return false;
    if (i !== r && state.board[i][c] === val) return false;
  }
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if ((br+i !== r || bc+j !== c) && state.board[br+i][bc+j] === val) return false;
  return true;
}

function renderHighlights() {
  const sel = state.selected;
  const selVal = sel ? state.board[sel[0]][sel[1]] : 0;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = getCell(r, c);
      cell.classList.remove('selected', 'related', 'same-num');
      if (!sel) continue;
      const [sr, sc] = sel;
      if (r === sr && c === sc) {
        cell.classList.add('selected');
      } else if (r === sr || c === sc || (Math.floor(r/3) === Math.floor(sr/3) && Math.floor(c/3) === Math.floor(sc/3))) {
        cell.classList.add('related');
      } else if (selVal && state.board[r][c] === selVal) {
        cell.classList.add('same-num');
      }
    }
  }
}

function updateNumpadCompleted() {
  for (let n = 1; n <= 9; n++) {
    let count = 0;
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (state.board[r][c] === n) count++;
    const btn = document.querySelector(`.num-btn[data-num="${n}"]`);
    btn.classList.toggle('completed', count >= 9);
  }
}

// ============================================================
// Game logic
// ============================================================

function newGame(difficulty) {
  state.difficulty = difficulty;
  state.won = false;
  state.selected = null;
  state.noteMode = false;
  state.hintsUsed = 0;
  $('btn-note').classList.remove('note-on');

  const { puzzle, solution } = createPuzzle(difficulty);
  state.puzzle = puzzle;
  state.solution = solution;
  state.board = puzzle.map(r => [...r]);
  state.given = puzzle.map(r => r.map(v => v !== 0));
  state.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));

  resetTimer();
  startTimer();
  buildBoard();
  renderBoard();
  $('win-overlay').classList.add('hidden');
}

function selectCell(r, c) {
  state.selected = [r, c];
  renderHighlights();
}

function inputNumber(n) {
  if (!state.selected || state.won) return;
  const [r, c] = state.selected;
  if (state.given[r][c]) return;

  if (state.noteMode) {
    if (state.board[r][c] === 0) {
      const notes = state.notes[r][c];
      notes.has(n) ? notes.delete(n) : notes.add(n);
    }
  } else {
    const prev = state.board[r][c];
    state.board[r][c] = prev === n ? 0 : n;
    state.notes[r][c].clear();
    if (state.board[r][c] !== 0) {
      clearRelatedNotes(r, c, state.board[r][c]);
      renderRelatedCells(r, c);
    }
    checkWin();
  }

  renderCell(r, c);
  renderHighlights();
  updateNumpadCompleted();
}

function renderRelatedCells(r, c) {
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 9; i++) {
    if (i !== c) renderCell(r, i);
    if (i !== r) renderCell(i, c);
  }
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (br + i !== r || bc + j !== c) renderCell(br + i, bc + j);
}

function eraseCell() {
  if (!state.selected || state.won) return;
  const [r, c] = state.selected;
  if (state.given[r][c]) return;
  state.board[r][c] = 0;
  state.notes[r][c].clear();
  renderCell(r, c);
  renderHighlights();
  updateNumpadCompleted();
}

function giveHint() {
  if (!state.selected || state.won) return;
  const [r, c] = state.selected;
  if (state.given[r][c] || state.board[r][c] === state.solution[r][c]) return;
  state.board[r][c] = state.solution[r][c];
  state.notes[r][c].clear();
  clearRelatedNotes(r, c, state.board[r][c]);
  renderRelatedCells(r, c);
  state.hintsUsed++;
  renderCell(r, c);
  renderHighlights();
  updateNumpadCompleted();
  checkWin();
}

function clearRelatedNotes(r, c, n) {
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 9; i++) {
    state.notes[r][i].delete(n);   // same row
    state.notes[i][c].delete(n);   // same col
  }
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      state.notes[br + i][bc + j].delete(n); // same box
}

function checkWin() {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (state.board[r][c] !== state.solution[r][c]) return;
  state.won = true;
  stopTimer();
  setTimeout(showWin, 400);
}

function showWin() {
  const mins = String(Math.floor(state.timer / 60)).padStart(2, '0');
  const secs = String(state.timer % 60).padStart(2, '0');
  const diff = { easy: '簡單', medium: '中等', hard: '困難' }[state.difficulty];
  $('win-time').textContent = `${diff} · 用時 ${mins}:${secs}${state.hintsUsed ? ` · 提示 ${state.hintsUsed} 次` : ''}`;
  $('win-overlay').classList.remove('hidden');
}

// ============================================================
// Timer
// ============================================================

function startTimer() {
  state.timerInterval = setInterval(() => {
    state.timer++;
    const mins = String(Math.floor(state.timer / 60)).padStart(2, '0');
    const secs = String(state.timer % 60).padStart(2, '0');
    $('timer').textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerInterval);
}

function resetTimer() {
  stopTimer();
  state.timer = 0;
  $('timer').textContent = '00:00';
}

// ============================================================
// Event listeners
// ============================================================

document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    newGame(btn.dataset.diff);
  });
});

document.querySelectorAll('.num-btn').forEach(btn => {
  btn.addEventListener('click', () => inputNumber(Number(btn.dataset.num)));
});

$('btn-erase').addEventListener('click', eraseCell);
$('btn-hint').addEventListener('click', giveHint);
$('btn-note').addEventListener('click', () => {
  state.noteMode = !state.noteMode;
  $('btn-note').classList.toggle('note-on', state.noteMode);
});
$('btn-new').addEventListener('click', () => newGame(state.difficulty));
$('win-new').addEventListener('click', () => newGame(state.difficulty));

document.addEventListener('keydown', e => {
  if (e.key >= '1' && e.key <= '9') inputNumber(Number(e.key));
  if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') eraseCell();
  if (e.key === 'n' || e.key === 'N') {
    state.noteMode = !state.noteMode;
    $('btn-note').classList.toggle('note-on', state.noteMode);
  }
  const arrows = { ArrowUp: [-1,0], ArrowDown: [1,0], ArrowLeft: [0,-1], ArrowRight: [0,1] };
  if (arrows[e.key] && state.selected) {
    const [dr, dc] = arrows[e.key];
    const nr = Math.max(0, Math.min(8, state.selected[0] + dr));
    const nc = Math.max(0, Math.min(8, state.selected[1] + dc));
    selectCell(nr, nc);
  }
});

// ============================================================
// Theme
// ============================================================

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.theme === theme);
  });
  localStorage.setItem('sudoku-theme', theme);
}

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
});

// ============================================================
// Init
// ============================================================

applyTheme(localStorage.getItem('sudoku-theme') || 'ocean');
newGame('easy');
