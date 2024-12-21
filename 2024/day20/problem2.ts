type Position = { row: number, col: number }
type Label = Position & { count: number }

const directions = [
  { row: -1, col:  0 },
  { row:  0, col:  1 },
  { row:  1, col:  0 },
  { row:  0, col: -1 },
];

function findChar(map: string[][], char: string) {
  const row = map.findIndex(row => row.includes(char));
  const col = map[row].findIndex(cell => cell === char);
  return { row, col }
}

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function charAtPos(map: string[][], pos: Position) {
  return map?.[pos.row]?.[pos.col];
}

function posToStr(pos: Position) {
  return `${pos.row},${pos.col}`;
}

function labelPos(
  map: string[][],
  pos: Position,
  labels: Label[],
  count = 0
): Label[] {
  const [ nextDir ] = directions.filter(dir => {
    const newPos = translatePos(pos, dir);
    return charAtPos(map, newPos) !== '#';
  });
  const newPos = { row: pos.row, col: pos.col, count };
  return !nextDir ? labels.concat(newPos) : labelPos(
    map.with(pos.row, map[pos.row].with(pos.col, '#')),
    translatePos(pos, nextDir),
    labels.concat(newPos),
    count + 1
  );
}

function getCheats(
  maxCount: number,
  queue: Label[] = directions.map(dir => ({ ...dir, count: 1 })),
  cheats: Position[] = [],
  seen = new Set<string>(
    queue.concat({ row: 0, col: 0, count: 0 }).map(posToStr)
  )
) {
  if (!queue.length) return cheats;
  const cheat = queue.shift()!;
  if (cheat.count < maxCount) {
    directions.forEach(dir => {
      const next = translatePos(cheat, dir);
      if (seen.has(posToStr(next))) return;
      seen.add(posToStr(next));
      cheats.push(next);
      queue.push({ ...next, count: cheat.count + 1 });
    });
  }
  return getCheats(maxCount, queue, cheats, seen);
}

function cheatCount(labeled: Label[], timeSave: number, cheatCount: number) {
  const cheats = getCheats(cheatCount);
  const labelGraph = getLabelGraph(labeled);
  return labeled.reduce((count, label) => {
    return count + cheats.reduce((miniCount, cheat) => {
      const newPos = translatePos(label, cheat);
      const val = labelGraph?.[newPos.row]?.[newPos.col];
      const cheatTime = Math.abs(cheat.row) + Math.abs(cheat.col);
      if (val > -1 && label.count - val - cheatTime >= timeSave) {
        return miniCount + 1;
      }
      return miniCount;
    }, 0);
  }, 0);
}

function getLabelGraph(labeled: Label[]) {
  return labeled.reduce((graph, label) => {
    if (!graph[label.row]) graph[label.row] = [];
    graph[label.row][label.col] = label.count;
    return graph;
  }, [] as number[][]);
}

const startTime = Bun.nanoseconds();
const map = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(''))
);

const isExample = process.argv[2] === 'example.txt';
const labeled = labelPos(map, findChar(map, 'S'), []);
const part1 = cheatCount(labeled, isExample ? 2 : 100, 2);
const part2 = cheatCount(labeled, isExample ? 50 : 100, 20);
console.log(part1, [ 44, 1511 ].includes(part1));
console.log(part2, [ 285, 1020507 ].includes(part2));
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`);
