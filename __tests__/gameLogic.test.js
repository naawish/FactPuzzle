// __tests__/gameLogic.test.js
import { checkTicTacToeWinner } from '../src/utils/gameLogic';

describe('Tic Tac Toe Logic', () => {
  
  it('should detect X as winner in top row', () => {
    const board = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null
    ];
    expect(checkTicTacToeWinner(board)).toBe('X');
  });

  it('should detect O as winner in diagonal', () => {
    const board = [
      'O', 'X', 'X',
      null, 'O', null,
      'X', null, 'O'
    ];
    expect(checkTicTacToeWinner(board)).toBe('O');
  });

  it('should detect a Draw', () => {
    const board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X'
    ];
    expect(checkTicTacToeWinner(board)).toBe('Draw');
  });

  it('should return null if game is ongoing', () => {
    const board = [
      'X', 'O', null,
      null, null, null,
      null, null, null
    ];
    expect(checkTicTacToeWinner(board)).toBeNull();
  });

});