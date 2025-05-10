import React, { useState, useCallback, useRef } from 'react';
import './WordGrid.css';

interface WordGridProps {
  themeWord: string;
  grid: string[][];
  onWordFound: (word: string, startCell: { row: number; col: number }, endCell: { row: number; col: number }) => void;
}

const WordGrid: React.FC<WordGridProps> = ({ themeWord, grid, onWordFound }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState<{ row: number; col: number } | null>(null);
  const [endCell, setEndCell] = useState<{ row: number; col: number } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [localGrid, setLocalGrid] = useState<string[][]>(grid);
  const [rotatingCells, setRotatingCells] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);

  // Calculate which fixed 2x2 block a cell belongs to
  const getBlockCoordinates = useCallback((row: number, col: number) => {
    // Get the top-left coordinate of the 2x2 block
    const blockRow = Math.floor(row / 2) * 2;
    const blockCol = Math.floor(col / 2) * 2;
    return { blockRow, blockCol };
  }, []);

  // Rotate the fixed 2x2 block that contains the clicked cell
  const rotateBlock = useCallback((row: number, col: number) => {
    const { blockRow, blockCol } = getBlockCoordinates(row, col);
    
    // Check if the block is fully within the grid
    if (blockRow + 1 >= localGrid.length || blockCol + 1 >= localGrid[0].length) return;
    
    // Add rotating class to all cells in the block
    const quadrantCells = new Set<string>();
    for (let r = blockRow; r <= blockRow + 1; r++) {
      for (let c = blockCol; c <= blockCol + 1; c++) {
        quadrantCells.add(`${r}-${c}`);
      }
    }
    setRotatingCells(quadrantCells);
    
    const newGrid = [...localGrid.map(row => [...row])];
    const temp = newGrid[blockRow][blockCol];
    newGrid[blockRow][blockCol] = newGrid[blockRow + 1][blockCol];
    newGrid[blockRow + 1][blockCol] = newGrid[blockRow + 1][blockCol + 1];
    newGrid[blockRow + 1][blockCol + 1] = newGrid[blockRow][blockCol + 1];
    newGrid[blockRow][blockCol + 1] = temp;
    
    setLocalGrid(newGrid);
    
    // Remove rotating class after animation completes
    setTimeout(() => {
      setRotatingCells(new Set());
      setHoveredCell(null);
    }, 300);
  }, [localGrid, getBlockCoordinates]);

  const getCellFromEvent = (event: React.MouseEvent | MouseEvent) => {
    if (!gridRef.current) return null;

    const rect = gridRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const cellSize = 52; // 50px + 2px gap
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    
    if (row >= 0 && row < localGrid.length && col >= 0 && col < localGrid[0].length) {
      return { row, col };
    }
    return null;
  };

  const handleCellClick = (row: number, col: number) => {
    rotateBlock(row, col);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    const cell = getCellFromEvent(event);
    if (!cell) return;

    setIsDragging(true);
    setStartCell(cell);
    setEndCell(cell);
    setHoveredCell(null); // Clear hover state when dragging starts
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging || !startCell) return;
    
    const cell = getCellFromEvent(event);
    if (!cell) return;
    
    // Only update if the selection is horizontal or vertical
    if (cell.row === startCell.row || cell.col === startCell.col) {
      setEndCell(cell);
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (!isDragging || !startCell) return;

    const cell = getCellFromEvent(event);
    if (!cell) {
      setIsDragging(false);
      setStartCell(null);
      setEndCell(null);
      return;
    }

    // Check if the selection is horizontal or vertical
    if (startCell.row === cell.row || startCell.col === cell.col) {
      const word = getSelectedWord(startCell, cell);
      if (word) {
        onWordFound(word, startCell, cell);
      }
    }
    
    setIsDragging(false);
    setStartCell(null);
    setEndCell(null);
  };

  const handleCellHover = (row: number, col: number) => {
    setHoveredCell({ row, col });
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startCell]);

  const getSelectedWord = (start: { row: number; col: number }, end: { row: number; col: number }) => {
    let word = '';
    if (start.row === end.row) {
      // Horizontal word
      const startCol = Math.min(start.col, end.col);
      const endCol = Math.max(start.col, end.col);
      for (let col = startCol; col <= endCol; col++) {
        word += localGrid[start.row][col];
      }
    } else {
      // Vertical word
      const startRow = Math.min(start.row, end.row);
      const endRow = Math.max(start.row, end.row);
      for (let row = startRow; row <= endRow; row++) {
        word += localGrid[row][start.col];
      }
    }
    return word;
  };

  const isCellSelected = (row: number, col: number) => {
    if (!startCell || !endCell) return false;
    
    if (startCell.row === endCell.row) {
      // Horizontal selection
      return row === startCell.row && 
             col >= Math.min(startCell.col, endCell.col) && 
             col <= Math.max(startCell.col, endCell.col);
    } else if (startCell.col === endCell.col) {
      // Vertical selection
      return col === startCell.col && 
             row >= Math.min(startCell.row, endCell.row) && 
             row <= Math.max(startCell.row, endCell.row);
    }
    return false;
  };

  const isRotationPreview = (row: number, col: number) => {
    if (!hoveredCell) return false;
    
    const { blockRow, blockCol } = getBlockCoordinates(hoveredCell.row, hoveredCell.col);
    return (row === blockRow || row === blockRow + 1) &&
           (col === blockCol || col === blockCol + 1);
  };

  return (
    <div className="word-grid">
      <h2>Theme Word: {themeWord}</h2>
      <div 
        ref={gridRef}
        className="grid"
        onMouseDown={handleMouseDown}
      >
        {localGrid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${
                  isCellSelected(rowIndex, colIndex) 
                    ? 'dragging' 
                    : isRotationPreview(rowIndex, colIndex) && !isDragging
                      ? 'rotation-preview'
                      : ''
                } ${rotatingCells.has(`${rowIndex}-${colIndex}`) ? 'rotating' : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                onMouseLeave={() => !isDragging && setHoveredCell(null)}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordGrid; 