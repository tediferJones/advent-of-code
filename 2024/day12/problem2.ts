type Position = { row: number, col: number }

// The order of these is very important for getSides()
const directions = [
  { row: -1, col:  0 }, // up
  { row:  0, col:  1 }, // right
  { row:  1, col:  0 }, // down
  { row:  0, col: -1 }, // left
];

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function getPosStr(pos: Position) {
  return `${pos.row},${pos.col}`;
}

function getCharAtPos(map: string[][], pos: Position) {
  return map?.[pos.row]?.[pos.col];
}

function getPoints(map: string[][], char: string, pos: Position): Position[] {
  return directions.reduce((positions, dir) => {
    const newPos = translatePos(pos, dir);
    const newPosStr = getPosStr(newPos);
    if (!usedPos.has(newPosStr) && getCharAtPos(map, newPos) === char) {
      usedPos.add(newPosStr);
      return positions.concat(newPos, getPoints(map, char, newPos));
    }
    return positions;
  }, [] as Position[]);
}

function scanPlot(map: string[][], pos: Position) {
  const char = getCharAtPos(map, pos);
  const posStr = getPosStr(pos);
  if (usedPos.has(posStr)) return { area: 0, perimeter: 0, sides: 0 }
  usedPos.add(posStr);

  const positions = getPoints(map, char, pos).concat(pos);
  return {
    area: positions.length,
    perimeter: getPerimeter(map, positions, char),
    sides: getSides(map, positions, char),
  }
}

function getPerimeter(map: string[][], positions: Position[], char: string) {
  return positions.reduce((perimeter, pos) => {
    return perimeter + directions.reduce((mini, dir) => {
      return mini + Number(getCharAtPos(map, translatePos(pos, dir)) !== char);
    }, 0);
  }, 0);
}

function hasInnerCorner(
  map: string[][],
  pos: Position,
  shouldMatch: [Position, Position],
  char: string
) {
  const doesMatch = shouldMatch.every(dir => {
    return getCharAtPos(map, translatePos(pos, dir)) === char;
  })
  const shouldNotMatch = translatePos(...shouldMatch);
  const doesNotMatch = getCharAtPos(map, translatePos(pos, shouldNotMatch));
  return doesMatch && doesNotMatch && (doesNotMatch !== char);
}

// if neither direction is inside the fence, then its an outside corner
function hasOuterCorner(
  pos: Position,
  corner: [Position, Position],
  insideFrence: Set<string>
) {
  return corner.every(dir => {
    return !insideFrence.has(getPosStr(translatePos(pos, dir)));
  });
}

// an enclosed polygon must have the same number of sides as it has corners
function getSides(map: string[][], positions: Position[], char: string) {
  const insideFence = new Set(positions.map(pos => getPosStr(pos)));
  // pair up directions to find corners, i.e. up & right, right & down, etc...
  const corners = directions.map((dir, i) => {
    return [ dir, directions[i + 1] || directions[0] ];
  }) as [Position, Position][];

  return positions.reduce((sides, pos) => {
    return sides + corners.reduce((miniSides, corner) => {
      const outterCorner = hasOuterCorner(pos, corner, insideFence);
      const innerCorner = hasInnerCorner(map, pos, corner, char);
      return miniSides + Number(outterCorner || innerCorner);
    }, 0);
  }, 0);
}

const usedPos = new Set<string>();
const answer = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(''))
  .reduce((answer, row, i, map) => {
    const miniAnswer = row.reduce((miniTotal, _, j) => {
      const { area, perimeter, sides } = scanPlot(map, { row: i, col: j });
      miniTotal.part1 += area * perimeter;
      miniTotal.part2 += area * sides;
      return miniTotal;
    }, { part1: 0, part2: 0 });
    answer.part1 += miniAnswer.part1;
    answer.part2 += miniAnswer.part2;
    return answer;
  }, { part1: 0, part2: 0 })
);

console.log(answer.part1, [ 1930, 1533644 ].includes(answer.part1));
console.log(answer.part2, [ 1206, 936718 ].includes(answer.part2));

// ANSWER PART 1: 1533644
// ANSWER PART 2: 936718
