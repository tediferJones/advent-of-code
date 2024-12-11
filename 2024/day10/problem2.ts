type Position = { row: number, col: number }

const directions: ((pos: Position) => Position)[] = [
  (pos) => ({ row: pos.row + 1, col: pos.col }),
  (pos) => ({ row: pos.row - 1, col: pos.col }),
  (pos) => ({ row: pos.row, col: pos.col + 1 }),
  (pos) => ({ row: pos.row, col: pos.col - 1 }),
];

function findTrailHeads(data: number[][]) {
  return data.reduce((trailheads, row, i) => {
    return trailheads.concat(
      row.reduce((miniTrailheads, cell, j) => {
        return cell === 0 ? miniTrailheads.concat({ row: i, col: j }) : miniTrailheads;
      }, [] as Position[])
    );
  }, [] as Position[]);
}

function tracePathPart1(data: number[][], pos: Position, usedPos = new Set<string>()): Set<string> {
  const val = data[pos.row][pos.col];
  if (val === 9) return usedPos.add(`${pos.row},${pos.col}`);
  return directions.reduce((usedPos, dir) => {
    const newPos = dir(pos);
    const nextPosIsValid = data?.[newPos.row]?.[newPos.col] - val === 1;
    return nextPosIsValid ? tracePathPart1(data, newPos, usedPos) : usedPos;
  }, usedPos);
}

function tracePathPart2(data: number[][], pos: Position): number {
  const val = data[pos.row][pos.col];
  if (val === 9) return 1;
  return directions.reduce((total, dir) => {
    const newPos = dir(pos);
    const nextPosIsValid = data?.[newPos.row]?.[newPos.col] - val === 1;
    return nextPosIsValid ? total + tracePathPart2(data, newPos) : total;
  }, 0)
}

const data = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split('').map(Number))
);

const part1Answer = (
  findTrailHeads(data).reduce((total, trailhead) => {
    return total + tracePathPart1(data, trailhead).size
  }, 0)
);
const part2Answer = (
  findTrailHeads(data).reduce((total, trailhead) => {
    return total + tracePathPart2(data, trailhead)
  }, 0)
);

console.log(part1Answer, [ 36, 746 ].includes(part1Answer));
console.log(part2Answer, [ 81, 1541 ].includes(part2Answer));

// ANSWER PART 1: 746
// ANSWER PART 2: 1541
