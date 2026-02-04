import { useState, useEffect } from 'react';

const WORDS = ["AMOR", "BESOS", "PASION", "CORAZON", "CARACOLI", "DULCE", "MIEL", "ETERNO", "CARIÑO", "POESIA"];

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
    <div className="font-dynapuff min-h-screen bg-fuchsia-50 text-gray-900 flex flex-col items-center justify-start">
      {/* Header compacto */}
      <header className="w-full flex items-center justify-center bg-fuchsia-100 py-2 mb-22 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-fuchsia-500 tracking-wide">LOVDLE</h1>
      </header>

      {/* Tablero y controles */}
      <div className="flex flex-col gap-3 mb-10">
        {board.map((word, i) => (
          <Row
            key={i}
            word={word}
            length={solution.length || 0}
            isSubmitted={i < currentRow}
            solution={solution}
          />
        ))}
      </div>

      {/* Botón de Jugar de Nuevo (Solo aparece al terminar) */}
      {isFinished && (
        <div className="flex flex-col items-center gap-4 animate-bounce">
          <p className="text-2xl font-bold text-fuchsia-600">
            {gameStatus === "won" ? "¡Palabra acertada! ❤️" : `La palabra era: ${solution}`}
          </p>
          <button
            onClick={resetGame}
            className="group relative flex items-center gap-2 bg-fuchsia-400 hover:bg-fuchsia-500 text-white px-8 py-4 rounded-full font-bold text-xl shadow-lg transition-all active:scale-95"
          >
            JUGAR DE NUEVO
            <span className="text-2xl group-hover:animate-pulse">✨</span>
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
  // Añadimos colores para el borde extra (ring) en cada estado
  const styles = {
    empty: "bg-white border-slate-300 ring-slate-200 text-gray-400",
    correct: "bg-green-400 border-green-600 ring-green-200 text-white",
    present: "bg-yellow-400 border-yellow-600 ring-yellow-200 text-white",
    absent: "bg-slate-400 border-slate-500 ring-slate-300 text-white",
  };

  const currentStyle = styles[status] || styles.empty;

  return (
    <div className={`
      /* Tamaño dinámico */
      w-12 h-16 md:w-16 md:h-20 
      flex items-center justify-center
      text-2xl md:text-4xl font-bold uppercase font-winky
      
      /* Aplicación de Estilos */
      ${currentStyle}
      
      /* Bordes y Profundidad */
      rounded-2xl 
      border-2       /* Borde lateral y superior fino */
      border-b-8     /* El "suelo" de la tecla (profundidad) */
      ring-4         /* ESTE ES EL BORDE EXTRA EXTERIOR */
      
      /* Animaciones y Transiciones */
      transition-all duration-150
      ${letter && status === "empty" ? "scale-105 border-b-4 translate-y-1 text-gray-800 ring-fuchsia-200" : ""}
    `}>
      {letter}
    </div>
  );
}

export default Lovdle;