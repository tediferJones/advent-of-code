type Char = '#' | '.'
type Position = { row: number, col: number }

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function getSlope(pos1: Position, pos2: Position) {
  const rowDiff = pos1.row - pos2.row;
  const colDiff = pos1.col - pos2.col;
  const gcdValue = gcd(rowDiff, colDiff);
  return `${rowDiff / gcdValue}/${colDiff / gcdValue}`;
}

function getAllPositions(asteroids: Char[][], char: Char) {
  return asteroids.reduce((positions, row, i) => {
    return positions.concat(
      row.reduce((cols, cell, j) => {
        return cell === char ? cols.concat(j) : cols;
      }, [] as number[]).map(col => ({ row: i, col }))
    );
  }, [] as Position[]);
}

type PosAndSlope = Position & { slope: string }
function countVisible(pos: Position, others: Position[]) {
  const slopes = new Set<string>();
  return others.reduce((positions, pos2) => {
    if (pos !== pos2) {
      const slope = getSlope(pos, pos2);
      if (!slopes.has(slope)) {
        slopes.add(slope);
        positions.push({ ...pos2, slope });
      }
    }
    return positions;
  }, [] as PosAndSlope[]);
}

function findBestPosition(positions: Position[]) {
  return positions.reduce((best, pos) => {
    const visiblePositions = countVisible(pos, positions);
    const visible = visiblePositions.length;
    return visible > best.visible ? { visible, pos, visiblePositions } : best;
  }, { visible: 0, pos: {} as Position, visiblePositions: [] as Position[] });
}

function strToDec(pos: Position) {
  const { row, col } = pos;
  if (col === 0) return Infinity * -1;
  return row / col;
}

function posToSlopePos(positions: Position[], center: Position) {
  return positions.map(pos => {
    const str = getSlope(center, pos);
    const [ row, col ] = str.split('/').map(Number);
    return { row, col };
  });
}

function sortClockWise(slopes: Position[], count: number) {
  if (positions.length < count) {
    throw Error('count too big for positions');
  }

  const quadrands: ((pos: Position) => boolean)[] = [
    pos => pos.row >  0 && pos.col <  1, // quad 1, top right
    pos => pos.row <  1 && pos.col <  0, // quad 2, bottom right
    pos => pos.row <  0 && pos.col > -1, // quad 3, bottom left
    pos => pos.row > -1 && pos.col >  0, // quad 4, top left
  ];

  return quadrands.reduce((quads, quad) => {
    return quads.concat(
      slopes.filter(quad)
        .toSorted((a, b) => strToDec(a) - strToDec(b))
    );
  }, [] as Position[])[count - 1];
}

function findPosForSlope(
  positions: Position[],
  center: Position,
  slope: Position,
  count = 1,
): Position {
  const newPos = {
    row: center.row - (slope.row * count),
    col: center.col - (slope.col * count),
  }
  const found = positions.find(pos => pos.row === newPos.row && pos.col === newPos.col);
  return found || findPosForSlope(positions, center, slope, count + 1);
}

const asteroids = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split('') as Char[])
);

const positions = getAllPositions(asteroids, '#');
const bestPos = findBestPosition(positions);
const part1 = bestPos.visible;
console.log(part1, [ 8, 33, 35, 41, 210, 274 ].includes(part1));

// we assume the Nth position is within the first 'round'
// if this is not the case: 
//  - map through bestPos.visiblePositions
//    - modify the map by replacing each visiblePosition with a '.' char
//  - keep track of how many astroids have been destroyed (i.e. replaced with '.')
//  - repeat this process until astroidsDestroyed + visiblePositions > N
//    - if the above is true, N is within the current visiblePositions
//  - then do sortClockWise, with N - astroidsDestroyed as count
const desiredSlope = sortClockWise(
  posToSlopePos(bestPos.visiblePositions, bestPos.pos),
  200 // 200
);
const desiredPos = findPosForSlope(positions, bestPos.pos, desiredSlope)!;
const part2 = (desiredPos.col * 100) + desiredPos.row;
console.log(part2, [ 305 ].includes(part2));

// pos1 is always root position
// rowDiff = pos1.row - pos2.row
// colDiff = pos1.col - pos2.col
// slope is rowDiff / colDiff
// order:
// 1/0 & +/- = quad1
// 0/-1 & -/- = quad2
// -1/0 & -/+ = quad3
// 0/1 & +/+ = quad4
