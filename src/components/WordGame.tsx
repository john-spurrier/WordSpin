import React, { useState, useEffect, useRef } from 'react';
import WordGrid from './WordGrid';
import Confetti from 'react-confetti';
import Modal from 'react-modal';
import './WordGame.css';

interface WordGameProps {
  themeWord: string;
  themeWords: string[];
  initialGrid: string[][];
}

interface AnimatedWord {
  word: string;
  id: number;
  position: { x: number; y: number; width: number; height: number };
}

const WordGame: React.FC<WordGameProps> = ({ themeWord, themeWords, initialGrid }) => {
  const [grid, setGrid] = useState<string[][]>(initialGrid);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [animatedWords, setAnimatedWords] = useState<AnimatedWord[]>([]);
  const [showTutorial, setShowTutorial] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const gridRef = useRef<HTMLDivElement>(null);
  const nextWordId = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleWordFound = (word: string, startCell: { row: number; col: number }, endCell: { row: number; col: number }) => {
    if (themeWords.includes(word) && !foundWords.includes(word)) {
      // Calculate the starting position and dimensions based on the selected cells
      const gridRect = gridRef.current?.getBoundingClientRect();
      if (!gridRect) return;

      const cellSize = 52; // 50px + 2px gap
      const gridPadding = 8; // Grid padding from WordGrid.css
      const isHorizontal = startCell.row === endCell.row;
      
      // Calculate the position and size of the word
      const startX = Math.min(startCell.col, endCell.col) * cellSize + gridPadding;
      const startY = Math.min(startCell.row, endCell.row) * cellSize + gridPadding;
      const width = isHorizontal 
        ? (Math.abs(endCell.col - startCell.col) + 1) * cellSize - 2 // Subtract 2px for the gap
        : cellSize - 2;
      const height = isHorizontal
        ? cellSize - 2
        : (Math.abs(endCell.row - startCell.row) + 1) * cellSize - 2;

      const newAnimatedWord: AnimatedWord = {
        word,
        id: nextWordId.current++,
        position: { 
          x: startX + gridRect.left,
          y: startY + gridRect.top,
          width,
          height
        }
      };

      setAnimatedWords(prev => [...prev, newAnimatedWord]);

      // Remove the animation after it completes
      setTimeout(() => {
        setAnimatedWords(prev => prev.filter(w => w.id !== newAnimatedWord.id));
        setFoundWords(prev => [...prev, word]);
      }, 1000);
    }
  };

  useEffect(() => {
    if (foundWords.length === themeWords.length) {
      setGameComplete(true);
    }
  }, [foundWords, themeWords]);

  return (
    <div className="word-game">
      {gameComplete && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      <div ref={gridRef} className="grid-container">
        <WordGrid
          themeWord={themeWord}
          grid={grid}
          onWordFound={handleWordFound}
        />
      </div>
      <div className="game-info">
        <h3>Found Words: {foundWords.length}/{themeWords.length}</h3>
        <ul className="found-words-list">
          {themeWords.map((word, index) => (
            <li key={index} className={foundWords.includes(word) ? 'found' : 'not-found'}>
              {foundWords.includes(word) ? word : '???'}
            </li>
          ))}
        </ul>
        {gameComplete && (
          <div className="game-complete">
            <h2>🎉 Congratulations! You've found all the words! 🎉</h2>
            <p>You've successfully completed the puzzle!</p>
          </div>
        )}
      </div>
      {animatedWords.map(({ word, id, position }) => (
        <div
          key={id}
          className="animated-word"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${position.width}px`,
            height: `${position.height}px`,
          }}
        >
          {word}
        </div>
      ))}
      <Modal
        isOpen={showTutorial}
        onRequestClose={() => setShowTutorial(false)}
        className="tutorial-modal"
        overlayClassName="tutorial-overlay"
      >
        <div className="tutorial-content">
          <h2>How to Play</h2>
          <div className="tutorial-steps">
            <p>1. Find words by clicking and dragging across letters in a straight line (horizontally or vertically)</p>
            <p>2. Click on any cell to rotate its fixed 2x2 block</p>
            <p>3. Each 2x2 block rotates as a unit (clockwise)</p>
            <p>4. Find all the theme words to win!</p>
            <p>5. The theme word for this puzzle is: <strong>{themeWord}</strong></p>
          </div>
          <button onClick={() => setShowTutorial(false)}>Got it!</button>
        </div>
      </Modal>
    </div>
  );
};

export default WordGame; 