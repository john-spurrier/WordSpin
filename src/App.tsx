import { useEffect } from 'react';
import WordGame from './components/WordGame';
import Modal from 'react-modal';
import './App.css';

// Sample puzzle data
const themeWord = "ANIMALS";
const themeWords = ["CAT", "DOG", "BIRD", "FISH", "BEAR", "LION", "TIGER", "WOLF", "FROG", "SNAKE"];
const initialGrid = [
  ['B', 'C', 'T', 'D', 'O', 'G', 'W', 'F'],
  ['I', 'A', 'R', 'D', 'F', 'I', 'O', 'R'],
  ['S', 'H', 'B', 'E', 'A', 'R', 'L', 'O'],
  ['L', 'I', 'O', 'N', 'T', 'I', 'F', 'G'],
  ['P', 'E', 'N', 'G', 'U', 'I', 'N', 'S'],
  ['S', 'N', 'A', 'K', 'E', 'G', 'E', 'R'],
  ['T', 'I', 'G', 'E', 'R', 'A', 'T', 'L'],
  ['M', 'O', 'U', 'S', 'E', 'L', 'K', 'Y']
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
