type Position = { row: number, col: number }
type Directions = 'R' | 'D' | 'L' | 'U'

const dirs: { [key in Directions]: Position } = {
  R: { row:  0, col:  1 },
  D: { row:  1, col:  0 },
  L: { row:  0, col: -1 },
  U: { row: -1, col:  0 },
};

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function posToStr(pos: Position) {
  return `${pos.row},${pos.col}`
}

function tracePath(dir: Position, max: number, path: Position[], current = 0) {
  if (max === current) return path;
  const nextPos = translatePos(path.slice(-1)[0], dir)
  return tracePath(
    dir,
    max,
    path.concat(nextPos),
    current + 1,
  )
}

const answers: Set<string>[] = [];
(await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .forEach(line => {
    const visited: Position[] = [ { row: 0, col: 0 } ];
    line.split(',').forEach(instruction => {
      const [ _, dir, amount ] = instruction.match(/([RDLU])(\d+)/)!
      const path = tracePath(dirs[dir as Directions], Number(amount), visited.slice(-1))
      visited.push(...path)
    })
    answers.push(new Set<string>(visited.map(posToStr)))
  })

const [ path1, path2 ] = answers
const intersections: number[] = []
path1.forEach(position => {
  if (path2.has(position)) {
    const [ distance1, distance2 ] = position.split(',').map(Number)
    intersections.push(Math.abs(distance1) + Math.abs(distance2))
  }
})
const part1 = intersections.toSorted((a, b) => a - b)[1]
console.log(part1, [ 6, 159, 135, 489 ].includes(part1))
