import { useState } from 'react';
import HeartRain from './HeartRain';
import { GAMES } from './games';

export default function App() {
  const [activeId, setActiveId] = useState(null);
  const active = GAMES.find((game) => game.id === activeId);

  if (active) {
    const Game = active.component;
    return <Game key={active.id} onExit={() => setActiveId(null)} />;
  }

  return (
    <div className="relative font-bento-sans min-h-screen text-slate-900 flex flex-col items-center justify-between overflow-hidden pb-10 bg-[#FFF5E6]">
      <HeartRain />
      <header className="w-full flex items-center justify-center bg-white/90 backdrop-blur-sm py-3 mb-8 shadow-sm border-b border-slate-200/60 z-10">
        <h1 className="text-2xl md:text-3xl font-bento-display font-bold text-slate-900 tracking-wide">LOVDLE</h1>
      </header>

      <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center gap-10 flex-1">
        <div className="text-center space-y-2 animate-soft-float">
          <p className="text-4xl">🕹️</p>
          <h2 className="text-3xl md:text-4xl font-bento-display font-bold text-slate-900">ELIGE UN MINIJUEGO</h2>
          <p className="text-slate-600 text-lg">Cada juego esconde algo especial para ti</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveId(game.id)}
              className="group text-left bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/20 cursor-pointer flex flex-col gap-3"
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-sm border border-white/40"
                style={{ backgroundImage: game.gradient }}
              >
                {game.emoji}
              </div>

              <h3 className="text-2xl font-bento-display font-bold text-slate-900">{game.title}</h3>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{game.tagline}</p>
              <p className="text-sm text-slate-700 leading-relaxed flex-1">{game.description}</p>

              <span
                className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold text-sm shadow-sm transition-all hover:opacity-95 active:scale-[0.995]"
                style={{ backgroundImage: game.gradient }}
              >
                JUGAR<span className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-500">Pronto llegarán más minijuegos 💞</p>
      </div>
    </div>
  );
}