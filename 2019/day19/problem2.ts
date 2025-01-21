import runIntCode from '../day13/intCode';

type Position = { row: number, col: number }

function testPos(program: number[], pos: Position) {
  return runIntCode(program, 0, [ pos.col, pos.row ]).diagnostics[0];
}

function solvePart1(program: number[]) {
  return Array(50).fill(0).map((_, i) => i).reduce((total, row, _, arr) => {
    return total + arr.reduce((miniTotal, col) => {
      return miniTotal + testPos(program, { row, col });
    }, 0);
  }, 0);
}

function rowIsValid(program: number[], length: number, row = 1) {
  const positions = [ ...Array(row + 1).keys() ].map(i => ({ row, col: i }));
  const result = positions.map(pos => testPos(program, pos));
  if (result.join('').includes('1'.repeat(length))) return row;
}

function findRow(program: number[], length: number, row = 1) {
  if (rowIsValid(program, length, row)) return row / 2;
  return findRow(program, length, row * 2);
}

function findCol(program: number[], length: number, row: number, col = 0) {
  if (testPos(program, { row, col })) return col;
  return findCol(program, length, row, col + 1);
}

function checkForSqr(
  program: number[],
  length: number,
  row: number,
  col: number
) {
  const topLeft = testPos(program, { row, col });
  if (!topLeft) return checkForSqr(program, length, row, col + 1);
  const topRight = testPos(program, { row, col: col + length - 1 });
  if (!topRight) return checkForSqr(program, length, row + 1, col - length);
  const bottomLeft = testPos(program, { row: row + length - 1, col });
  if (!bottomLeft) return checkForSqr(program, length, row, col + 1);
  return col * 10000 + row;
}

const startTime = Bun.nanoseconds();
const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);

const part1 = solvePart1(program);
console.log(part1, [ 114 ].includes(part1));

const size = 100;
const startRow = findRow(program, size);
const startCol = findCol(program, size, startRow);
const part2 = checkForSqr(program, size, startRow, startCol);
console.log(part2, [ 10671712 ].includes(part2));

console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`);
