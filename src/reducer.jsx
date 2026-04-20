// Reducer + StatusRow

function sudokuReducer(state, action) {
  switch (action.type) {

    case 'NEW_GAME': {
      const difficulty = action.difficulty || state.difficulty;
      const { puzzle, solution } = window.createPuzzle(difficulty);
      const board = window.buildBoard(puzzle, solution);
      return {
        board, solution,
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
        score: window.BASE_SCORE[difficulty],
      };
    }

    case 'SELECT': {
      return { ...state, selected: { r: action.r, c: action.c } };
    }

    case 'INPUT_NUMBER': {
      if (state.won) return state;
      const { r, c } = state.selected || {};
      if (r == null) return state;
      const cell = state.board[r][c];
      if (cell.given) return state;

      const newBoard = window.cloneBoard(state.board);
      const newCell = newBoard[r][c];

      if (state.notesMode) {
        const notes = new Set(cell.notes);
        if (notes.has(action.num)) notes.delete(action.num); else notes.add(action.num);
        newCell.notes = notes;
        newCell.value = 0;
        newCell.mistake = false;
      } else {
        if (cell.value === action.num) {
          newCell.value = 0;
          newCell.mistake = false;
        } else {
          newCell.value = action.num;
          newCell.notes = new Set();
          newCell.mistake = state.solution[r][c] !== action.num;
        }
      }

      const history = [...state.history, { r, c, before: {
        value: cell.value, notes: new Set(cell.notes), mistake: cell.mistake,
      }}];

      let mistakes = state.mistakes;
      if (!state.notesMode && newCell.mistake && !cell.mistake && cell.value !== action.num) {
        mistakes = Math.min(3, state.mistakes + 1);
      }

      // check row/col/box completions for celebration
      const completeness = window.checkCompleteness(newBoard, state.solution);
      let celebrate = state.celebrate;
      const newCompleted = {
        rows: new Set(state.completed.rows),
        cols: new Set(state.completed.cols),
        boxes: new Set(state.completed.boxes),
      };
      for (const r2 of completeness.rows) {
        if (!state.completed.rows.has(r2)) {
          newCompleted.rows.add(r2);
          celebrate = { type: 'row', index: r2, id: Date.now() + r2 };
        }
      }
      for (const c2 of completeness.cols) {
        if (!state.completed.cols.has(c2)) {
          newCompleted.cols.add(c2);
          celebrate = { type: 'col', index: c2, id: Date.now() + c2 + 100 };
        }
      }
      for (const b2 of completeness.boxes) {
        if (!state.completed.boxes.has(b2)) {
          newCompleted.boxes.add(b2);
          celebrate = { type: 'box', index: b2, id: Date.now() + b2 + 200 };
        }
      }

      // win check: all 81 cells correct
      const won = newBoard.every((row, ri) => row.every((cell, ci) => cell.value === state.solution[ri][ci]));

      return { ...state, board: newBoard, history, mistakes, completed: newCompleted, celebrate, won };
    }

    case 'ERASE': {
      if (state.won) return state;
      const { r, c } = state.selected || {};
      if (r == null) return state;
      const cell = state.board[r][c];
      if (cell.given || (cell.value === 0 && cell.notes.size === 0)) return state;

      const newBoard = window.cloneBoard(state.board);
      const history = [...state.history, { r, c, before: {
        value: cell.value, notes: new Set(cell.notes), mistake: cell.mistake,
      }}];
      newBoard[r][c].value = 0;
      newBoard[r][c].notes = new Set();
      newBoard[r][c].mistake = false;
      return { ...state, board: newBoard, history };
    }

    case 'NOTES': {
      return { ...state, notesMode: !state.notesMode };
    }

    case 'HINT': {
      if (state.hintsLeft === 0 || state.won) return state;
      // find first empty or wrong cell
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const cell = state.board[r][c];
          if (cell.given) continue;
          if (cell.value === 0 || cell.mistake) {
            const newBoard = window.cloneBoard(state.board);
            const history = [...state.history, { r, c, before: {
              value: cell.value, notes: new Set(cell.notes), mistake: cell.mistake,
            }}];
            newBoard[r][c].value = state.solution[r][c];
            newBoard[r][c].notes = new Set();
            newBoard[r][c].mistake = false;

            const completeness = window.checkCompleteness(newBoard, state.solution);
            const newCompleted = {
              rows: new Set(state.completed.rows),
              cols: new Set(state.completed.cols),
              boxes: new Set(state.completed.boxes),
            };
            let celebrate = state.celebrate;
            for (const r2 of completeness.rows) if (!state.completed.rows.has(r2)) { newCompleted.rows.add(r2); celebrate = { type: 'row', index: r2, id: Date.now() }; }
            for (const c2 of completeness.cols) if (!state.completed.cols.has(c2)) { newCompleted.cols.add(c2); celebrate = { type: 'col', index: c2, id: Date.now() + 1 }; }
            for (const b2 of completeness.boxes) if (!state.completed.boxes.has(b2)) { newCompleted.boxes.add(b2); celebrate = { type: 'box', index: b2, id: Date.now() + 2 }; }

            const won = newBoard.every((row, ri) => row.every((cell, ci) => cell.value === state.solution[ri][ci]));

            return {
              ...state, board: newBoard, history,
              hintsLeft: state.hintsLeft - 1,
              selected: { r, c },
              completed: newCompleted, celebrate, won,
            };
          }
        }
      }
      return state;
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const history = [...state.history];
      const last = history.pop();
      const newBoard = window.cloneBoard(state.board);
      newBoard[last.r][last.c].value = last.before.value;
      newBoard[last.r][last.c].notes = last.before.notes;
      newBoard[last.r][last.c].mistake = last.before.mistake;
      return { ...state, board: newBoard, history, selected: { r: last.r, c: last.c } };
    }

    case 'TICK': {
      if (state.won) return state;
      return {
        ...state,
        seconds: state.seconds + 1,
        score: Math.max(0, state.score - 1),
      };
    }

    case 'CLEAR_CELEBRATE': {
      return { ...state, celebrate: null };
    }

    default: return state;
  }
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function StatusRow({ state, theme, size = 'mobile' }) {
  const pillHeight = size === 'ipad' ? 42 : 34;
  const fontSize = size === 'ipad' ? 15 : 13;
  const labelSize = size === 'ipad' ? 11 : 10;

  const diffLabel = { easy: '簡單', medium: '中等', hard: '困難' }[state.difficulty] || '簡單';

  const pillBase = {
    height: pillHeight,
    borderRadius: pillHeight / 2,
    background: theme.surface,
    boxShadow: `0 1px 2px ${theme.accent1}14, 0 3px 10px ${theme.accent1}0f`,
    display: 'flex', alignItems: 'center', gap: 6,
    padding: size === 'ipad' ? '0 14px' : '0 11px',
    fontFamily: "'Nunito', -apple-system, system-ui, sans-serif",
    flex: 1,
    justifyContent: 'center',
  };

  return (
    <div style={{
      display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center',
      width: '100%',
    }}>
      {/* Difficulty */}
      <div style={pillBase}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: theme.accent2,
          boxShadow: `0 0 6px ${theme.accent2}`,
          flexShrink: 0,
        }}/>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: labelSize, color: theme.inkSoft, fontWeight: 600, lineHeight: 1, letterSpacing: 0.4, textTransform: 'uppercase' }}>難度</span>
          <span style={{ fontSize, color: theme.ink, fontWeight: 700, lineHeight: 1.2 }}>{diffLabel}</span>
        </div>
      </div>

      {/* Mistakes */}
      <div style={pillBase}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M12 3L2 20h20L12 3z" stroke={state.mistakes > 0 ? theme.mistake : theme.inkSoft} strokeWidth="2.2" strokeLinejoin="round"/>
          <path d="M12 10v4" stroke={state.mistakes > 0 ? theme.mistake : theme.inkSoft} strokeWidth="2.2" strokeLinecap="round"/>
          <circle cx="12" cy="17" r="1" fill={state.mistakes > 0 ? theme.mistake : theme.inkSoft}/>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: labelSize, color: theme.inkSoft, fontWeight: 600, lineHeight: 1, letterSpacing: 0.4, textTransform: 'uppercase' }}>錯誤</span>
          <span style={{ fontSize, color: state.mistakes > 0 ? theme.mistake : theme.ink, fontWeight: 700, lineHeight: 1.2 }}>{state.mistakes}/3</span>
        </div>
      </div>

      {/* Score */}
      <div style={pillBase}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l2.6 6 6.4.5-4.9 4.2 1.5 6.3L12 15.8 6.4 19l1.5-6.3L3 8.5 9.4 8 12 2z" fill={theme.accent2} stroke={theme.accent2} strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: labelSize, color: theme.inkSoft, fontWeight: 600, lineHeight: 1, letterSpacing: 0.4, textTransform: 'uppercase' }}>分數</span>
          <span style={{ fontSize, color: theme.ink, fontWeight: 700, lineHeight: 1.2 }}>{state.score.toLocaleString()}</span>
        </div>
      </div>

      {/* Timer */}
      <div style={pillBase}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="13" r="8" stroke={theme.accent1} strokeWidth="2.2"/>
          <path d="M12 8v5l3 2M9 3h6" stroke={theme.accent1} strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: labelSize, color: theme.inkSoft, fontWeight: 600, lineHeight: 1, letterSpacing: 0.4, textTransform: 'uppercase' }}>時間</span>
          <span style={{ fontSize, color: theme.ink, fontWeight: 700, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{formatTime(state.seconds)}</span>
        </div>
      </div>
    </div>
  );
}

window.sudokuReducer = sudokuReducer;
window.StatusRow = StatusRow;
window.formatTime = formatTime;
