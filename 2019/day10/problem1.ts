type Char = '#' | '.'
type Position = { row: number, col: number }

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function getSlope(pos1: Position, pos2: Position) {
  const rise = pos1.row - pos2.row;
  const run = pos1.col - pos2.col;
  const gcdValue = gcd(rise, run);
  return `${rise / gcdValue}/${run / gcdValue}`;
}

function getAllPositions(asteroids: Char[][], char: Char) {
  return asteroids.reduce((positions, row, i) => {
    const cols = row.reduce((cols, cell, j) => {
      return cell === char ? cols.concat(j) : cols;
    }, [] as number[]).map(col => ({ row: i, col }));
    return positions.concat(cols);
  }, [] as Position[]);
}

function countVisible(pos: Position, others: Position[]) {
  const slopes = new Set<string>();
  const positions: (Position & { slope: string })[] = [];
  others.forEach(pos2 => {
    if (pos === pos2) return;
    const slope = getSlope(pos, pos2);
    if (!slopes.has(slope)) {
      slopes.add(slope);
      positions.push({ ...pos2, slope });
    }
  })
  return positions;
}

function findBestPosition(positions: Position[]) {
  return positions.reduce((best, pos) => {
    const visiblePositions = countVisible(pos, positions);
    const visible = visiblePositions.length;
    return visible > best.visible ? { visible, pos, visiblePositions } : best;
  }, { visible: 0, pos: {} as Position, visiblePositions: [] as Position[] });
}

const asteroids = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split('') as Char[])
);

const positions = getAllPositions(asteroids, '#');
const part1 = findBestPosition(positions).visible;
console.log(part1, [ 8, 33, 35, 41, 210, 274 ].includes(part1));
