import { NextResponse } from "next/server";

const GRID_LENGTH = 30;
const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5];
const len = FIBONACCI_SEQUENCE.length;

type GameState = {
  grid: number[][];
  scores: { player1: number; player2: number };
  currentPlayer: "player1" | "player2";
  winner: string | null;
  cellsToHighlight: [number, number][];
};

let gameState: GameState = {
  grid: Array.from({ length: GRID_LENGTH }, () => Array(GRID_LENGTH).fill(0)),
  scores: { player1: 0, player2: 0 },
  currentPlayer: "player1",
  winner: null,
  cellsToHighlight: [],
};

const isFibonacci = (arr: number[]) =>
  arr.every((ele, idx) => ele === FIBONACCI_SEQUENCE[idx]);

const checkForFibonacci = (grid: number[][], row: number, col: number) => {
  const fiboCells: [number, number][] = [];

  // Left to Right
  if (col >= len - 1) {
    const sequenceArray = grid[row].slice(col - len + 1, col + 1);
    if (isFibonacci(sequenceArray)) {
      for (let idx = 0; idx < sequenceArray.length; idx++) {
        fiboCells.push([row, col - len + 1 + idx]);
      }
    }
  }

  // Right to Left
  if (col <= GRID_LENGTH - len) {
    const sequenceArray = grid[row].slice(col, col + len).reverse();
    if (isFibonacci(sequenceArray)) {
      for (let idx = 0; idx < sequenceArray.length; idx++) {
        fiboCells.push([row, col + idx]);
      }
    }
  }

  // Top to Bottom
  if (row >= len - 1) {
    const sequenceArray = grid.slice(row - len + 1, row + 1).map((r) => r[col]);
    if (isFibonacci(sequenceArray)) {
      for (let idx = 0; idx < sequenceArray.length; idx++) {
        fiboCells.push([row - len + 1 + idx, col]);
      }
    }
  }

  // Bottom to Top
  if (row <= GRID_LENGTH - len) {
    const sequenceArray = grid
      .slice(row, row + len)
      .map((r) => r[col])
      .reverse();
    if (isFibonacci(sequenceArray)) {
      for (let idx = 0; idx < sequenceArray.length; idx++) {
        fiboCells.push([row + idx, col]);
      }
    }
  }

  return fiboCells;
};

const resetGameState = () => {
  gameState = {
    grid: Array.from({ length: GRID_LENGTH }, () => Array(GRID_LENGTH).fill(0)),
    scores: { player1: 0, player2: 0 },
    currentPlayer: "player1",
    winner: null,
    cellsToHighlight: [],
  };
};

export async function POST(request: Request) {
  const body = await request.json();
  const { action, row, col } = body;

  if (action === "reset") {
    resetGameState();
    return NextResponse.json(gameState);
  }

  if (action === "click") {
    if (row === undefined || col === undefined) {
      return NextResponse.json(
        { error: "Row and column must be provided" },
        { status: 400 }
      );
    }

    const newGrid = gameState.grid.map((r) => [...r]);
    const cellsToHighlight: [number, number][] = [];
    for (let i = 0; i < GRID_LENGTH; i++) {
      newGrid[row][i] = newGrid[row][i] ? newGrid[row][i] + 1 : 1;
      newGrid[i][col] = newGrid[i][col] ? newGrid[i][col] + 1 : 1;
      cellsToHighlight.push([row, i], [i, col]);
    }
    newGrid[row][col] -= 1;

    const fibonacciCells: [number, number][] = [];
    for (let r = 0; r < GRID_LENGTH; r++) {
      for (let c = 0; c < GRID_LENGTH; c++) {
        fibonacciCells.push(...checkForFibonacci(newGrid, r, c));
      }
    }

    if (fibonacciCells.length) {
      gameState.scores[gameState.currentPlayer] += fibonacciCells.length;
      for (const [r, c] of fibonacciCells) {
        newGrid[r][c] = 0;
      }
    }

    gameState.grid = newGrid;
    gameState.currentPlayer =
      gameState.currentPlayer === "player1" ? "player2" : "player1";
    gameState.cellsToHighlight = cellsToHighlight;

    return NextResponse.json(gameState);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
