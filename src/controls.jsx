// Number Pad + Action buttons

function NumberPad({ state, dispatch, theme, size = 'mobile' }) {
  const remaining = window.countRemaining(state.board);
  const selValue = state.selected ? state.board[state.selected.r][state.selected.c].value : 0;

  const pillWidth = size === 'ipad' ? 60 : 44;
  const pillHeight = size === 'ipad' ? 78 : 60;
  const fontSize = size === 'ipad' ? 30 : 22;
  const gap = size === 'ipad' ? 10 : 6;

  return (
    <div style={{ display: 'flex', gap, justifyContent: 'center', flexWrap: 'nowrap' }}>
      {[1,2,3,4,5,6,7,8,9].map(n => {
        const left = remaining[n];
        const done = left === 0;
        const isSelected = selValue === n && !done;
        return (
          <button
            key={n}
            disabled={done}
            onClick={() => dispatch({ type: 'INPUT_NUMBER', num: n })}
            style={{
              width: pillWidth, height: pillHeight,
              border: 'none', padding: 0, cursor: done ? 'default' : 'pointer',
              borderRadius: pillWidth / 2,
              background: done ? theme.surfaceSoft : theme.surface,
              boxShadow: done
                ? 'none'
                : isSelected
                  ? `0 1px 2px ${theme.accent1}22, 0 8px 20px ${theme.accent1}44, inset 0 0 0 2px ${theme.accent1}`
                  : `0 1px 2px ${theme.accent1}18, 0 4px 12px ${theme.accent1}14`,
              position: 'relative',
              transition: 'transform 0.15s ease, box-shadow 0.2s ease',
              opacity: done ? 0.35 : 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Nunito', -apple-system, system-ui, sans-serif",
            }}
            onMouseDown={e => { if (!done) e.currentTarget.style.transform = 'scale(0.92)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            onTouchStart={e => { if (!done) e.currentTarget.style.transform = 'scale(0.92)'; }}
            onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span style={{
              fontSize, fontWeight: 700,
              color: done ? theme.inkSoft : theme.user,
              lineHeight: 1,
            }}>{done ? '✓' : n}</span>
            {!done && (
              <span style={{
                fontSize: size === 'ipad' ? 11 : 9,
                fontWeight: 600,
                color: theme.inkSoft,
                marginTop: 2,
                letterSpacing: 0.3,
              }}>{left}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ActionBar({ state, dispatch, theme, size = 'mobile' }) {
  const btn = size === 'ipad' ? 60 : 50;
  const iconSize = size === 'ipad' ? 24 : 20;
  const labelSize = size === 'ipad' ? 11 : 10;

  const actions = [
    {
      id: 'UNDO', label: '復原', disabled: state.history.length === 0,
      icon: (s, c) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M9 14L4 9l5-5M4 9h10a6 6 0 016 6v1" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'ERASE', label: '清除',
      icon: (s, c) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M15 3l6 6-10 10H5v-6L15 3z" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 8l6 6" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'NOTES', label: '筆記', toggle: state.notesMode,
      icon: (s, c) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h10" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
          <circle cx="19" cy="18" r="2.5" stroke={c} strokeWidth="2.2"/>
        </svg>
      ),
    },
    {
      id: 'HINT', label: '提示', badge: state.hintsLeft, disabled: state.hintsLeft === 0,
      icon: (s, c) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M12 3a6 6 0 00-4 10.5V16h8v-2.5A6 6 0 0012 3z" stroke={c} strokeWidth="2.2" strokeLinejoin="round"/>
          <path d="M9 19h6M10 22h4" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', gap: size === 'ipad' ? 12 : 8, justifyContent: 'center' }}>
      {actions.map(a => {
        const active = a.toggle;
        const c = a.disabled ? theme.inkSoft + '77' : (active ? '#fff' : theme.user);
        return (
          <button
            key={a.id}
            disabled={a.disabled}
            onClick={() => dispatch({ type: a.id })}
            style={{
              width: btn, height: btn + 18, border: 'none',
              padding: '6px 4px 8px',
              cursor: a.disabled ? 'default' : 'pointer',
              borderRadius: 16,
              background: active ? theme.user : theme.surface,
              boxShadow: active
                ? `0 1px 2px ${theme.accent1}22, 0 8px 18px ${theme.accent1}55`
                : a.disabled ? 'none' : `0 1px 2px ${theme.accent1}18, 0 4px 12px ${theme.accent1}14`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              fontFamily: "'Nunito', -apple-system, system-ui, sans-serif",
              position: 'relative',
              transition: 'all 0.18s ease',
              opacity: a.disabled ? 0.5 : 1,
            }}
          >
            {a.icon(iconSize, c)}
            <span style={{ fontSize: labelSize, fontWeight: 700, color: c, letterSpacing: 0.4 }}>{a.label}</span>
            {a.badge !== undefined && a.badge > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 6,
                background: theme.accent2,
                color: '#fff',
                fontSize: 10, fontWeight: 800,
                minWidth: 16, height: 16, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
                boxShadow: `0 2px 4px ${theme.accent2}55`,
              }}>{a.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

window.NumberPad = NumberPad;
window.ActionBar = ActionBar;
