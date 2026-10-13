import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { useStockfish } from './useStockfish';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const PIECE_IMG = {
  p: 'peon.png',
  n: 'caballo.png',
  b: 'alfil.png',
  r: 'torre.png',
  q: 'reina.png',
  k: 'rey.png',
};

const DIFFICULTIES = [
  { id: 'easy', label: 'Fácil', emoji: '🐱', skill: 1, movetime: 250, desc: 'Gatito distraído' },
  { id: 'normal', label: 'Normal', emoji: '🐈', skill: 7, movetime: 600, desc: 'Gato curioso' },
  { id: 'hard', label: 'Difícil', emoji: '🐆', skill: 13, movetime: 1100, desc: 'Gato cazador' },
  { id: 'expert', label: 'Experto', emoji: '🦁', skill: 20, movetime: 2000, desc: 'Rey de la selva' },
];

const squareToRC = (square) => ({ r: 8 - Number(square[1]), c: square.charCodeAt(0) - 97 });
const rcToSquare = (r, c) => FILES[c] + (8 - r);

function PieceImg({ piece, className = '' }) {
  if (!piece) return null;
  return (
    <img
      src={`/chess-pieces/${PIECE_IMG[piece.type]}`}
      alt={`${piece.color === 'w' ? 'blanca' : 'negra'} ${piece.type}`}
      draggable={false}
      className={`pointer-events-none h-full w-full select-none object-contain ${
        piece.color === 'w' ? 'piece-white' : 'piece-black'
      } ${className}`}
    />
  );
}

function FlyingPiece({ segment }) {
  const [pos, setPos] = useState(() => squareToRC(segment.from));

  useEffect(() => {
    let inner;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setPos(squareToRC(segment.to)));
    });
    return () => {
      cancelAnimationFrame(outer);
      if (inner) cancelAnimationFrame(inner);
    };
  }, [segment.to]);

  return (
    <div
      className="flying-piece pointer-events-none absolute left-0 top-0 z-30 p-[4%]"
      style={{
        width: '12.5%',
        height: '12.5%',
        transform: `translate(${pos.c * 100}%, ${pos.r * 100}%)`,
        transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform',
      }}
    >
      <PieceImg piece={{ type: segment.type, color: segment.color }} />
    </div>
  );
}

function buildMoveAnim(move) {
  const segments = [
    { type: move.promotion || move.piece, color: move.color, from: move.from, to: move.to },
  ];
  if (move.flags.includes('k') || move.flags.includes('q')) {
    const rank = move.color === 'w' ? '1' : '8';
    if (move.flags.includes('k')) {
      segments.push({ type: 'r', color: move.color, from: `h${rank}`, to: `f${rank}` });
    } else {
      segments.push({ type: 'r', color: move.color, from: `a${rank}`, to: `d${rank}` });
    }
  }
  return { id: `${Date.now()}-${Math.random()}`, segments };
}

function describeGameOver(game) {
  if (game.isCheckmate()) {
    return { icon: '👑', title: `${game.turn() === 'w' ? 'Negras' : 'Blancas'} ganan`, subtitle: '¡Jaque mate!' };
  }
  if (game.isStalemate()) return { icon: '😼', title: 'Tablas', subtitle: 'Rey ahogado (ahogado, no mate)' };
  if (game.isThreefoldRepetition()) return { icon: '🔁', title: 'Tablas', subtitle: 'Repetición de posición' };
  if (game.isInsufficientMaterial()) return { icon: '🤝', title: 'Tablas', subtitle: 'Material insuficiente' };
  if (game.isDraw()) return { icon: '🤝', title: 'Tablas', subtitle: 'Partida empatada' };
  return null;
}

function pickFallbackMove(game) {
  const moves = game.moves({ verbose: true });
  if (!moves.length) return null;
  const scored = moves
    .map((move) => ({ move, score: (move.captured ? 10 : 0) + (move.promotion ? 20 : 0) }))
    .sort((a, b) => b.score - a.score);
  const chosen = scored[0].score > 0 ? scored[0].move : moves[Math.floor(Math.random() * moves.length)];
  return { from: chosen.from, to: chosen.to, promotion: chosen.promotion || 'q' };
}

export default function CatChess({ onExit }) {
  const { ready, error, getBestMove, newGame } = useStockfish();

  const [fen, setFen] = useState(START_FEN);
  const [selected, setSelected] = useState(null);
  const [targets, setTargets] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [moveAnim, setMoveAnim] = useState(null);
  const [gameOver, setGameOver] = useState(null);
  const [vsAI, setVsAI] = useState(true);
  const [difficultyId, setDifficultyId] = useState('normal');

  const fenRef = useRef(fen);
  const aiRequestRef = useRef(null);
  const mountedRef = useRef(true);

  const prefersReduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    fenRef.current = fen;
  }, [fen]);

  const game = useMemo(() => new Chess(fen), [fen]);
  const difficulty = useMemo(
    () => DIFFICULTIES.find((d) => d.id === difficultyId) || DIFFICULTIES[1],
    [difficultyId],
  );

  useEffect(() => {
    if (!moveAnim) return undefined;
    const timer = setTimeout(() => setMoveAnim(null), 360);
    return () => clearTimeout(timer);
  }, [moveAnim]);

  const applyMove = useCallback(
    (input) => {
      const instance = new Chess(fenRef.current);
      let move;
      try {
        move = instance.move(input);
      } catch {
        return;
      }
      if (!move) return;
      fenRef.current = instance.fen();
      aiRequestRef.current = null;
      setFen(instance.fen());
      setSelected(null);
      setTargets([]);
      setLastMove({ from: move.from, to: move.to, san: move.san });
      if (!prefersReduced) setMoveAnim(buildMoveAnim(move));
      setGameOver(describeGameOver(instance));
    },
    [prefersReduced],
  );

  useEffect(() => {
    if (!vsAI || gameOver) return;
    if (game.turn() !== 'b') return;
    const key = fen;
    if (aiRequestRef.current === key) return;
    aiRequestRef.current = key;

    getBestMove(key, { movetime: difficulty.movetime, skill: difficulty.skill }).then((best) => {
      if (!mountedRef.current) return;
      const instance = new Chess(fenRef.current);
      if (instance.turn() !== 'b' || instance.fen() !== key) return;

      let input = null;
      if (best) {
        input = { from: best.slice(0, 2), to: best.slice(2, 4), promotion: best[4] || 'q' };
      }
      if (!input && (error || !ready)) input = pickFallbackMove(instance);
      if (input) applyMove(input);
    });
  }, [vsAI, gameOver, game, fen, difficulty, getBestMove, applyMove, error, ready]);

  const reset = useCallback(() => {
    fenRef.current = START_FEN;
    aiRequestRef.current = null;
    setFen(START_FEN);
    setSelected(null);
    setTargets([]);
    setLastMove(null);
    setMoveAnim(null);
    setGameOver(null);
    newGame();
  }, [newGame]);

  const onSquare = useCallback(
    (square) => {
      if (gameOver) return;
      if (vsAI && game.turn() !== 'w') return;
      if (selected) {
        const target = targets.find((t) => t.to === square);
        if (target) {
          applyMove({ from: selected, to: square, promotion: target.promotion || 'q' });
          return;
        }
      }
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelected(square);
        setTargets(game.moves({ square, verbose: true }));
      } else {
        setSelected(null);
        setTargets([]);
      }
    },
    [gameOver, vsAI, selected, targets, game, applyMove],
  );

  const checkSquare = useMemo(() => {
    if (!game.inCheck()) return null;
    const color = game.turn();
    const king = game.board().flat().find((p) => p && p.type === 'k' && p.color === color);
    return king ? king.square : null;
  }, [game]);

  const board = game.board();
  const aiTurn = vsAI && game.turn() === 'b' && !gameOver;
  const turnLabel = vsAI
    ? game.turn() === 'w'
      ? 'Tu turno (Blancas)'
      : 'IA pensando…'
    : game.turn() === 'w'
      ? 'Turno de Blancas'
      : 'Turno de Negras';

  const engineStatus = error
    ? { text: '⚠️ Motor no disponible · IA básica', tone: 'text-amber-700' }
    : !ready
      ? { text: '⏳ Cargando motor…', tone: 'text-slate-500' }
      : { text: `✅ Fuerza: ${difficulty.label}`, tone: 'text-emerald-700' };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50 font-bento-sans">
      <header className="z-10 flex w-full flex-wrap items-center justify-between gap-3 border-b border-orange-200/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
        <button
          onClick={onExit}
          className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition hover:-translate-x-0.5 hover:bg-orange-50"
        >
          ← Volver al menú
        </button>
        <h1 className="font-bento-display text-xl font-bold tracking-wide text-orange-800 sm:text-2xl md:text-3xl">
          🐱 AJEDREZ DE GATOS
        </h1>
        <div className="hidden text-sm font-semibold text-orange-700 sm:block">{turnLabel}</div>
      </header>

      <main className="flex w-full flex-1 flex-col items-center justify-center gap-6 px-3 py-5 lg:flex-row lg:items-start lg:justify-center lg:gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="chess-board relative grid grid-cols-8 overflow-hidden rounded-2xl border-4 border-orange-300/80 shadow-2xl">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const square = rcToSquare(r, c);
                const dark = (r + c) % 2 === 1;
                const isSelected = selected === square;
                const target = targets.find((t) => t.to === square);
                const isLast = lastMove && (lastMove.from === square || lastMove.to === square);
                const hidden = moveAnim && moveAnim.segments.some((s) => s.to === square);
                const isCheck = checkSquare === square;
                const isInteractive = !gameOver && (!vsAI || game.turn() === 'w');

                return (
                  <button
                    key={square}
                    type="button"
                    onClick={() => onSquare(square)}
                    aria-label={square}
                    className={`relative flex aspect-square items-center justify-center transition-colors duration-150 ${
                      dark ? 'bg-[#d9a96b]' : 'bg-[#f8ecd5]'
                    } ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {isLast && <span className="pointer-events-none absolute inset-0 bg-yellow-300/35" />}
                    {isCheck && <span className="pointer-events-none absolute inset-0 bg-red-500/45" />}

                    <div
                      className={`relative z-10 h-full w-full p-[4%] transition-transform duration-200 ${
                        isSelected ? 'scale-[1.08]' : ''
                      }`}
                      style={{ opacity: hidden ? 0 : 1 }}
                    >
                      <PieceImg piece={cell} />
                    </div>

                    {isSelected && (
                      <span className="pointer-events-none absolute inset-0 z-20 ring-4 ring-inset ring-blue-500/80" />
                    )}
                    {target && !target.captured && (
                      <span className="target-dot pointer-events-none absolute z-20 h-[26%] w-[26%] rounded-full bg-blue-600/70 shadow" />
                    )}
                    {target && target.captured && (
                      <span className="pointer-events-none absolute inset-[6%] z-20 rounded-full ring-4 ring-blue-500/80" />
                    )}

                    {c === 0 && (
                      <span className="pointer-events-none absolute left-0.5 top-0.5 text-[9px] font-bold text-black/40 sm:text-[10px]">
                        {8 - r}
                      </span>
                    )}
                    {r === 7 && (
                      <span className="pointer-events-none absolute bottom-0.5 right-0.5 text-[9px] font-bold text-black/40 sm:text-[10px]">
                        {FILES[c]}
                      </span>
                    )}
                  </button>
                );
              }),
            )}

            {moveAnim &&
              moveAnim.segments.map((segment, index) => (
                <FlyingPiece key={`${moveAnim.id}-${index}`} segment={segment} />
              ))}
          </div>

          <p className="text-xs text-orange-700/80 sm:text-sm">
            Un ajedrez simplificado para divertir a los gatitos 🐾
          </p>
        </div>

        <aside className="w-full max-w-md space-y-4 rounded-2xl border border-orange-200 bg-white/85 p-4 shadow-lg backdrop-blur lg:w-72">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-700">{turnLabel}</span>
            {aiTurn && <span className="h-3 w-3 animate-ping rounded-full bg-orange-500" />}
          </div>
          <p className={`text-xs font-medium ${engineStatus.tone}`}>{engineStatus.text}</p>

          <div className="rounded-xl bg-orange-50 p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => {
                  setVsAI(true);
                  reset();
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  vsAI ? 'bg-orange-500 text-white shadow' : 'text-orange-700 hover:bg-orange-100'
                }`}
              >
                🐱 vs IA
              </button>
              <button
                type="button"
                onClick={() => {
                  setVsAI(false);
                  reset();
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  !vsAI ? 'bg-orange-500 text-white shadow' : 'text-orange-700 hover:bg-orange-100'
                }`}
              >
                👥 2 jugadores
              </button>
            </div>
          </div>

          {vsAI && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Dificultad</p>
              <div className="grid grid-cols-2 gap-2">
                {DIFFICULTIES.map((level) => {
                  const active = level.id === difficultyId;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setDifficultyId(level.id)}
                      title={level.desc}
                      className={`flex flex-col items-center rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                        active
                          ? 'border-orange-400 bg-orange-500 text-white shadow-md'
                          : 'border-orange-200 bg-white text-orange-700 hover:-translate-y-0.5 hover:shadow'
                      }`}
                    >
                      <span className="text-lg leading-none">{level.emoji}</span>
                      <span className="mt-1">{level.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {lastMove && (
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Última jugada: <span className="font-mono font-bold text-slate-800">{lastMove.san}</span>
            </div>
          )}

          <button
            type="button"
            onClick={reset}
            className="w-full rounded-xl bg-orange-600 px-4 py-2.5 font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-orange-700"
          >
            Reiniciar partida
          </button>
        </aside>
      </main>

      {gameOver && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="animate-modal-pop w-full max-w-sm rounded-2xl border border-orange-200 bg-white p-6 text-center shadow-2xl">
            <p className="text-5xl">{gameOver.icon}</p>
            <h2 className="mt-2 text-2xl font-bold text-orange-800">{gameOver.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{gameOver.subtitle}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className="flex-1 rounded-xl bg-orange-600 px-4 py-2.5 font-semibold text-white shadow transition hover:bg-orange-700"
              >
                Jugar otra vez
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex-1 rounded-xl border border-orange-200 bg-white px-4 py-2.5 font-semibold text-orange-700 transition hover:bg-orange-50"
              >
                Menú
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
