import runIntCode from './intCode';

type Position = { row: number, col: number }
type Directions = 'up' | 'down' | 'left' | 'right'

const colorToChar = [ '.', '#' ];

const rotations: { [ key in Directions ]: Directions[] } = {
  up: [ 'left', 'right' ],
  down: [ 'right', 'left' ],
  left: [ 'down', 'up' ],
  right: [ 'up', 'down' ],
}

const moves: { [key in Directions]: Position } = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
}

function getPanel(size: number, width?: number) {
  return Array(size).fill(0).map(() => Array(width || size).fill('.'));
} 

function paint(
  panel: string[][],
  pos: Position,
  dir: Directions,
  program: number[],
  index: number = 0,
  relativeBase: number = 0,
  visited = new Set<string>()
) {
  const color = colorToChar.findIndex(char => char === panel[pos.row][pos.col]);
  if (color === -1) throw Error('out of bounds, please increase panel size');

  const firstRun = runIntCode(program, index, [ color ], [], true, relativeBase);
  if (firstRun.halted) return visited;

  panel[pos.row][pos.col] = colorToChar[firstRun.diagnostics[0]];
  visited.add(`${pos.row},${pos.col}`);
  const secondRun = runIntCode(firstRun.program, firstRun.index!, [ color ], [], true, firstRun.relativeBase!);

  dir = rotations[dir][secondRun.diagnostics[0]];
  const move = moves[dir];
  pos = { row: pos.row + move.row, col: pos.col + move.col };
  if (secondRun.halted) return visited;

  return paint(
    panel,
    pos,
    dir,
    secondRun.program,
    secondRun.index!,
    secondRun.relativeBase!,
    visited
  );
}

function printRegId(panel: string[][]) {
  const startRow = panel.findIndex(row => row.includes('#'));
  const endRow = panel.findLastIndex(row => row.includes('#'));
  const rows = panel.slice(startRow, endRow + 1);

  const { startCol, endCol } = rows.reduce((result, row) => {
    const newStart = row.findIndex(cell => cell === '#');
    if (newStart < result.startCol) result.startCol = newStart;
    const newEnd = row.findLastIndex(cell => cell === '#');
    if (newEnd > result.endCol) result.endCol = newEnd;
    return result;
  }, { startCol: Infinity, endCol: -Infinity });

  rows.map(row => row.slice(startCol, endCol + 1))
    .map(row => row.map(cell => cell === '.' ? ' ' : '█'))
    .forEach(row => console.log(row.join('')));
}

const program = (await Bun.file(process.argv[2]).text()).split(',').map(Number);

const size = 125;
const center = Math.floor(size / 2);
const pos = { row: center, col: center };

const part1 = paint(getPanel(size), pos, 'up', program).size;
console.log(part1, [ 2268 ].includes(part1));

const part2Panel = getPanel(size);
part2Panel[pos.row][pos.col] = '#';
paint(part2Panel, pos, 'up', program);
printRegId(part2Panel); // Should display CEPKZJCR
