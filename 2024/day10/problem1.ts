type Position = { row: number, col: number }

const directions: ((pos: Position) => Position)[] = [
  (pos) => ({ row: pos.row + 1, col: pos.col }),
  (pos) => ({ row: pos.row - 1, col: pos.col }),
  (pos) => ({ row: pos.row, col: pos.col + 1}),
  (pos) => ({ row: pos.row, col: pos.col - 1}),
]

function findTrailHeads(data: number[][]) {
  return data.reduce((trailheads, row, i) => {
    return trailheads.concat(
      row.reduce((miniTrailheads, cell, j) => {
        return cell === 0 ? miniTrailheads.concat({ row: i, col: j }) : miniTrailheads
      }, [] as Position[])
    )
  }, [] as Position[])
}

function tracePath(data: number[][], pos: Position, usedPos = new Set<string>()): Set<string> {
  const val = data[pos.row][pos.col];
  if (val === 9) return usedPos.add(`${pos.row},${pos.col}`)
  return directions.reduce((usedPos, dir) => {
    const newPos = dir(pos)
    if (data?.[newPos.row]?.[newPos.col] - val === 1) {
      return tracePath(data, newPos, usedPos)
    }
    return usedPos
  }, usedPos)
}

function part1(data: number[][]) {
  return findTrailHeads(data).reduce((total, trailhead) => {
    return total + tracePath(data, trailhead).size
  }, 0)
}

const data = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split('').map(Number))
)

const part1Answer = part1(data)
console.log(part1Answer, [ 1, 36, 746 ].includes(part1Answer))

// ANSWER PART 1: 746
