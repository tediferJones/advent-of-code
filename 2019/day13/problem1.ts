import { runIntCode } from '../intCode';

function makeBoard(size: number) {
  return Array(size).fill(0).map(() => Array(size).fill(0));
}

function buildBoard(board: number[][], outputs: number[]) {
  if (outputs.length === 0) return board;
  const [ col, row, type ] = outputs.slice(0, 3);
  board[row][col] = type;
  return buildBoard(board, outputs.slice(3));
}

function countTileType(board: number[][], type: number) {
  return board.reduce((total, row) => {
    return total + row.reduce((rowTotal, cell) => {
      return rowTotal + Number(cell === type);
    }, 0);
  }, 0);
}

function printBoard(board: number[][]) {
  board.forEach(row => console.log(row.join('')));
}

const program = (await Bun.file(process.argv[2]).text()).split(',').map(Number);

const result = runIntCode({ program });
const board = buildBoard(makeBoard(50), result.diagnostics);
printBoard(board);
const part1 = countTileType(board, 2);
console.log(part1, [ 432 ].includes(part1));
