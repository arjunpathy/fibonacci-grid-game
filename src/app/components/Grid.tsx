/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import styles from './Grid.module.css';

const GRID_LENGTH = 30;

const Grid = () => {

    const [gameState, setGameState] = useState<any>(null);

    useEffect(() => {
        fetch('/api/game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reset' }),
        })
            .then((res) => res.json())
            .then(setGameState);
    }, []);

    const handleClick = (row: number, col: number, action = 'click') => {
        fetch('/api/game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, row, col }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data); setGameState(data); setTimeout(() => { setGameState({ ...data, cellsToHighlight: [] }); }, 900);
            });
    };

    if (!gameState) return <p>Loading...</p>;

    return (
        <div style={{ display: "flex", justifyContent: "space-equally", width: "100%" }}>
            <div
                className={styles.grid}
                style={{ gridTemplateColumns: `repeat(${GRID_LENGTH}, 20px)` }}
            >
                {gameState.grid.map((row: number[], rowIndex: number) =>
                    row.map((value: number, colIndex: number) => {
                        const isHighlighted = gameState.cellsToHighlight.some(
                            ([r, c]: [number, number]) => r === rowIndex && c === colIndex
                        );
                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={styles.cell}
                                style={{ backgroundColor: isHighlighted ? gameState.currentPlayer === 'player1' ? "lightpink" : "lightyellow" : 'white' }}
                                onClick={() => handleClick(rowIndex, colIndex)}
                            >
                                {value !== 0 ? value : ""}
                            </div>
                        )
                    })
                )}
            </div>
            <div style={{ width: "10%", textAlign: "left", marginLeft: "5%" }}>
                <div style={{ marginTop: "10px" }}><span style={{ fontSize: "20px", color: "lightyellow" }}>Player 1: </span>{gameState.scores.player1}</div>
                <div style={{ marginTop: "10px" }}><span style={{ fontSize: "20px", color: "lightpink" }}>Player 2: </span>{gameState.scores.player2}</div>
                <button className={styles.resetBtn} onClick={() => handleClick(0, 0, 'reset')}>Reset</button>
            </div>

        </div>
    );
};

export default Grid;
