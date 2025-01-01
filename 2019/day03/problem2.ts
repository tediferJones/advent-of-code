type Position = { row: number, col: number }
type Directions = 'R' | 'D' | 'L' | 'U'
type Visited = Position & { length: number }

const dirs: { [key in Directions]: Position } = {
  R: { row:  0, col:  1 },
  D: { row:  1, col:  0 },
  L: { row:  0, col: -1 },
  U: { row: -1, col:  0 },
}

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function posToStr(pos: Position) {
  return `${pos.row},${pos.col}`
}

function tracePath(dir: Position, max: number, path: Visited[], current = 0) {
  if (max === current) return path;
  const pos = path[path.length - 1];
  const nextPos = translatePos(pos, dir);
  const newPath = path.concat({ ...nextPos, length: pos.length + 1 });
  return tracePath(dir, max, newPath, current + 1);
}

function getDistance(pos: Position) {
  return Math.abs(pos.row) + Math.abs(pos.col);
}

const startTime = Bun.nanoseconds();
const wires = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .reduce((wires, line) => {
    return wires.concat([
      line.split(',').reduce((visited, instruction) => {
        const [ _, dir, amount ] = instruction.match(/([RDLU])(\d+)/)!;
        const path = tracePath(
          dirs[dir as Directions],
          Number(amount),
          visited.slice(-1)
        );
        return visited.concat(path.slice(1));
      }, [{ row: 0, col: 0, length: 0 }] as Visited[])
    ]);
  }, [] as Visited[][])
);

const [ path1, path2 ] = wires;
const path2Obj = path2.reduce((obj, path) => {
  obj[posToStr(path)] = path.length;
  return obj;
}, {} as { [key: string]: number })

const answer = path1.slice(1).reduce((answer, path) => {
  const found = path2Obj[posToStr(path)];
  if (found && path.length) {
    const distance = getDistance(path);
    if (distance < answer.distance) answer.distance = distance;
    const newLength = path.length + found;
    if (newLength < answer.length) answer.length = newLength;
  }
  return answer;
}, { distance: Infinity, length: Infinity });

const part1 = answer.distance;
console.log(part1, [ 6, 159, 135, 489 ].includes(part1));
const part2 = answer.length;
console.log(part2, [ 30, 610, 410, 93654 ].includes(part2));
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
