import { useState, useEffect } from 'react';

// 1. Array con palabras de diferentes longitudes
const WORDS = ["AMOR", "BESOS", "PASION", "CORAZON", "DULCE", "Miel", "ETERNO"];

function Lovdle() {
  // Escogemos la palabra al azar y derivamos todo de ella
  const [solution] = useState(() => {
    const randomIndex = Math.floor(Math.random() * WORDS.length);
    return WORDS[randomIndex].toUpperCase();
  });

  const wordLength = solution.length; // 4, 5, 7... lo que sea.
  const [board, setBoard] = useState(Array(6).fill(""));
  const [currentRow, setCurrentRow] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isFinished) return;

    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();

      // Solo permite letras y limita por la longitud de la solución actual
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
          alert("¡Increíble! ❤️");
        } else if (currentRow < 5) {
          setCurrentRow(currentRow + 1);
        } else {
          setIsFinished(true);
          alert(`Casi... la palabra era ${solution}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, currentRow, solution, wordLength, isFinished]);

  return (
    <div className="font-dynapuff min-h-screen bg-fuchsia-50 text-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl md:text-8xl font-bold mb-10 text-fuchsia-400 drop-shadow-md">LOVDLE</h1>

      {/* Contenedor del tablero */}
      <div className="flex flex-col gap-3">
        {board.map((word, i) => (
          <Row 
            key={i} 
            word={word} 
            length={wordLength} 
            isSubmitted={i < currentRow}
            solution={solution}
          />
        ))}
      </div>
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