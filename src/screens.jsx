// Main game screens — Mobile & Tablet (production, no device shells)

function TopBar({ theme, state, dispatch, onThemeChange, currentTheme }) {
  const themes = window.THEMES;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%',
    }}>
      {/* Theme swatches */}
      <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
        {Object.entries(themes).map(([key, t]) => (
          <button
            key={key}
            onClick={() => onThemeChange(key)}
            style={{
              width: 22, height: 22, borderRadius: 11,
              border: currentTheme === key ? `2.5px solid ${theme.ink}` : '2.5px solid transparent',
              background: `linear-gradient(135deg, ${t.accent1}, ${t.accent3})`,
              cursor: 'pointer',
              padding: 0,
              transition: 'transform 0.15s, border-color 0.2s',
              transform: currentTheme === key ? 'scale(1.15)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div style={{
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: 19, fontWeight: 600,
        color: theme.ink, letterSpacing: -0.3,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{
          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.accent1}, ${theme.accent3})`,
        }}/>
        數獨
      </div>

      {/* New game button */}
      <button
        onClick={() => dispatch({ type: 'NEW_GAME', difficulty: state.difficulty })}
        style={{
          width: 36, height: 36, borderRadius: 18,
          border: 'none', cursor: 'pointer',
          background: theme.surface,
          boxShadow: `0 1px 2px ${theme.accent1}14, 0 3px 10px ${theme.accent1}0f`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.15s',
        }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.9)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M20 12A8 8 0 004.93 6.93M4 12a8 8 0 0015.07 5.07" stroke={theme.ink} strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M4 4v4h4" stroke={theme.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 20v-4h-4" stroke={theme.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

function DifficultyBar({ state, dispatch, theme }) {
  const diffs = [
    { key: 'easy', label: '簡單' },
    { key: 'medium', label: '中等' },
    { key: 'hard', label: '困難' },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {diffs.map(d => {
        const active = state.difficulty === d.key;
        return (
          <button
            key={d.key}
            onClick={() => {
              if (d.key !== state.difficulty) dispatch({ type: 'NEW_GAME', difficulty: d.key });
            }}
            style={{
              padding: '6px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontFamily: "'Nunito', -apple-system, system-ui, sans-serif",
              fontSize: 13, fontWeight: 700, letterSpacing: 0.2,
              background: active ? theme.accent1 : theme.surface,
              color: active ? '#fff' : theme.inkSoft,
              boxShadow: active
                ? `0 4px 14px ${theme.accent1}55`
                : `0 1px 2px ${theme.accent1}14, 0 3px 10px ${theme.accent1}0f`,
              transition: 'all 0.2s',
            }}
          >{d.label}</button>
        );
      })}
    </div>
  );
}

// Celebration confetti overlay
function CelebrationLayer({ celebrate, theme }) {
  if (!celebrate) return null;
  const [show, setShow] = React.useState(true);

  React.useEffect(() => {
    setShow(true);
    const t = setTimeout(() => setShow(false), 1100);
    return () => clearTimeout(t);
  }, [celebrate.id]);

  if (!show) return null;

  const particles = [];
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2;
    const dist = 40 + Math.random() * 40;
    const colors = [theme.accent1, theme.accent2, theme.accent3];
    particles.push({
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      color: colors[i % 3],
      size: 5 + Math.random() * 4,
      rot: Math.random() * 360,
    });
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ position: 'relative', width: 0, height: 0 }}>
        <div style={{
          position: 'absolute', left: -60, top: -16,
          padding: '6px 14px', borderRadius: 14,
          background: theme.celebrate,
          color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: 0.3,
          fontFamily: "'Nunito', system-ui",
          boxShadow: `0 8px 20px ${theme.celebrate}66`,
          animation: 'celebrateLabel 1s ease',
          whiteSpace: 'nowrap',
        }}>
          {celebrate.type === 'row' ? '列完成！' : celebrate.type === 'col' ? '行完成！' : '宮完成！'}
        </div>
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute', left: 0, top: 0,
            width: p.size, height: p.size,
            background: p.color, borderRadius: 2,
            animation: `confetti${p.id} 1s ease-out forwards`,
          }}/>
        ))}
      </div>
      <style>{`
        @keyframes celebrateLabel {
          0% { transform: scale(0); opacity: 0; }
          30% { transform: scale(1.15); opacity: 1; }
          70% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0; }
        }
        ${particles.map(p => `
          @keyframes confetti${p.id} {
            0% { transform: translate(0,0) rotate(0deg); opacity: 1; }
            100% { transform: translate(${p.x * 2.5}px, ${p.y * 2.5 + 40}px) rotate(${p.rot + 200}deg); opacity: 0; }
          }
        `).join('\n')}
      `}</style>
    </div>
  );
}

// Win overlay
function WinOverlay({ state, dispatch, theme }) {
  const diffLabel = { easy: '簡單', medium: '中等', hard: '困難' }[state.difficulty];
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `${theme.bg}e0`,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div style={{
        background: theme.surface,
        borderRadius: 32,
        padding: '36px 32px 28px',
        textAlign: 'center',
        boxShadow: `0 8px 40px ${theme.accent1}22, 0 2px 8px ${theme.accent1}14`,
        maxWidth: 280, width: '80%',
        animation: 'winPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <div style={{ fontSize: 48, lineHeight: 1 }}>🎉</div>
        <div style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 22, fontWeight: 600, color: theme.ink,
          marginTop: 12,
        }}>完成了！</div>
        <div style={{
          fontSize: 13, color: theme.inkSoft, fontWeight: 600,
          marginTop: 8, lineHeight: 1.6,
        }}>
          {diffLabel} · {window.formatTime(state.seconds)}
          {state.mistakes > 0 && ` · 錯誤 ${state.mistakes} 次`}
          {state.hintsLeft < 3 && ` · 提示 ${3 - state.hintsLeft} 次`}
        </div>
        <div style={{
          fontSize: 13, color: theme.inkSoft, fontWeight: 600,
          marginTop: 4,
        }}>得分 {state.score.toLocaleString()}</div>
        <button
          onClick={() => dispatch({ type: 'NEW_GAME', difficulty: state.difficulty })}
          style={{
            marginTop: 22,
            padding: '12px 32px', width: '100%',
            borderRadius: 24, border: 'none', cursor: 'pointer',
            fontFamily: "'Nunito', system-ui",
            fontSize: 15, fontWeight: 800,
            background: `linear-gradient(135deg, ${theme.accent1}, ${theme.accent2})`,
            color: '#fff',
            boxShadow: `0 4px 16px ${theme.accent1}55`,
            transition: 'transform 0.15s',
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >再來一局</button>
      </div>
      <style>{`
        @keyframes winPop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Mobile layout (portrait phones) ───────────────────────────

function MobileGame({ state, dispatch, theme, onThemeChange, currentTheme }) {
  const cellSize = Math.max(28, Math.floor((Math.min(window.innerWidth, 430) - 54) / 9));

  return (
    <div style={{
      width: '100%', height: '100%',
      background: theme.bgGrad,
      display: 'flex', flexDirection: 'column',
      padding: '12px 16px 20px',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
      boxSizing: 'border-box',
      fontFamily: "'Nunito', -apple-system, system-ui, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: -60, right: -50,
        width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.accent2}44 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: -40, left: -50,
        width: 180, height: 180, borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.accent3}33 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}/>

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', gap: 10,
        height: '100%',
      }}>
        <TopBar theme={theme} state={state} dispatch={dispatch} onThemeChange={onThemeChange} currentTheme={currentTheme} />
        <DifficultyBar state={state} dispatch={dispatch} theme={theme} />
        <StatusRow state={state} theme={theme} size="mobile" />

        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginTop: 2 }}>
          <SudokuBoard state={state} dispatch={dispatch} theme={theme} cellSize={cellSize} />
          <CelebrationLayer celebrate={state.celebrate} theme={theme} />
        </div>

        <div style={{ flex: 1 }} />
        <ActionBar state={state} dispatch={dispatch} theme={theme} size="mobile" />
        <NumberPad state={state} dispatch={dispatch} theme={theme} size="mobile" />
      </div>

      {state.won && <WinOverlay state={state} dispatch={dispatch} theme={theme} />}
    </div>
  );
}

// ── Tablet layout (landscape / wide screens) ──────────────────

function TabletGame({ state, dispatch, theme, onThemeChange, currentTheme }) {
  const cellSize = 54;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: theme.bgGrad,
      padding: '28px 40px 36px',
      boxSizing: 'border-box',
      fontFamily: "'Nunito', -apple-system, system-ui, sans-serif",
      display: 'flex', flexDirection: 'column',
      gap: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: -100, right: -80,
        width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.accent2}44 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: -120, left: -80,
        width: 380, height: 380, borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.accent3}33 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        <TopBar theme={theme} state={state} dispatch={dispatch} onThemeChange={onThemeChange} currentTheme={currentTheme} />
        <DifficultyBar state={state} dispatch={dispatch} theme={theme} />

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28,
          flex: 1, alignItems: 'start',
        }}>
          {/* Left: board + status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <StatusRow state={state} theme={theme} size="ipad" />
            <div style={{ position: 'relative' }}>
              <SudokuBoard state={state} dispatch={dispatch} theme={theme} cellSize={cellSize} />
              <CelebrationLayer celebrate={state.celebrate} theme={theme} />
            </div>
          </div>

          {/* Right: controls panel */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 20,
            padding: '24px 20px',
            background: theme.surface,
            borderRadius: 28,
            boxShadow: `0 2px 6px ${theme.accent1}12, 0 12px 36px ${theme.accent1}18`,
            border: `1px solid ${theme.boardLine}`,
          }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: theme.inkSoft,
                letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12,
              }}>操作</div>
              <ActionBar state={state} dispatch={dispatch} theme={theme} size="ipad" />
            </div>

            <div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: theme.inkSoft,
                letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12,
              }}>數字</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[1,2,3,4,5,6,7,8,9].map(n => {
                  const left = window.countRemaining(state.board)[n];
                  const done = left === 0;
                  const selValue = state.selected ? state.board[state.selected.r][state.selected.c].value : 0;
                  const isSelected = selValue === n && !done;
                  return (
                    <button
                      key={n}
                      disabled={done}
                      onClick={() => dispatch({ type: 'INPUT_NUMBER', num: n })}
                      style={{
                        height: 68, border: 'none', padding: 0,
                        cursor: done ? 'default' : 'pointer',
                        borderRadius: 18,
                        background: done ? theme.surfaceSoft : theme.surface,
                        boxShadow: done ? 'none'
                          : isSelected
                            ? `0 2px 4px ${theme.accent1}22, 0 10px 22px ${theme.accent1}44, inset 0 0 0 2px ${theme.accent1}`
                            : `0 1px 2px ${theme.accent1}18, 0 5px 14px ${theme.accent1}14`,
                        opacity: done ? 0.35 : 1,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 2,
                        fontFamily: "'Nunito', -apple-system, system-ui, sans-serif",
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{
                        fontSize: 26, fontWeight: 700,
                        color: done ? theme.inkSoft : theme.user, lineHeight: 1,
                      }}>{done ? '✓' : n}</span>
                      {!done && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: theme.inkSoft }}>
                          剩 {left}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hints info */}
            <div style={{
              padding: '14px 12px',
              background: theme.surfaceSoft,
              borderRadius: 16,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `linear-gradient(135deg, ${theme.accent1}, ${theme.accent3})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${theme.accent1}55`,
                flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3a6 6 0 00-4 10.5V16h8v-2.5A6 6 0 0012 3z" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round"/>
                  <path d="M9 19h6M10 22h4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.ink }}>需要提示？</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: theme.inkSoft, marginTop: 1 }}>
                  還有 {state.hintsLeft} 次提示
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {state.won && <WinOverlay state={state} dispatch={dispatch} theme={theme} />}
    </div>
  );
}

window.MobileGame = MobileGame;
window.TabletGame = TabletGame;
window.CelebrationLayer = CelebrationLayer;
window.WinOverlay = WinOverlay;
window.TopBar = TopBar;
window.DifficultyBar = DifficultyBar;
