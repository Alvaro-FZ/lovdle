import { useState, useEffect, useCallback } from 'react';
import HeartRain from './HeartRain';

// 1. NUEVA ESTRUCTURA JSON: Palabra + Imagen (en public/Lara/)
const WORDS_DATA = [
  { word: "AMORCITO", img: "IMG_20251018_125844.jpg" },
  { word: "CARACOLI", img: "IMG_20251018_125844.jpg" },
  { word: "BONITA",   img: "IMG_20251018_125844.jpg" },
  { word: "LINDA",    img: "IMG_20251018_125844.jpg" },
  { word: "PATO",     img: "IMG_20251018_125844.jpg" },
  { word: "RAYITO",   img: "IMG_20251018_125844.jpg" },
  { word: "BESITO",   img: "IMG_20251018_125844.jpg" },
  { word: "HERMOSA",  img: "IMG_20251018_125844.jpg" }
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

// --- COMPONENTE PRINCIPAL ---
export default function Lovdle() {
  const [solution, setSolution] = useState(null); // Ahora es un objeto {word, img}
  const [board, setBoard] = useState(Array(6).fill(""));
  const [currentRow, setCurrentRow] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [gameStatus, setGameStatus] = useState("playing");
  const [allDone, setAllDone] = useState(false); // Nueva detección de fin de juego

  const [lives, setLives] = useState(() => {
    const saved = localStorage.getItem('lovdle_lives');
    return saved !== null ? Number(saved) : 5;
  });

  const pickNewWord = () => {
    const usedWords = JSON.parse(localStorage.getItem('lovdle_used_words') || "[]");
    const availableWords = WORDS_DATA.filter(w => !usedWords.includes(w.word.toUpperCase()));
    
    if (availableWords.length === 0) {
      setAllDone(true); // Detectamos que ya no hay más palabras
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
      setSolution(next);
      setBoard(Array(6).fill(""));
      setCurrentRow(0);
      setIsFinished(false);
      setGameStatus("playing");
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
          <div className="flex flex-col items-center gap-6 animate-soft-float text-center px-4">
            <p className="text-4xl">🏆</p>
            <h2 className="text-3xl font-bold text-rose-600">¡HAS COMPLETADO TODO!</h2>
            <p className="text-rose-400 bg-white/80 px-6 py-3 rounded-2xl">Lara, has adivinado todas las palabras. ¡Eres la mejor!</p>
            <button onClick={() => { localStorage.setItem('lovdle_used_words', "[]"); window.location.reload(); }} className="px-8 py-4 bg-rose-500 text-white rounded-full font-bold shadow-lg">REPETIR AVENTURA ✨</button>
          </div>
        ) : lives === 0 ? (
          <div className="flex flex-col items-center gap-6 animate-soft-float">
            <p className="text-3xl font-bold text-rose-600">💔 SE ACABÓ EL AMOR</p>
            <button onClick={() => setLives(5)} className="px-8 py-4 bg-rose-500 text-white rounded-full font-bold shadow-xl">RECARGAR VIDAS ✨</button>
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

// --- COMPONENTES AUXILIARES ---

function Keyboard({ onKey, letterStatuses }) {
  const rows = [["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"], ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"], ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"]];
  const getStyle = (key) => {
    const status = letterStatuses[key];
    if (status === "correct") return "bg-pink-300 border-pink-500 text-white";
    if (status === "present") return "bg-rose-200 border-rose-300 text-white";
    if (status === "absent") return "bg-slate-200 border-slate-300 text-slate-400";
    return "bg-white border-rose-200 text-rose-400";
  };

  return (
    <div className="w-full max-w-2xl px-4 z-10 mb-4">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5 mb-2">
          {row.map((key) => (
            <button key={key} onClick={() => onKey(key)} className={`${getStyle(key)} ${key.length > 1 ? 'px-2 md:px-4 text-xs' : 'w-8 md:w-11 text-sm'} h-12 md:h-14 flex items-center justify-center font-bold rounded-xl border-2 border-b-4 transition-all active:border-b-0 active:translate-y-1 uppercase`}>
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
    empty: "bg-white border-rose-200 text-rose-300",
    correct: "bg-pink-300 border-pink-500 text-white",
    present: "bg-rose-200 border-rose-300 text-white",
    absent: "bg-slate-200 border-slate-300 text-white animate-shake",
  };
  return (
    <div className={`${styles[status]} w-10 h-14 md:w-16 md:h-20 flex items-center justify-center text-xl md:text-4xl font-bold uppercase rounded-2xl border-2 border-b-8 transition-all`}>
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
      <div className="relative bg-white rounded-3xl p-6 shadow-2xl border-4 border-rose-200 max-w-sm w-full text-center animate-modal-pop">
        <h2 className="text-3xl font-bold text-rose-600 mb-2">{isWon ? "¡Victoria!" : "¡Oh, no!"}</h2>
        
        {/* IMAGEN DE LARA (Solo si gana) */}
        {isWon && (
          <div className="my-4 overflow-hidden rounded-2xl border-4 border-rose-100 shadow-inner bg-rose-50">
            <img 
              src={`/Lara/${solution.img}`} 
              alt="Sorpresa" 
              className="w-full h-48 object-cover animate-fade-in"
              onError={(e) => { e.target.src = "https://via.placeholder.com/400?text=Falta+Imagen"; }}
            />
          </div>
        )}

        <div className="bg-rose-50 rounded-2xl p-3 mb-6 border-2 border-rose-100">
          <p className="text-xs uppercase text-rose-300 font-bold">La palabra era</p>
          <p className="text-3xl font-black text-rose-500">{solution.word}</p>
        </div>

        <button onClick={onReset} className="w-full bg-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all">
          SIGUIENTE PALABRA ✨
        </button>
      </div>
    </div>
  );
}