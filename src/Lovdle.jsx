import { useState } from 'react';

function Lovdle() {
  const [board, setBoard] = useState(Array(6).fill(""));
  const [currentRow, setCurrentRow] = useState(0);
  const solution = "AMOR";

  return (
    
    <div className="font-fredoka min-h-screen bg-fuchsia-50 text-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-9xl font-semibold mb-8">LOVDLE</h1>

      {/* Tablero */}
      <div className="grid grid-rows-6 gap-2">
        {board.map((row, i) => (
          <Row key={i} word={row} />
        ))}
      </div>
    </div>
  );
}

function Row({ word }) {
  // Suponiendo palabras de 5 letras
  const cells = Array(5).fill(""); 
  
  return (
    <div className="grid grid-cols-5 gap-2 mb-5">
      {cells.map((_, i) => (
        <div key={i} className="w-19 h-19 border-2 border-slate-700 flex items-center justify-center text-2xl font-bold uppercase">
          {word[i] || ""}
        </div>
      ))}
    </div>
  );
}

export default Lovdle;