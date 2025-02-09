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

function findLast(program: number[], row: number, col = row) {
  if (col === 0) return;
  if (testPos(program, { row, col })) return { row, col };
  return findLast(program, row, col - 1);
}

function bSearchSquare(
  program: number[],
  length: number,
  rowMin = 0,
  rowMax = 4096,
) {
  const midRow = Math.floor((rowMin + rowMax) / 2);
  const topRight = findLast(program, midRow);
  if (!topRight) throw Error('no top right')
  const col = topRight.col - length + 1;
  if (rowMax - rowMin === 1) return (col + 1) * 10000 + rowMax;
  const topLeft = testPos(program, { row: midRow, col: col });
  if (!topLeft) return bSearchSquare(program, length, midRow, rowMax);
  const bottomLeft = testPos(program, { row: midRow + length - 1, col: col });
  if (!bottomLeft) return bSearchSquare(program, length, midRow, rowMax);
  return bSearchSquare(program, length, rowMin, midRow);
}

const startTime = Bun.nanoseconds();
const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);

const part1 = solvePart1(program);
console.log(part1, [ 114 ].includes(part1));
const part2 = bSearchSquare(program, 100);
console.log(part2, [ 10671712 ].includes(part2));
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`);
