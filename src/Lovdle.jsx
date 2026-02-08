import { useState, useEffect, useCallback } from 'react';
import HeartRain from './HeartRain';

const WORDS = ["CARACOLI"];

function Lovdle() {
  const [solution, setSolution] = useState("");
  const [board, setBoard] = useState(Array(6).fill(""));
  const [currentRow, setCurrentRow] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [gameStatus, setGameStatus] = useState("playing");

  const pickNewWord = () => {
    const usedWords = JSON.parse(localStorage.getItem('lovdle_used_words') || "[]");
    const availableWords = WORDS.filter(w => !usedWords.includes(w.toUpperCase()));
    if (availableWords.length === 0) {
      localStorage.setItem('lovdle_used_words', "[]");
      return WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
    }
    return availableWords[Math.floor(Math.random() * availableWords.length)].toUpperCase();
  };

  useEffect(() => { setSolution(pickNewWord()); }, []);

  const resetGame = () => {
    setSolution(pickNewWord());
    setBoard(Array(6).fill(""));
    setCurrentRow(0);
    setIsFinished(false);
    setGameStatus("playing");
  };

  // Función unificada para procesar la entrada (teclado físico y virtual)
  const onKeyAction = useCallback((key) => {
    if (isFinished || !solution) return;
    const wordLength = solution.length;

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
      if (board[currentRow] === solution) {
        setIsFinished(true);
        setGameStatus("won");
        const usedWords = JSON.parse(localStorage.getItem('lovdle_used_words') || "[]");
        if (!usedWords.includes(solution)) {
          usedWords.push(solution);
          localStorage.setItem('lovdle_used_words', JSON.stringify(usedWords));
        }
      } else if (currentRow < 5) {
        setCurrentRow(currentRow + 1);
      } else {
        setIsFinished(true);
        setGameStatus("lost");
      }
    }
  }, [board, currentRow, solution, isFinished]);

  useEffect(() => {
    const handleKeyDown = (e) => onKeyAction(e.key.toUpperCase());
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyAction]);

  // Calculamos el estado de cada letra para el teclado
  const getLetterStatuses = () => {
    const statuses = {};
    board.slice(0, currentRow).forEach((word) => {
      word.split("").forEach((letter, i) => {
        if (letter === solution[i]) statuses[letter] = "correct";
        else if (solution.includes(letter) && statuses[letter] !== "correct") statuses[letter] = "present";
        else if (!statuses[letter]) statuses[letter] = "absent";
      });
    });
    return statuses;
  };

  return (
    <div className="relative font-dynapuff min-h-screen text-rose-900 flex flex-col items-center justify-between overflow-hidden pb-8">
      <HeartRain />
      
      <div className="w-full flex flex-col items-center">
        <header className="w-full flex items-center justify-center bg-rose-100 py-2 mb-6 shadow-sm z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-rose-500 tracking-wide">LOVDLE</h1>
        </header>

        <div className="flex flex-col gap-3 mb-6">
          {board.map((word, i) => (
            <Row key={i} word={word} length={solution.length || 0} isSubmitted={i < currentRow || (i === currentRow && isFinished)} solution={solution} />
          ))}
        </div>

        {isFinished && (
          <div className="flex flex-col items-center gap-4 animate-soft-float mb-6">
            <p className="text-xl font-bold text-rose-600 bg-white/80 px-4 py-2 rounded-full shadow-sm">
              {gameStatus === "won" ? "¡Palabra acertada! ❤️" : `La palabra era: ${solution}`}
            </p>
            <button onClick={resetGame} className="bg-rose-400 hover:bg-rose-50 text-white hover:text-rose-400 px-8 py-3 rounded-full font-bold text-lg shadow-lg border-b-4 border-rose-600 active:border-b-0 active:translate-y-1 transition-all">
              JUGAR DE NUEVO ✨
            </button>
          </div>
        )}
      </div>

      <Keyboard onKey={onKeyAction} letterStatuses={getLetterStatuses()} />
    </div>
  );
}

function Keyboard({ onKey, letterStatuses }) {
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"]
  ];

  // 1. Actualizamos los estilos para incluir el 'ring' (anillo)
  // Usamos los mismos colores que en el componente Cell
  const getStyle = (key) => {
    const status = letterStatuses[key];
    if (status === "correct") return "bg-pink-300 border-pink-500 ring-pink-200 text-white";
    if (status === "present") return "bg-rose-200 border-rose-300 ring-rose-100 text-white";
    if (status === "absent") return "bg-slate-200 border-slate-300 ring-slate-100 text-slate-400";
    // Estado por defecto (tecla no usada)
    return "bg-white border-rose-200 ring-rose-100 text-rose-400 hover:bg-rose-50";
  };

  return (
    // Añadí un poco más de padding horizontal (px-4) al contenedor
    <div className="w-full max-w-2xl px-4 z-10 mb-4">
      {rows.map((row, i) => (
        // Aumenté ligeramente el gap entre teclas
        <div key={i} className="flex justify-center gap-1.5 mb-2">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKey(key)}
              className={`
                /* Aplicamos los colores dinámicos (bg, border, ring, text) */
                ${getStyle(key)}
                
                /* Tamaños adaptativos */
                ${key.length > 1 ? 'px-2 md:px-4 text-xs' : 'w-8 md:w-11 text-sm'}
                h-12 md:h-14 
                
                /* Flex y Tipografía */
                flex items-center justify-center font-bold uppercase font-winky
                
                /* --- ESTRUCTURA 3D TIPO "FICHA" --- */
                rounded-xl      /* Bordes redondeados */
                border-2        /* Borde fino alrededor */
                border-b-4      /* Profundidad inferior (la "sombra" de la tecla) */
                ring-2          /* El anillo exterior (más fino que en las celdas grandes) */
                
                /* Animación al pulsar */
                transition-all
                active:border-b-0 
                active:translate-y-1 
                active:ring-0   /* El anillo desaparece al hundir la tecla */
              `}
            >
              {key === "BACKSPACE" ? "⌫" : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ... Mantén tus componentes Row y Cell igual que en tu código original ...
function Row({ word, length, isSubmitted, solution }) {
  const cells = Array(length).fill("");
  return (
    <div className="flex gap-2 md:gap-3 justify-center">
      {cells.map((_, i) => {
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
  const currentStyle = styles[status] || styles.empty;
  return (
    <div className={`${currentStyle} w-10 h-14 md:w-16 md:h-20 flex items-center justify-center text-xl md:text-4xl font-bold uppercase font-winky rounded-2xl border-2 border-b-8 ring-4 transition-all duration-150 ${letter && status === "empty" ? "scale-105 border-b-4 translate-y-1 text-gray-800 ring-fuchsia-200" : ""}`}>
      {letter}
    </div>
  );
}

export default Lovdle;