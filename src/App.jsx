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
    <div className="relative font-dynapuff min-h-screen text-rose-900 flex flex-col items-center justify-between overflow-hidden pb-10">
      <HeartRain />
      <header className="w-full flex items-center justify-center bg-rose-100/80 backdrop-blur-sm py-2 mb-8 shadow-sm z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-rose-500 tracking-wide">LOVDLE</h1>
      </header>

      <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center gap-10 flex-1">
        <div className="text-center space-y-2 animate-soft-float">
          <p className="text-4xl">🕹️</p>
          <h2 className="text-3xl md:text-4xl font-bold text-rose-600">ELIGE UN MINIJUEGO</h2>
          <p className="text-rose-400 font-winky text-lg">Cada juego esconde algo especial para ti</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveId(game.id)}
              className="group text-left bg-white/80 backdrop-blur-sm border-2 border-rose-100 rounded-3xl p-6 shadow-lg shadow-rose-100/60 transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl hover:border-rose-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 cursor-pointer flex flex-col gap-3"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md border-4 border-white"
                style={{ backgroundImage: game.gradient }}
              >
                {game.emoji}
              </div>

              <h3 className="text-2xl font-bold text-rose-500">{game.title}</h3>
              <p className="text-xs uppercase tracking-wider text-rose-400 font-bold">{game.tagline}</p>
              <p className="text-sm text-rose-700/80 font-winky leading-relaxed flex-1">{game.description}</p>

              <span
                className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white font-bold text-sm shadow-md border-b-4 border-rose-700 transition-all group-active:border-b-0 group-active:translate-y-1"
                style={{ backgroundImage: game.gradient }}
              >
                JUGAR<span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-rose-300 font-winky">Pronto llegarán más minijuegos 💞</p>
      </div>
    </div>
  );
}