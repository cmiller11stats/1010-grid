import "./App.css";
import { useEffect, useState, useRef } from "react";

// Pieces definitions
const pieces = [
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1],
    [1, 1],
  ],
  [
    [1, 1],
    [1, 0],
  ],
  [
    [1, 1],
    [0, 1],
  ],
  [
    [1, 0],
    [1, 1],
  ],
];

function App() {
  const [pieceCoordinates, setPieceCoordinates] = useState({ x: -1, y: -1 });
  const [hoveredGridLocation, setHoveredGridLocation] = useState({
    row: -1,
    col: -1,
  });
  const [headerDimensions, setHeaderDimensions] = useState({
    width: -1,
    height: -1,
    x: -1,
    y: -1,
  });
  const [gridDimensions, setGridDimensions] = useState({
    width: -1,
    height: -1,
    x: -1,
    y: -1,
  });
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [dragOffset, setDragOffset] = useState({ row: 0, col: 0 });
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [currentPiece, setCurrentPiece] = useState(
    pieces[Math.floor(Math.random() * pieces.length)]
  );
  const pieceRef = useRef(null);
  const gridRef = useRef(null);

  // Create grid
  const initialGrid = Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => 0)
  );
  const [grid, setGrid] = useState(initialGrid);

  // Function to update dimensions and positions
  const updateDimensions = () => {
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      setGridDimensions({
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
        x: Math.floor(rect.left),
        y: Math.floor(rect.top),
      });
    }
  };

  // Function to update piece coordinates
  const updatePieceCoordinates = (event) => {
    const newPieceCoordinates = {
      x: Math.floor(event.clientX),
      y: Math.floor(event.clientY),
    };
    setPieceCoordinates(newPieceCoordinates);

    const new_row = Math.floor(
      ((newPieceCoordinates.y - gridDimensions.y) / gridDimensions.height) * 10
    );
    const new_col = Math.floor(
      ((newPieceCoordinates.x - gridDimensions.x) / gridDimensions.width) * 10
    );

    setHoveredGridLocation({
      row: new_row >= 0 && new_row < 10 ? new_row : -1,
      col: new_col >= 0 && new_col < 10 ? new_col : -1,
    });

    if (draggedPiece) {
      updateHighlightedCells(new_row, new_col);
    } else {
      setHighlightedCells([]);
    }
  };

  // Handle drag over event
  const handleDragOver = (event) => {
    event.preventDefault();
    updatePieceCoordinates(event);
  };

  // Handle drag start event
  const handleDragStart = (event, rowOffset, colOffset) => {
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ rowOffset, colOffset })
    );
    setDraggedPiece(currentPiece);
    setDragOffset({ row: rowOffset, col: colOffset });

    // Update piece coordinates to the top-left of the piece
    const pieceRect = event.target.getBoundingClientRect();
    const newPieceCoordinates = {
      x: Math.floor(pieceRect.left),
      y: Math.floor(pieceRect.top),
    };
    setPieceCoordinates(newPieceCoordinates);

    const new_row = Math.floor(
      ((pieceRect.top - gridDimensions.y) / gridDimensions.height) * 10
    );
    const new_col = Math.floor(
      ((pieceRect.left - gridDimensions.x) / gridDimensions.width) * 10
    );

    setHoveredGridLocation({
      row: new_row >= 0 && new_row < 10 ? new_row : -1,
      col: new_col >= 0 && new_col < 10 ? new_col : -1,
    });

    if (draggedPiece) {
      updateHighlightedCells(new_row, new_col);
    } else {
      setHighlightedCells([]);
    }
  };

  // Handle drop event
  const handleDrop = (event) => {
    const { rowOffset, colOffset } = JSON.parse(
      event.dataTransfer.getData("text/plain")
    );

    if (
      draggedPiece &&
      hoveredGridLocation.row >= 0 &&
      hoveredGridLocation.col >= 0
    ) {
      const startRow = hoveredGridLocation.row - rowOffset;
      const startCol = hoveredGridLocation.col - colOffset;
      const endRow = startRow + draggedPiece.length;
      const endCol = startCol + draggedPiece[0].length;

      console.log(highlightedCells);

      if (
        highlightedCells.some((cell) => cell.valid === 0) &&
        highlightedCells.length > 0
      ) {
        console.log("Invalid drop");
        const newGrid = grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            return cell;
          })
        );
        setGrid(newGrid);
      } else {
        console.log("Valid drop");
        const newGrid = grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (
              rowIndex >= startRow &&
              rowIndex < endRow &&
              colIndex >= startCol &&
              colIndex < endCol
            ) {
              return (
                (draggedPiece[rowIndex - startRow] &&
                  draggedPiece[rowIndex - startRow][colIndex - startCol]) ||
                cell
              );
            } else {
              return cell;
            }
          })
        );
        setGrid(newGrid);
      }
    }
    setDraggedPiece(null);
    setHighlightedCells([]);
    setCurrentPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  };

  // Handle drag end event
  const handleDragEnd = () => {
    setDraggedPiece(null);
    setHighlightedCells([]);
  };

  // Update highlighted cells
  const updateHighlightedCells = (new_row, new_col) => {
    const startRow = new_row - dragOffset.row;
    const startCol = new_col - dragOffset.col;
    const endRow = startRow + draggedPiece.length;
    const endCol = startCol + draggedPiece[0].length;

    const newHighlightedCells = [];
    let validDrop = 3;

    for (let i = startRow; i < endRow; i++) {
      for (let j = startCol; j < endCol; j++) {
        if (i >= 0 && i < 10 && j >= 0 && j < 10) {
          //
          let validDrop = 3;
          const gridValue = grid[i][j];
          const pieceValue =
            draggedPiece[i - startRow] &&
            draggedPiece[i - startRow][j - startCol];

          // Check if the grid cell is occupied AND piece cell is occupied
          // Drop is invalid due to collision, shade cell red
          if (gridValue === 1 && pieceValue === 1) {
            validDrop = 0;
          }
          // Check if the grid cell is occupied AND piece cell is empty
          // Drop is valid due to empty piece cell, do not shade cell or collision detect
          else if (gridValue === 1 && pieceValue === 0) {
            validDrop = 1;
          }
          // Check if the grid cell is empty AND piece cell is occupied
          else if (gridValue === 0 && pieceValue === 0) {
            validDrop = 2;
          }
          // Check if the grid cell is empty AND piece cell is occupied
          else if (gridValue === 0 && pieceValue === 1) {
            validDrop = 3;
          }
          newHighlightedCells.push({
            row: i,
            col: j,
            valid: validDrop,
            occupied: grid[i][j],
          });
        } else {
          newHighlightedCells.push({
            row: i,
            col: j,
            valid: 0,
            occupied: 1,
          });
        }
      }
    }
    setHighlightedCells(
      newHighlightedCells.map((cell) => ({
        ...cell,
      }))
    );
  };

  useEffect(() => {
    updateDimensions(); // Initial dimensions
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("dragend", handleDragEnd);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("dragend", handleDragEnd);
    };
  }, []);

  return (
    <div className="app-container">
      <div className="class-header">
        <p>Mouse Coordinates</p>
        <div className="stat-row">
          <span className="stat-label">X:</span>
          <span className="stat-value">{pieceCoordinates.x}px</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Y:</span>
          <span className="stat-value">{pieceCoordinates.y}px</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Row:</span>
          <span className="stat-value">{hoveredGridLocation.row}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Col:</span>
          <span className="stat-value">{hoveredGridLocation.col}</span>
        </div>
      </div>

      <div
        className="grid-container"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="grid" ref={gridRef}>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              // Check if the cell is highlighted
              const highlightedCell = highlightedCells.find(
                (highlighted) =>
                  highlighted.row === rowIndex && highlighted.col === colIndex
              );

              let backgroundColor = cell === 1 ? "white" : "black";

              // Check the conditions for changing the background color
              if (highlightedCell && draggedPiece) {
                const anyInvalid = highlightedCells.some(
                  (cell) => cell.valid === 0
                );
                const allValid = highlightedCells.every(
                  (cell) => cell.valid > 0
                );

                if (highlightedCell.occupied) {
                  backgroundColor = "white";
                } else if (anyInvalid) {
                  backgroundColor = "red";
                } else if (allValid && highlightedCell.valid === 3) {
                  backgroundColor = "green";
                }
              }

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="grid-cell"
                  style={{ backgroundColor }}
                ></div>
              );
            })
          )}
        </div>
      </div>

      <div className="class-bottom">
        <div
          className="piece"
          ref={pieceRef}
          draggable
          onDragStart={(event) => {
            const pieceRect = event.target.getBoundingClientRect();
            const offsetX = event.clientX - pieceRect.left;
            const offsetY = event.clientY - pieceRect.top;
            const rowOffset = Math.floor(
              offsetY / (pieceRect.height / currentPiece.length)
            );
            const colOffset = Math.floor(
              offsetX / (pieceRect.width / currentPiece[0].length)
            );
            handleDragStart(event, rowOffset, colOffset);
          }}
          onDrag={(event) => updatePieceCoordinates(event)}
        >
          {currentPiece.map((pieceRow, pieceRowIndex) =>
            pieceRow.map((pieceCell, pieceColIndex) => {
              const border =
                pieceCell === 1 ? "1px solid black" : "1px solid transparent";
              return (
                <div
                  key={`${pieceRowIndex}-${pieceColIndex}`}
                  className="piece-cell"
                  style={{
                    backgroundColor: pieceCell === 1 ? "yellow" : "transparent",
                    borderTop: border,
                    borderBottom: border,
                    borderLeft: border,
                    borderRight: border,
                  }}
                ></div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
