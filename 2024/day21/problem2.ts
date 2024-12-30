// Guide: https://www.reddit.com/r/adventofcode/comments/1hjx0x4/2024_day_21_quick_tutorial_to_solve_part_2_in/
type Position = { row: number, col: number }
type Grid = (string|undefined)[][]
type Path = Position & { path: string }

const directions: { [key: string]: Position } = {
  '^': { row: -1, col: 0 },
  '>': { row: 0, col: 1 },
  'v': { row: 1, col: 0 },
  '<': { row: 0, col: -1 },
}

const numpad = [
  [ '7', '8', '9' ],
  [ '4', '5', '6' ],
  [ '1', '2', '3' ],
  [ undefined, '0', 'A' ],
];

const dirpad = [
  [ undefined, '^', 'A' ],
  [ '<', 'v', '>' ],
];

function getPos(grid: Grid, char: string) {
  const row = grid.findIndex(row => row.includes(char));
  const col = grid[row].findIndex(cell => cell === char);
  return { row, col };
}

function posToStr(pos: Position) {
  return `${pos.row},${pos.col}`;
}

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col
  }
}

function charAtPos(grid: (string|undefined)[][], pos: Position) {
  return grid?.[pos.row]?.[pos.col];
}

function getAllPaths(...grids: (string|undefined)[][][]) {
  return grids.reduce((result, grid) => {
    grid.flat().filter(Boolean).forEach((digit1, _, digits) => {
      digits.forEach(digit2 => {
        if (!digit1 || !digit2) return;
        if (digit1 === digit2) return result[`${digit1},${digit2}`] = ['A'];
        result[`${digit1},${digit2}`] = shortestPath(
          grid,
          getPos(grid, digit1),
          getPos(grid, digit2)
        ).map(result => result.path.concat('A'));
      });
    });
    return result;
  }, {} as { [key: string]: string[] });
}

function shortestPath(
  grid: Grid,
  start: Position,
  end: Position,
  queue = [{
    ...start,
    path: '',
    visited: new Set<string>([ posToStr(start) ])
  }],
  answer: Path[] = [],
  maxDistance = Math.abs(start.row - end.row) + Math.abs(start.col - end.col)
) {
  if (!queue.length) return answer;
  const endStr = posToStr(end);
  const current = queue.shift()!;
  if (current.path.length <= maxDistance) {
    if (posToStr(current) === endStr) {
      answer.push(current);
    } else {
      Object.keys(directions).forEach(key => {
        const dir = directions[key];
        const newPos = translatePos(current, dir);
        if (!charAtPos(grid, newPos)) return;
        if (current.visited.has(posToStr(newPos))) return;
        queue.push({
          ...newPos,
          path: current.path + key,
          visited: new Set(current.visited).add(posToStr(newPos))
        });
      });
    }
  }
  return shortestPath(grid, start, end, queue, answer, maxDistance);
}

const complexityCache: { [key: string]: number }  = {};
function getComplexity(lookFor: string, maxDepth: number, depth = 0): number {
  const cacheStr = `${lookFor},${maxDepth - depth}`;
  if (complexityCache[cacheStr]) return complexityCache[cacheStr];
  if (depth === maxDepth) return lookFor.length;
  const result = lookFor.split('').reduce((answerLength, char, i) => {
    const lookUpStr = `${lookFor[i - 1] || 'A'},${char}`;
    return answerLength + allPaths[lookUpStr].reduce((miniLowest, path) => {
      return Math.min(miniLowest, getComplexity(path, maxDepth, depth + 1));
    }, Infinity);
  }, 0);
  complexityCache[cacheStr] = result;
  return result;
}

const startTime = Bun.nanoseconds();
const allPaths = getAllPaths(numpad, dirpad);
const { part1, part2 } = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .reduce((total, number) => {
    const num = parseInt(number);
    total.part1 += getComplexity(number, 3) * num;
    total.part2 += getComplexity(number, 26) * num;
    return total;
  }, { part1: 0, part2: 0 })
);
console.log(part1, [ 126384, 94284 ].includes(part1));
console.log(part2, [ 116821732384052 ].includes(part2));
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`);
