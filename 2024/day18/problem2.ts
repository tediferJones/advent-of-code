type Position = { row: number, col: number }
type Path = Position & { visited: Position[] }

const directions = [
  { row:  1, col:  0 },
  { row:  0, col:  1 },
  { row: -1, col:  0 },
  { row:  0, col: -1 },
]

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function posToStr(pos: Position) {
  return `${pos.row},${pos.col}`;
}

function charAtPos(board: string[][], pos: Position) {
  return board?.[pos.row]?.[pos.col];
}

function shortestPath(
  board: string[][],
  queue: Path[],
  seen = new Set<string>(queue.map(posToStr))
) {
  if (!queue.length) return;
  const current = queue.shift()!;
  if (current.row === boardSize && current.col === boardSize) {
    return current.visited.length;
  }
  directions.forEach(dir => {
    const newPos = translatePos(current, dir);
    if (seen.has(posToStr(newPos))) return;
    if (charAtPos(board, newPos) !== '.') return;
    seen.add(posToStr(newPos));
    queue.push({ ...newPos, visited: current.visited.concat(newPos) });
  })
  return shortestPath(board, queue, seen);
}

function checkForPath(bytes: Position[], byteLength: number) {
  const board = (
    Array(boardSize + 1).fill(0).map(() => Array(boardSize + 1).fill('.'))
  );
  bytes.slice(0, byteLength).forEach(pos => board[pos.row][pos.col] = '#');
  return shortestPath(board, [{ row: 0, col: 0, visited: [] }]);
}

function binarySearch(bytes: Position[], min = 0, max = bytes.length - 1) {
  if (min > max) return;
  if (min === max) return `${bytes[min].col},${bytes[min].row}`;
  const mid = Math.floor((min + max) / 2);
  const hasPath = !!checkForPath(bytes, mid + 1);
  return binarySearch(
    bytes,
    hasPath ? mid + 1 : min,
    hasPath ? max : mid
  );
}

function printBoard(board: string[][]) {
  board.forEach(row => console.log(row.join('')));
  console.log('~'.repeat(board[0].length));
}

const boardSize = process.argv[2] === 'example.txt' ? 6 : 70;
const byteCount = process.argv[2] === 'example.txt' ? 12 : 1024;

const startTime = Bun.nanoseconds();
const bytes = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => {
    const [ col, row ] = line.split(',').map(Number)
    return { row, col }
  })
);

const part1 = checkForPath(bytes, byteCount)!;
const part2 = binarySearch(bytes)!;
console.log(part1, [ 22, 246 ].includes(part1));
console.log(part2, [ '6,1', '22,50' ].includes(part2));
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`);
