import { runIntCode } from '../intCode';
import type { ProgramState as StandardProgramState } from '../intCode';

type Position = { row: number, col: number }
type ProgramState = StandardProgramState & {
  steps: number,
  pos: Position
}

const dirs = [ 1, 2, 3, 4 ];

const posChange: Record<number, Position> = {
  1: { row: -1, col:  0 },
  2: { row:  1, col:  0 },
  3: { row:  0, col: -1 },
  4: { row:  0, col:  1 },
}

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function posToStr(pos: Position) {
  return `${pos.row},${pos.col}`;
}

function shortestPath(
  queue: ProgramState[],
  seen = new Set<string>(queue.map(item => JSON.stringify(item.pos)))
) {
  if (!queue.length) return;
  const { program, index, relativeBase, steps, pos } = queue.shift()!;
  const foundAnswer = dirs.some(dir => {
    const newPos = translatePos(pos, posChange[dir]);
    const strNewPos = posToStr(newPos);
    if (seen.has(strNewPos)) return;
    seen.add(strNewPos);
    const nextStep = runIntCode({
      program,
      index,
      input: [ dir ],
      halt: true,
      relativeBase
    });
    if (nextStep.diagnostics[0] === 0) return;
    if (nextStep.diagnostics[0] === 2) return true;
    queue.push({
      ...nextStep,
      steps: steps + 1,
      pos: newPos
    });
  });
  if (foundAnswer) return steps + 1;
  return shortestPath(queue, seen);
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);

const part1 = shortestPath([{ program, steps: 0, pos: { row: 0, col: 0 } }])!;
console.log(part1, [ 252 ].includes(part1));
