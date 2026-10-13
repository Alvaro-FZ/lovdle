import { useCallback, useEffect, useRef, useState } from 'react';

const ENGINE_URL = '/stockfish/stockfish.js';
const READY_TIMEOUT_MS = 20000;

export function useStockfish() {
  const workerRef = useRef(null);
  const readyRef = useRef(false);
  const pendingRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let worker;
    let readyTimer;

    try {
      worker = new Worker(ENGINE_URL);
    } catch {
      const failTimer = setTimeout(() => setError('No se pudo iniciar el motor'), 0);
      return () => clearTimeout(failTimer);
    }

    workerRef.current = worker;

    const finishPending = (value) => {
      const resolve = pendingRef.current;
      pendingRef.current = null;
      setThinking(false);
      if (resolve) resolve(value);
    };

    const handleLine = (line) => {
      if (line === 'uciok') {
        clearTimeout(readyTimer);
        readyRef.current = true;
        setReady(true);
      } else if (line.startsWith('bestmove')) {
        const best = line.split(' ')[1];
        finishPending(best && best !== '(none)' ? best : null);
      }
    };

    worker.onmessage = (event) => {
      const payload = event.data;
      const text = typeof payload === 'string' ? payload : payload && payload.data;
      if (typeof text !== 'string') return;
      for (const raw of text.split('\n')) {
        const line = raw.trim();
        if (line) handleLine(line);
      }
    };

    worker.onerror = () => {
      setError('Error en el motor');
      finishPending(null);
    };

    readyTimer = setTimeout(() => {
      if (!readyRef.current) setError('El motor tarda demasiado en cargar');
    }, READY_TIMEOUT_MS);

    worker.postMessage('uci');

    return () => {
      clearTimeout(readyTimer);
      worker.terminate();
      workerRef.current = null;
      readyRef.current = false;
      pendingRef.current = null;
    };
  }, []);

  const getBestMove = useCallback((fen, { movetime = 800, skill = 20 } = {}) => {
    return new Promise((resolve) => {
      const worker = workerRef.current;
      if (!worker || !readyRef.current) {
        resolve(null);
        return;
      }
      if (pendingRef.current) {
        resolve(null);
        return;
      }
      pendingRef.current = resolve;
      setThinking(true);
      worker.postMessage(`setoption name UCI_LimitStrength value ${skill < 20 ? 'true' : 'false'}`);
      worker.postMessage(`setoption name Skill Level value ${skill}`);
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go movetime ${movetime}`);
    });
  }, []);

  const newGame = useCallback(() => {
    const worker = workerRef.current;
    if (worker && readyRef.current) worker.postMessage('ucinewgame');
    pendingRef.current = null;
  }, []);

  return { ready, thinking, error, getBestMove, newGame };
}
