// Sudoku Board component

function SudokuBoard({ state, dispatch, theme, cellSize = 36 }) {
  const { board, selected, celebrate } = state;
  const sel = selected;
  const selValue = sel ? board[sel.r][sel.c].value : 0;

  const gap = 1;
  const boldGap = 2;
  const pad = 6;
  const boardSize = 9 * cellSize + 6 * gap + 2 * boldGap + 2 * pad;

  const cells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = board[r][c];
      const isSelected = sel && sel.r === r && sel.c === c;
      const inRow = sel && sel.r === r;
      const inCol = sel && sel.c === c;
      const inBox = sel && window.boxIndex(r, c) === window.boxIndex(sel.r, sel.c);
      const isPeer = !isSelected && (inRow || inCol || inBox);
      const isSameNum = !isSelected && selValue !== 0 && cell.value === selValue && !cell.mistake;

      let bg = 'transparent';
      if (isSelected) bg = theme.selectedCell;
      else if (isSameNum) bg = theme.sameNum;
      else if (isPeer) bg = theme.peer;
      if (cell.mistake) bg = theme.mistakeBg;

      const x = pad + c * cellSize + Math.floor(c / 3) * boldGap + (c - Math.floor(c / 3)) * gap;
      const y = pad + r * cellSize + Math.floor(r / 3) * boldGap + (r - Math.floor(r / 3)) * gap;

      let celebGlow = null;
      if (celebrate) {
        const hit = (celebrate.type === 'row' && celebrate.index === r)
                 || (celebrate.type === 'col' && celebrate.index === c)
                 || (celebrate.type === 'box' && celebrate.index === window.boxIndex(r, c));
        if (hit) celebGlow = `0 0 0 2px ${theme.celebrate}, 0 0 18px ${theme.celebrate}aa`;
      }

      cells.push(
        <div
          key={`${r}-${c}`}
          onClick={() => dispatch({ type: 'SELECT', r, c })}
          style={{
            position: 'absolute', left: x, top: y,
            width: cellSize, height: cellSize,
            background: bg,
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.18s ease, transform 0.3s ease, box-shadow 0.3s ease',
            boxShadow: celebGlow || (isSelected ? `inset 0 0 0 2px ${theme.selected}` : 'none'),
            transform: celebGlow ? 'scale(1.05)' : 'scale(1)',
            zIndex: isSelected ? 3 : (celebGlow ? 2 : 1),
            userSelect: 'none',
          }}
        >
          {cell.value !== 0 ? (
            <span style={{
              fontFamily: "'Nunito', -apple-system, system-ui, sans-serif",
              fontSize: cellSize * 0.55,
              fontWeight: cell.given ? 700 : 600,
              color: cell.mistake ? theme.mistake : (cell.given ? theme.given : theme.user),
              transition: 'color 0.2s',
            }}>{cell.value}</span>
          ) : cell.notes.size > 0 ? (
            <div style={{
              position: 'absolute', inset: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(3, 1fr)',
              fontSize: Math.max(8, cellSize * 0.22),
              fontFamily: "'Nunito', -apple-system, system-ui, sans-serif",
              fontWeight: 600,
              color: theme.inkSoft,
            }}>
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <div key={n} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: cell.notes.has(n) ? 1 : 0,
                }}>{n}</div>
              ))}
            </div>
          ) : null}
        </div>
      );
    }
  }

  const lines = [];
  for (let i = 1; i < 3; i++) {
    const p = pad + i * 3 * cellSize + i * boldGap + (i * 3 - 1) * gap - boldGap / 2 - 0.5;
    lines.push(
      <div key={`v${i}`} style={{
        position: 'absolute', left: p, top: pad, width: boldGap, height: boardSize - 2 * pad,
        background: theme.boardLineBold, borderRadius: 2,
      }}/>,
      <div key={`h${i}`} style={{
        position: 'absolute', top: p, left: pad, height: boldGap, width: boardSize - 2 * pad,
        background: theme.boardLineBold, borderRadius: 2,
      }}/>
    );
  }

  return (
    <div style={{
      width: boardSize, height: boardSize,
      background: theme.boardBg,
      borderRadius: 20,
      position: 'relative',
      boxShadow: `0 1px 2px ${theme.accent1}12, 0 8px 24px ${theme.accent1}14, 0 20px 60px ${theme.accent1}0a`,
      border: `1px solid ${theme.boardLine}`,
      flexShrink: 0,
    }}>
      {lines}
      {cells}
    </div>
  );
}

window.SudokuBoard = SudokuBoard;
