import { runIntCode } from '../intCode';
import type { ProgramState } from '../intCode';

type Position = { row: number, col: number }
type Directions = 'up' | 'down' | 'left' | 'right'

const rotations: { [ key in Directions ]: Directions[] } = {
  up: [ 'left', 'right' ],
  down: [ 'right', 'left' ],
  left: [ 'down', 'up' ],
  right: [ 'up', 'down' ],
}

const colorToChar = [ '.', '#' ];

const moves: { [key in Directions]: Position } = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
}

function getPanel(size: number) {
  return Array(size).fill(0).map(() => {
    return Array(size).fill('.');
  });
} 

function paint(
  panel: string[][],
  pos: Position,
  dir: Directions,
  programState: ProgramState,
  visited = new Set<string>()
) {
  const color = colorToChar.findIndex(char => char === panel[pos.row][pos.col]);
  if (color === -1) throw Error('out of bounds, please increase panel size');

  const firstRun = runIntCode({
    ...programState,
    input: [ color ],
    diagnostics: [],
    halt: true
  });
  if (firstRun.done) return visited;

  panel[pos.row][pos.col] = colorToChar[firstRun.diagnostics[0]];
  visited.add(`${pos.row},${pos.col}`);
  const secondRun = runIntCode({
    ...firstRun,
    input: [ color ],
    diagnostics: [],
    halt: true
  });

  dir = rotations[dir][secondRun.diagnostics[0]];
  const move = moves[dir];
  pos = { row: pos.row + move.row, col: pos.col + move.col };

  if (secondRun.done) return visited;
  return paint(panel, pos, dir, secondRun, visited);
}

function printPanel(panel: string[][]) {
  panel.forEach(row => console.log(row.join('')));
  console.log('~~~~~~~~');
}

const program = (await Bun.file(process.argv[2]).text()).split(',').map(Number);

const size = 125;
const panel = getPanel(size);
const pos = { row: Math.floor(size / 2), col: Math.floor(size / 2) };
const part1 = paint(panel, pos, 'up', { program }).size;
console.log(part1, [ 2268 ].includes(part1));
