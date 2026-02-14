import { useState, useEffect, useCallback } from 'react';
import HeartRain from './HeartRain';

// 1. JSON DE PALABRAS E IMÁGENES
const WORDS_DATA = [
  { word: "AMORCITO", img: "amorcito.jpg", objectPosition: 'center 13%', descripcion: "El día que fuimos a ver las luces de navidad" },
  { word: "CARACOLI", img: "caracoli.jpg", objectPosition: 'center 100%', descripcion: "Tu madre nos estaba mirando intensamente" },
  { word: "BONITA",   img: "bonita.jpg", objectPosition: 'center 80%', descripcion: "En el museo de aviación" },
  { word: "LINDA",    img: "linda.jpg", objectPosition: 'center 40%', descripcion: "Que bonitos" },
  { word: "PATO",     img: "pato.jpeg", objectPosition: 'center 10%', descripcion: "¡Nuestra primera foto juntos!" },
  { word: "RAYITO",   img: "rayito.jpg", objectPosition: 'center 20%', descripcion: "Este día Juanma se rió de mí" },
  { word: "BESITO",   img: "besito.jpg", objectPosition: 'center 70%', descripcion: "Saliendo de mear :3" },
  { word: "HERMOSA",  img: "hermosa.jpg", objectPosition: 'center 20%', descripcion: "La chica más hermosa del mundo 🩵" },
  { word: "NIEVE", img: "nieve.jpg", objectPosition: 'center 10%', descripcion: "Tenía las patas congeladas 🥶" },
];

// --- SUBCOMPONENTE: CORAZÓN DE VIDA ---
function HeartLife({ isLost }) {
  const heartSvg = (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.32" className="w-full h-full">
      <path d="M15.7,5.33a4.45,4.45,0,0,0-3.72,2A4.47,4.47,0,0,0,3.79,9.79c0,6.7,8.19,8.93,8.19,8.93s8.18-2.23,8.18-8.93A4.46,4.46,0,0,0,15.7,5.33Z" />
    </svg>
  );

  return (
    <div className={`relative w-8 h-8 md:w-10 md:h-10 ${isLost ? 'text-gray-300' : 'text-red-500'}`}>
      {!isLost ? <div className="transition-transform duration-300">{heartSvg}</div> : (
        <div className="absolute inset-0">
          <div className="absolute inset-0 animate-break-left" style={{ clipPath: 'inset(0 50% 0 0)' }}>{heartSvg}</div>
          <div className="absolute inset-0 animate-break-right" style={{ clipPath: 'inset(0 0 0 50%)' }}>{heartSvg}</div>
        </div>
      )}
    </div>
  );
}

export default function Lovdle() {
  const [solution, setSolution] = useState(null);
  const [board, setBoard] = useState(Array(6).fill(""));
  const [currentRow, setCurrentRow] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [gameStatus, setGameStatus] = useState("playing");
  const [allDone, setAllDone] = useState(false);

  const [lives, setLives] = useState(() => {
    const saved = localStorage.getItem('lovdle_lives');
    return saved !== null ? Number(saved) : 5;
  });

  const pickNewWord = () => {
    const usedWords = JSON.parse(localStorage.getItem('lovdle_used_words') || "[]");
    const availableWords = WORDS_DATA.filter(w => !usedWords.includes(w.word.toUpperCase()));
    
    if (availableWords.length === 0) {
      setAllDone(true);
      return null;
    }
    
    const randomObj = availableWords[Math.floor(Math.random() * availableWords.length)];
    return { ...randomObj, word: randomObj.word.toUpperCase() };
  };

  useEffect(() => { 
    const word = pickNewWord();
    if (word) setSolution(word);
  }, []);

  useEffect(() => { localStorage.setItem('lovdle_lives', lives); }, [lives]);

  const resetGame = () => {
    if (lives <= 0) return;
    
    const next = pickNewWord();
    
    if (next) {
      // Si hay una palabra siguiente, reseteamos el tablero normalmente
      setSolution(next);
      setBoard(Array(6).fill(""));
      setCurrentRow(0);
      setIsFinished(false);
      setGameStatus("playing");
    } else {
      // SI NO HAY MÁS PALABRAS:
      // Simplemente cerramos el modal. 
      // Como pickNewWord ya ejecutó setAllDone(true), 
      // al cerrarse el modal se verá la pantalla de felicitación.
      setIsFinished(false);
    }
  };

  const onKeyAction = useCallback((key) => {
    if (isFinished || lives <= 0 || !solution || allDone) return;
    const wordLength = solution.word.length;

    if (/^[A-ZÑ]$/.test(key) && board[currentRow].length < wordLength) {
      const newBoard = [...board];
      newBoard[currentRow] += key;
      setBoard(newBoard);
    }

    if (key === 'BACKSPACE' || key === 'DELETE') {
      const newBoard = [...board];
      newBoard[currentRow] = newBoard[currentRow].slice(0, -1);
      setBoard(newBoard);
    }

    if (key === 'ENTER' && board[currentRow].length === wordLength) {
      if (board[currentRow] === solution.word) {
        setIsFinished(true);
        setGameStatus("won");
        const usedWords = JSON.parse(localStorage.getItem('lovdle_used_words') || "[]");
        if (!usedWords.includes(solution.word)) {
          usedWords.push(solution.word);
          localStorage.setItem('lovdle_used_words', JSON.stringify(usedWords));
        }
      } else if (currentRow < 5) {
        setCurrentRow(currentRow + 1);
      } else {
        setIsFinished(true);
        setGameStatus("lost");
        setLives(prev => Math.max(0, prev - 1));
      }
    }
  }, [board, currentRow, solution, isFinished, lives, allDone]);

  useEffect(() => {
    const handleKeyDown = (e) => onKeyAction(e.key.toUpperCase());
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyAction]);

  const getLetterStatuses = () => {
    if (!solution) return {};
    const statuses = {};
    board.slice(0, currentRow).forEach((word) => {
      word.split("").forEach((letter, i) => {
        if (letter === solution.word[i]) statuses[letter] = "correct";
        else if (solution.word.includes(letter) && statuses[letter] !== "correct") statuses[letter] = "present";
        else if (!statuses[letter]) statuses[letter] = "absent";
      });
    });
    return statuses;
  };

  return (
    <div className="relative font-dynapuff min-h-screen text-rose-900 flex flex-col items-center justify-between overflow-hidden pb-8">
      <HeartRain />
      <header className="w-full flex items-center justify-center bg-rose-100/80 backdrop-blur-sm py-2 mb-6 shadow-sm z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-rose-500 tracking-wide">LOVDLE</h1>
      </header>

      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {allDone ? (
          <div className="flex flex-col items-center gap-6 text-center px-4 animate-soft-float max-w-lg">
            <p className="text-4xl">🏆</p>
            <h2 className="text-3xl font-bold text-rose-600">¡AVENTURA COMPLETADA!</h2>

            {/* CONTENEDOR DE PÁRRAFOS: Aquí controlas el espacio entre ellos con gap-3 */}
            <div className="flex flex-col gap-3 font-winky bg-white/80 px-6 py-8 rounded-3xl border border-rose-100 text-rose-700 leading-relaxed">
              <p className="font-bold text-xl text-rose-500">¡Holi Caracoli!</p>

              <p>
                De Álvaro para Lara, con todo mi amor.
              </p>

              <p>
                Has adivinado todas y cada una de las palabras. Cada letra que has puesto
                demuestra lo mucho que me quieres.
              </p>

              <p>
                Me ha encantado pasar todo este tiempo junto a tí y deseo que me quede mucho más tiempo a tu lado.
                Este pequeño juego es solo una forma de recordarte que eres la persona
                más especial de mi mundo. ¡Te amo muchísimo! 🩵
              </p>

              <p className="text-sm italic text-rose-400">
                Pd: Ahora puedes abrir el otro regalo.
              </p>
            </div>

            <button
              onClick={() => { localStorage.setItem('lovdle_used_words', "[]"); window.location.reload(); }}
              className="px-8 py-4 bg-rose-500 text-white rounded-full font-bold shadow-lg border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all"
            >
              REINICIAR TODO ✨
            </button>
          </div>
        ) : lives === 0 ? (
          <div className="flex flex-col items-center gap-6 animate-soft-float">
            <p className="text-3xl font-bold text-rose-600">💔 SE ACABÓ EL AMOR</p>
            <button onClick={() => setLives(5)} className="px-8 py-4 bg-rose-500 text-white rounded-full font-bold shadow-xl border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all">RECARGAR VIDAS ✨</button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-6">
              {board.map((word, i) => (
                <Row key={i} word={word} length={solution?.word.length || 0} isSubmitted={i < currentRow || (i === currentRow && isFinished)} solution={solution?.word} />
              ))}
            </div>
            <div className="flex gap-1.5 bg-white/30 p-2 rounded-full backdrop-blur-sm mb-6 border border-white/20 shadow-sm z-10">
              {[...Array(5)].map((_, i) => <HeartLife key={i} isLost={i >= lives} />)}
            </div>
          </>
        )}
      </div>

      {!allDone && lives > 0 && <Keyboard onKey={onKeyAction} letterStatuses={getLetterStatuses()} />}

      <ResultModal isOpen={isFinished} status={gameStatus} solution={solution} onReset={resetGame} />
    </div>
  );
}

// --- COMPONENTES AUXILIARES (CON ESTILOS ORIGINALES RECUPERADOS) ---

function Keyboard({ onKey, letterStatuses }) {
  const rows = [["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"], ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"], ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"]];
  const getStyle = (key) => {
    const status = letterStatuses[key];
    if (status === "correct") return "bg-pink-300 border-pink-500 ring-pink-200 text-white";
    if (status === "present") return "bg-rose-200 border-rose-300 ring-rose-100 text-white";
    if (status === "absent") return "bg-slate-200 border-slate-300 ring-slate-100 text-slate-400";
    return "bg-white border-rose-200 ring-rose-100 text-rose-400";
  };

  return (
    <div className="w-full max-w-2xl px-4 z-10 mb-4">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5 mb-2">
          {row.map((key) => (
            <button key={key} onClick={() => onKey(key)} className={`${getStyle(key)} ${key.length > 1 ? 'px-2 md:px-4 text-xs' : 'w-8 md:w-11 text-sm'} h-12 md:h-14 flex items-center justify-center font-bold rounded-xl border-2 border-b-4 ring-2 transition-all active:border-b-0 active:translate-y-1 active:ring-0 uppercase`}>
              {key === "BACKSPACE" ? "⌫" : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function Row({ word, length, isSubmitted, solution }) {
  return (
    <div className="flex gap-2 md:gap-3 justify-center">
      {Array(length).fill("").map((_, i) => {
        const letter = word[i] || "";
        let status = "empty";
        if (isSubmitted) {
          if (letter === solution[i]) status = "correct";
          else if (solution.includes(letter)) status = "present";
          else status = "absent";
        }
        return <Cell key={i} letter={letter} status={status} />;
      })}
    </div>
  );
}

function Cell({ letter, status }) {
  const styles = {
    empty: "bg-white border-rose-200 ring-rose-100 text-rose-300",
    correct: "bg-pink-300 border-pink-500 ring-pink-200 text-white",
    present: "bg-rose-200 border-rose-300 ring-rose-100 text-white",
    absent: "bg-slate-200 border-slate-300 ring-slate-100 text-white animate-shake",
  };
  return (
    <div className={`${styles[status]} w-10 h-14 md:w-16 md:h-20 flex items-center justify-center text-xl md:text-4xl font-bold uppercase font-winky rounded-2xl border-2 border-b-8 ring-4 transition-all duration-150`}>
      {letter}
    </div>
  );
}

function ResultModal({ isOpen, status, solution, onReset }) {
  if (!isOpen || !solution) return null;
  const isWon = status === "won";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-rose-900/40 backdrop-blur-md" />
      
      {/* 1. Ampliado de max-w-sm a max-w-md para que el modal sea más espacioso */}
      <div className="relative bg-white rounded-3xl p-6 shadow-2xl border-4 border-rose-200 max-w-md w-full text-center animate-modal-pop">
        <h2 className="text-3xl font-bold text-rose-600 mb-2">{isWon ? "¡Victoria!" : "¡Oh, no!"}</h2>
        
        {isWon && (
          /* 2. Aumentado de h-48 (12rem) a h-[28rem] (unos 450px) para ver mucha más imagen */
          <div className="my-4 overflow-hidden rounded-2xl border-4 border-rose-100 shadow-inner bg-rose-50 h-[28rem]">
            <img 
              src={`/Lara/${solution.img}`} 
              alt="Sorpresa" 
              className="w-full h-full object-cover"
              /* 3. Ajuste vertical: usa 'center 20%' si quieres que se vea más la parte de arriba */
              style={{ objectPosition: solution.objectPosition }} 
              onError={(e) => { e.target.src = "https://via.placeholder.com/400?text=Imagen+No+Encontrada"; }}
            />
          </div>
        )}

        {/* Mantenemos tu estilo font-winky original */}
        <div className="bg-rose-50 rounded-2xl p-3 border-2 border-rose-100 font-winky">
          <p className="text-xs uppercase text-rose-300 font-bold">La palabra era</p>
          <p className="text-3xl font-black text-rose-500">{solution.word}</p>
        </div>
          <p className="text-s uppercase text-rose-500 font-bold mb-6">{solution.descripcion}</p>

        <button onClick={onReset} className="w-full bg-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all text-xl">
          SIGUIENTE PALABRA ✨
        </button>
      </div>
    </div>
  );
}