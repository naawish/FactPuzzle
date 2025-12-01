// src/utils/gameLogic.ts

// Winning combinations for Tic Tac Toe
export const WIN_CONDITIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

/**
 * Checks the board state to see if there is a winner.
 * Returns 'X', 'O', 'Draw', or null (game ongoing).
 */
export function checkTicTacToeWinner(board: (string | null)[]) {
  for (let logic of WIN_CONDITIONS) {
    const [a, b, c] = logic;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (!board.includes(null)) return 'Draw';
  return null;
}