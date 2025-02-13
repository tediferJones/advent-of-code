import { runIntCode } from '../intCode';

type Position = { row: number, col: number }

function testPos(program: number[], pos: Position) {
  return runIntCode({ program, input: [ pos.col, pos.row ] }).diagnostics[0];
}

function solvePart1(program: number[], squareSize: number) {
  return Array(squareSize).fill(0).reduce((total, _, row) => {
    return total + getBeamLength(program, row);
  }, 0);
}

function getBeamLength(program: number[], row: number) {
  if (row < 0) throw Error(`negative row found: ${row}`);
  const last = bSearchLast(program, row);
  if (!last) return 0;
  const first = bSearchFirst(program, row, 0, last.col);
  return (last.col - first.col) + 1;
}

function bSearchLast(
  program: number[],
  row: number,
  minCol = Math.ceil(row / 2),
  maxCol = row
): undefined | Position {
  const midCol = Math.floor((minCol + maxCol) / 2);
  const result = testPos(program, { row, col: midCol });
  if (midCol === minCol || midCol + 1 === maxCol) {
    const testResult = testPos(program, { row, col: minCol });
    return testResult ? { row, col: minCol } : undefined;
  }
  return bSearchLast(
    program,
    row,
    result ? midCol : minCol,
    result ? maxCol : midCol + 1
  );
}

function bSearchFirst(
  program: number[],
  row: number,
  minCol: number,
  maxCol: number
) {
  const midCol = Math.ceil((minCol + maxCol) / 2);
  if (midCol === maxCol) return { row, col: midCol };
  const result = testPos(program, { row, col: midCol });
  return bSearchFirst(
    program,
    row,
    result ? minCol : midCol,
    result ? midCol : maxCol
  );
}

function getRowMinMax(program: number[], length: number, row = 1) {
  const last = bSearchLast(program, row);
  if (last) {
    const first = bSearchFirst(program, row, 0, last.col);
    const beamLength = last.col - first.col + 1;
    if (beamLength > length) return { min: row / 2, max: row };
  }
  return getRowMinMax(program, length, row * 2);
}

function bSearchSquare(
  program: number[],
  length: number,
  rowMin: number,
  rowMax: number,
) {
  const midRow = Math.ceil((rowMin + rowMax) / 2);
  const topRight = bSearchLast(program, midRow);
  if (!topRight) throw Error('no top right');
  const col = topRight.col - length + 1;
  if (midRow === rowMax) return col * 10000 + midRow;
  const topLeft = testPos(program, { row: midRow, col: col });
  if (!topLeft) return bSearchSquare(program, length, midRow, rowMax);
  const bottomLeft = testPos(program, { row: midRow + length - 1, col: col });
  if (!bottomLeft) return bSearchSquare(program, length, midRow, rowMax);
  return bSearchSquare(program, length, rowMin, midRow);
}

function solvePart2(program: number[], squareSize: number) {
  const rowMinMax = getRowMinMax(program, squareSize);
  return bSearchSquare(program, squareSize, rowMinMax.min, rowMinMax.max);
}

const startTime = Bun.nanoseconds();
const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);

const part1 = solvePart1(program, 50);
console.log(part1, [ 114 ].includes(part1));
const part2 = solvePart2(program, 100);
console.log(part2, [ 10671712 ].includes(part2));
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`);
