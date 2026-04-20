// Sudoku engine — real puzzle generator + state helpers

// ── Puzzle Generator ──────────────────────────────────────────

function generateSolved() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  _solve(board);
  return board;
}

function _solve(board) {
  const empty = _findEmpty(board);
  if (!empty) return true;
  const [r, c] = empty;
  const nums = _shuffle([1,2,3,4,5,6,7,8,9]);
  for (const n of nums) {
    if (_isValid(board, r, c, n)) {
      board[r][c] = n;
      if (_solve(board)) return true;
      board[r][c] = 0;
    }
  }
  return false;
}

function _findEmpty(board) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] === 0) return [r, c];
  return null;
}

function _isValid(board, r, c, n) {
  if (board[r].includes(n)) return false;
  for (let i = 0; i < 9; i++) if (board[i][c] === n) return false;
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (board[br + i][bc + j] === n) return false;
  return true;
}

function _shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function _countSolutions(board, limit = 2) {
  const empty = _findEmpty(board);
  if (!empty) return 1;
  const [r, c] = empty;
  let count = 0;
  for (let n = 1; n <= 9; n++) {
    if (_isValid(board, r, c, n)) {
      board[r][c] = n;
      count += _countSolutions(board, limit);
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
  const cells = _shuffle([...Array(81).keys()]);
  let removed = 0;
  const target = 81 - CLUES[difficulty];
  for (const idx of cells) {
    if (removed >= target) break;
    const r = Math.floor(idx / 9), c = idx % 9;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    const copy = puzzle.map(row => [...row]);
    if (_countSolutions(copy) === 1) {
      removed++;
    } else {
      puzzle[r][c] = backup;
    }
  }
  return { puzzle, solution };
}

// ── State Helpers ─────────────────────────────────────────────

function cloneBoard(b) {
  return b.map(row => row.map(cell => ({
    ...cell,
    notes: new Set(cell.notes),
  })));
}

function countRemaining(board) {
  const counts = { 1:9, 2:9, 3:9, 4:9, 5:9, 6:9, 7:9, 8:9, 9:9 };
  for (const row of board) {
    for (const cell of row) {
      if (cell.value && !cell.mistake) counts[cell.value]--;
    }
  }
  return counts;
}

function boxIndex(r, c) {
  return Math.floor(r / 3) * 3 + Math.floor(c / 3);
}

function checkCompleteness(board, solution) {
  const rows = new Set();
  const cols = new Set();
  const boxes = new Set();

  for (let i = 0; i < 9; i++) {
    let rowOk = true, colOk = true;
    for (let j = 0; j < 9; j++) {
      if (board[i][j].value !== solution[i][j]) rowOk = false;
      if (board[j][i].value !== solution[j][i]) colOk = false;
    }
    if (rowOk) rows.add(i);
    if (colOk) cols.add(i);
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      let ok = true;
      for (let r = br*3; r < br*3+3; r++)
        for (let c = bc*3; c < bc*3+3; c++)
          if (board[r][c].value !== solution[r][c]) ok = false;
      if (ok) boxes.add(br*3+bc);
    }
  }
  return { rows, cols, boxes };
}

function buildBoard(puzzle, solution) {
  return puzzle.map((row, r) =>
    row.map((v, c) => ({
      value: v,
      given: v !== 0,
      notes: new Set(),
      mistake: false,
      r, c,
    }))
  );
}

const BASE_SCORE = { easy: 1000, medium: 2000, hard: 3000 };

function createInitialState() {
  const difficulty = 'easy';
  const { puzzle, solution } = createPuzzle(difficulty);
  return {
    board: buildBoard(puzzle, solution),
    solution,
    selected: { r: 4, c: 4 },
    notesMode: false,
    mistakes: 0,
    hintsLeft: 3,
    seconds: 0,
    history: [],
    completed: { rows: new Set(), cols: new Set(), boxes: new Set() },
    celebrate: null,
    difficulty,
    won: false,
    score: BASE_SCORE[difficulty],
  };
}

Object.assign(window, {
  createPuzzle, buildBoard, cloneBoard, countRemaining,
  boxIndex, checkCompleteness, createInitialState, BASE_SCORE,
});
