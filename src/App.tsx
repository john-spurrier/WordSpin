import React, { useEffect } from 'react';
import WordGame from './components/WordGame';
import Modal from 'react-modal';
import './App.css';

// Sample puzzle data
const themeWord = "ANIMALS";
const themeWords = ["CAT", "DOG", "BIRD", "FISH", "BEAR", "LION"];
const initialGrid = [
  ['C', 'A', 'T', 'D', 'O', 'G'],
  ['B', 'I', 'R', 'D', 'F', 'I'],
  ['S', 'H', 'B', 'E', 'A', 'R'],
  ['L', 'I', 'O', 'N', 'M', 'A'],
  ['P', 'E', 'N', 'G', 'U', 'I'],
  ['N', 'S', 'L', 'O', 'T', 'S']
];

function App() {
  useEffect(() => {
    Modal.setAppElement('#root');
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Word Puzzle Game</h1>
      </header>
      <main>
        <WordGame
          themeWord={themeWord}
          themeWords={themeWords}
          initialGrid={initialGrid}
        />
      </main>
    </div>
  );
}

export default App;
