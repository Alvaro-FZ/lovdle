import { useState, useEffect } from 'react';
import HeartRain from './HeartRain';

const WORDS = ["CARACOLI", "LARITA"];

function Lovdle() {
  const [solution, setSolution] = useState("");
  const [board, setBoard] = useState(Array(6).fill(""));
  const [currentRow, setCurrentRow] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [gameStatus, setGameStatus] = useState("playing"); // "playing", "won", "lost"

  // Función para elegir una palabra que no haya sido acertada
  const pickNewWord = () => {
    const usedWords = JSON.parse(localStorage.getItem('lovdle_used_words') || "[]");

    // Filtramos las palabras que NO están en la lista de usadas
    const availableWords = WORDS.filter(w => !usedWords.includes(w.toUpperCase()));

    if (availableWords.length === 0) {
      alert("¡Increíble! Te has pasado todas las palabras. Limpiando historial...");
      localStorage.setItem('lovdle_used_words', "[]");
      return WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
    }

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    return availableWords[randomIndex].toUpperCase();
  };

  // Inicializar el juego
  useEffect(() => {
    setSolution(pickNewWord());
  }, []);

  const resetGame = () => {
    setSolution(pickNewWord());
    setBoard(Array(6).fill(""));
    setCurrentRow(0);
    setIsFinished(false);
    setGameStatus("playing");
  };

  const saveWin = (word) => {
    const usedWords = JSON.parse(localStorage.getItem('lovdle_used_words') || "[]");
    if (!usedWords.includes(word)) {
      usedWords.push(word);
      localStorage.setItem('lovdle_used_words', JSON.stringify(usedWords));
    }
  };

  useEffect(() => {
    if (isFinished || !solution) return;

    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      const wordLength = solution.length;

      if (/^[A-ZÑ]$/.test(key) && board[currentRow].length < wordLength) {
        const newBoard = [...board];
        newBoard[currentRow] += key;
        setBoard(newBoard);
      }

      if (e.key === 'Backspace') {
        const newBoard = [...board];
        newBoard[currentRow] = newBoard[currentRow].slice(0, -1);
        setBoard(newBoard);
      }

      if (e.key === 'Enter' && board[currentRow].length === wordLength) {
        if (board[currentRow] === solution) {
          setIsFinished(true);
          setGameStatus("won");
          saveWin(solution);
        } else if (currentRow < 5) {
          setCurrentRow(currentRow + 1);
        } else {
          setIsFinished(true);
          setGameStatus("lost");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, currentRow, solution, isFinished]);

  return (
    <div className="relative font-dynapuff min-h-screen text-rose-900 flex flex-col items-center justify-start overflow-hidden px-4 sm:px-6">      <HeartRain />
      <header className="w-full flex items-center justify-center bg-rose-100 py-3 sm:py-4 mb-4 sm:mb-6 shadow-sm z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-rose-500 tracking-wide">LOVDLE</h1>
      </header>

      {/* Tablero y controles */}
      <div className="flex flex-col gap-2 sm:gap-3 mb-6 sm:mb-10">
        {board.map((word, i) => (
          <Row
            key={i}
            word={word}
            length={solution.length || 0}
            // CAMBIO: Si la fila ya pasó, O si es la fila actual y ya terminó el juego
            isSubmitted={i < currentRow || (i === currentRow && isFinished)}
            solution={solution}
          />
        ))}
      </div>

      {/* Botón de Jugar de Nuevo (Solo aparece al terminar) */}
      {isFinished && (
        <div className="flex flex-col items-center gap-4 animate-soft-float px-4">
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-rose-600 text-center leading-relaxed">
            {gameStatus === "won" ? "¡Palabra acertada! ❤️" : `La palabra era: ${solution}`}
          </p>
          <button
            onClick={resetGame}
            className="group relative flex items-center gap-2 bg-rose-400 hover:bg-rose-500 active:bg-rose-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl shadow-lg transition-all active:scale-95 touch-manipulation"
          >
            JUGAR DE NUEVO
            <span className="text-xl sm:text-2xl group-hover:animate-pulse">✨</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ word, length, isSubmitted, solution }) {
  // Creamos un array vacío con la longitud exacta de la palabra elegida
  const cells = Array(length).fill("");

  return (
    <div className="flex gap-1 sm:gap-2 md:gap-3 justify-center">
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
  // Añadimos colores para el borde extra (ring) en cada estado
  const styles = {
    empty: "bg-white border-rose-200 ring-rose-100 text-rose-300",
    correct: "bg-pink-300 border-pink-500 ring-pink-200 text-white",
    present: "bg-rose-200 border-rose-300 ring-rose-100 text-white",
    absent: "bg-slate-200 border-slate-300 ring-slate-100 text-white animate-shake",
  };

  const currentStyle = styles[status] || styles.empty;

  return (
    <div className={`
      /* Tamaño dinámico y responsivo */
      w-10 h-12 
      xs:w-11 xs:h-14
      sm:w-12 sm:h-16 
      md:w-14 md:h-16
      lg:w-16 lg:h-18
      flex items-center justify-center
      text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase font-winky
      
      /* Aplicación de Estilos */
      ${currentStyle}
      
      /* Bordes y Profundidad responsivos */
      rounded-xl sm:rounded-2xl
      border border-2 sm:border-2       /* Borde lateral y superior */
      border-b-4 sm:border-b-6 md:border-b-8     /* El "suelo" de la tecla */
      ring-2 sm:ring-3 md:ring-4         /* Borde extra exterior */
      
      /* Animaciones y Transiciones */
      transition-all duration-150
      ${letter && status === "empty" ? "scale-105 border-b-2 sm:border-b-4 translate-y-0.5 sm:translate-y-1 text-gray-800 ring-fuchsia-200" : ""}
    `}>
      {letter}
    </div>
  );
}

export default Lovdle;