////
import "./App.css";
import { useEffect, useState, useRef } from "react";

////
function App() {
  //// App variables
  const [headerDimensions, setHeaderDimensions] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const [gridDimensions, setGridDimensions] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  //
  const [mouseCoordinates, setMouseCoordinates] = useState({ x: -1, y: -1 });
  const [gridLocation, setGridLocation] = useState({ row: -1, col: -1 });
  //
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  // Create grid
  const initialGrid = Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => 0)
  );
  const [grid, setGrid] = useState(initialGrid);

  //// Function to update dimensions and positions
  const updateDimensions = () => {
    //
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setHeaderDimensions({
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
        x: Math.floor(rect.x),
        y: Math.floor(rect.y),
      });
    }
    //
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      setGridDimensions({
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
        x: Math.floor(rect.x),
        y: Math.floor(rect.y),
      });
    }
  };

  // Function to update mouse coordinates
  const handleMouseMove = (event) => {
    setMouseCoordinates({
      x: Math.floor(event.clientX),
      y: Math.floor(event.clientY),
    });

    // Now when I hover over the grid it will highlight the cell
    let new_row = Math.floor(
      ((event.clientY - gridDimensions.y) / gridDimensions.height) * 10
    );
    let new_col = Math.floor(
      ((event.clientX - gridDimensions.x) / gridDimensions.width) * 10
    );
    if (new_row < 0 || new_row > 9 || new_col < 0 || new_col > 9) {
      new_row = -1;
      new_col = -1;
    }
    setGridLocation({
      row: new_row,
      col: new_col,
    });
    if (new_row >= 0 && new_row < 10 && new_col >= 0 && new_col < 10) {
      const newGrid = grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (rowIndex === new_row && colIndex === new_col) {
            return 1;
          } else {
            return 0;
          }
        })
      );
      setGrid(newGrid);
    } else {
      const newGrid = grid.map((row) => row.map(() => 0));
      setGrid(newGrid);
    }
  };

  //// If the window height or width changes, update the state
  useEffect(() => {
    updateDimensions(); // Initial dimensions
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  //// Render the app
  return (
    <div className="app-container">
      <div className="class-header" ref={headerRef}>
        <p>Hover Grid</p>
        <div className="stat-row">
          <span className="stat-label">Width:</span>
          <span className="stat-value">{headerDimensions.width}px</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Height:</span>
          <span className="stat-value">{headerDimensions.height}px</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">X:</span>
          <span className="stat-value">{headerDimensions.x}px</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Y:</span>
          <span className="stat-value">{headerDimensions.y}px</span>
        </div>
      </div>

      <div className="grid-container">
        <div className="grid" ref={gridRef}>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="grid-cell"
                style={{ backgroundColor: cell === 1 ? "white" : "black" }}
              ></div>
            ))
          )}
        </div>
      </div>

      <div className="class-bottom">
        <p>Mouse Coordinates</p>
        <div className="stat-row">
          <span className="stat-label">X:</span>
          <span className="stat-value">{mouseCoordinates.x}px</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Y:</span>
          <span className="stat-value">{mouseCoordinates.y}px</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Row:</span>
          <span className="stat-value">{gridLocation.row}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Col:</span>
          <span className="stat-value">{gridLocation.col}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
