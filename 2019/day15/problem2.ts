import runIntCode from '../day13/intCode';

type Position = { row: number, col: number }
type ProgramState = ReturnType<typeof runIntCode> & {
  steps: number,
  pos: Position
}
type O2Spread = Position & { time: number }

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

function posToStr(pos: Position, posType: number) {
  return `${pos.row},${pos.col},${posType}`;
}

function findPos(map: number[][], char: number) {
  const row = map.findIndex(row => row.includes(char));
  const col = map[row].findIndex(cell => cell === char);
  return { row, col };
}

function charAtPos(map: number[][], pos: Position) {
  return map?.[pos.row]?.[pos.col];
}

function shortestPath(
  queue: ProgramState[],
  seen = new Set<string>(),
  leastSteps = 0,
) {
  const { program, index, relativeBase, steps, pos } = queue.shift()!;
  Object.keys(posChange).forEach(dirKey => {
    const dir = Number(dirKey);
    const nextStep = runIntCode(program, index, [ dir ], [], true, relativeBase);
    const newPos = translatePos(pos, posChange[dir]);
    const strNewPos = posToStr(newPos, nextStep.diagnostics[0]);
    if (seen.has(strNewPos)) return;
    seen.add(strNewPos);
    if (nextStep.diagnostics[0] === 0) return;
    if (!leastSteps && nextStep.diagnostics[0] === 2) {
      return leastSteps = steps + 1;
    }
    queue.push({ ...nextStep, steps: steps + 1, pos: newPos });
  })
  if (queue.length === 0) return { mapData: seen, leastSteps };
  return shortestPath(queue, seen, leastSteps);
}

function drawMap(mapData: Set<string>) {
  const tiles = [ ...mapData ].map(posInfo => {
    const [ row, col, type ] = posInfo.split(/,/).map(Number);
    return { row, col, type };
  });

  const minMax = {
    lowCol: Infinity,
    highCol: -Infinity,
    lowRow: Infinity,
    highRow: -Infinity
  }
  const { lowCol, highCol, lowRow, highRow } = tiles.reduce((minMax, tile) => {
    if (tile.col < minMax.lowCol) minMax.lowCol = tile.col;
    if (tile.col > minMax.highCol) minMax.highCol = tile.col;
    if (tile.row < minMax.lowRow) minMax.lowRow = tile.row;
    if (tile.row > minMax.highRow) minMax.highRow = tile.row;
    return minMax;
  }, minMax);

  const colStep = Math.abs(lowCol);
  const rowStep = Math.abs(lowRow);

  const map = Array(rowStep + highRow + 1).fill('!').map(() => {
    return Array(colStep + highCol + 1).fill('!');
  });

  tiles.forEach(tile => {
    map[tile.row + rowStep][tile.col + colStep] = tile.type;
  });
  return map;
}

function oxygenSpread(
  map: number[][],
  queue: O2Spread[],
  seen = new Set<string>(queue.map(pos => posToStr(pos, 0))),
  longestTime = 0,
) {
  const current = queue.shift()!;
  Object.values(posChange).forEach(dir => {
    const newPos = translatePos(current, dir);
    const char = charAtPos(map, newPos);
    if (!char || char === 0) return;
    const strNewPos = posToStr(newPos, 0);
    if (seen.has(strNewPos)) return;
    seen.add(strNewPos);
    queue.push({ ...newPos, time: current.time + 1 });
  })
  if (queue.length === 0) return current.time;
  return oxygenSpread(map, queue, seen, longestTime);
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);

const result = shortestPath([{
  program,
  index: 0,
  diagnostics: [],
  relativeBase: 0,
  input: [],
  steps: 0,
  pos: { row: 0, col: 0 },
}]);

const part1 = result.leastSteps;
console.log(part1, [ 252 ].includes(part1));

const map = drawMap(result.mapData);
const part2 = oxygenSpread(map, [{ ...findPos(map, 2), time: 0 }]);
console.log(part2, [ 350 ].includes(part2));
