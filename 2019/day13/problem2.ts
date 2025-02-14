import { runIntCode } from '../intCode';
import type { ProgramState } from '../intCode';

function makeBoard(rows: number, cols: number) {
  return Array(rows).fill(0).map(() => Array(cols).fill(0));
}

function findPos(board: number[][], char: number) {
  const row = board.findIndex(row => row.includes(char));
  if (row < 0) return;
  const col = board[row].findIndex(cell => cell === char);
  return `${row},${col}`;
}

function countTileType(board: number[][], type: number) {
  return board.reduce((total, row) => {
    return total + row.reduce((rowTotal, cell) => {
      return rowTotal + Number(cell === type);
    }, 0);
  }, 0);
}

function printBoard(board: number[][], score: number) {
  const chars = [ ' ', '█', '#', '-', 'O' ];
  console.clear();
  board.forEach(row => console.log(row.map(cell => chars[cell]).join('')));
  console.log('SCORE:', score);
  const start = new Date().getTime();
  while (new Date().getTime() - start < 25) {};
}

function playGame(
  board: number[][],
  programState: ProgramState,
  prevBallPos: string,
  score = 0,
) {
  const colInfo = runIntCode({ ...programState, diagnostics: [], halt: true });
  if (colInfo.done) return score;
  const rowInfo = runIntCode({ ...colInfo, diagnostics: [], halt: true });
  if (rowInfo.done) return score;
  const typeInfo = runIntCode({ ...rowInfo, diagnostics: [], halt: true });
  if (typeInfo.done) return score;
  const [ col, row, type ] = [
    colInfo, rowInfo, typeInfo
  ].map(info => info.diagnostics[0]);

  if (col === -1 && row === 0) {
    score = type;
  } else {
    board[row][col] = type;
  }

  const ballPos = findPos(board, 4);
  if (ballPos && ballPos !== prevBallPos) {
    printBoard(board, score);
    prevBallPos = ballPos;
    const paddlePos = findPos(board, 3);
    if (paddlePos) {
      const ballCol = ballPos.split(',').map(Number)[1];
      const paddleCol = paddlePos.split(',').map(Number)[1];
      if (ballCol > paddleCol) {
        typeInfo.input.push(1);
      } else if (ballCol < paddleCol) {
        typeInfo.input.push(-1);
      } else {
        typeInfo.input.push(0);
      }
    }
  }
  return playGame(
    board,
    typeInfo,
    prevBallPos,
    score
  );
}

const startTime = Bun.nanoseconds();
const program = (await Bun.file(process.argv[2]).text()).split(',').map(Number);

const board = makeBoard(26, 41);
playGame(board, { program }, '');
const part1 = countTileType(board, 2);

const part2 = playGame(
  board,
  { program: program.with(0, 2) },
  findPos(board, 4)!
);

console.log(part1, [ 432 ].includes(part1));
console.log(part2, [ 22225 ].includes(part2));
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`);
