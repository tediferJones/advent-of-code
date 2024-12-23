// Guide: https://www.reddit.com/r/adventofcode/comments/1hjx0x4/2024_day_21_quick_tutorial_to_solve_part_2_in/
type Position = { row: number, col: number }
type PathsObj = { [key: string]: string[] }
type Grid = (string|undefined)[][]
type Path = Position & { path: string }

const directions: { [key: string]: Position } = {
  '^': { row: -1, col: 0 },
  '>': { row: 0, col: 1 },
  'v': { row: 1, col: 0 },
  '<': { row: 0, col: -1 }
}

const numpad = [
  [ '7', '8', '9' ],
  [ '4', '5', '6' ],
  [ '1', '2', '3' ],
  [ undefined, '0', 'A' ]
]

const dirpad = [
  [ undefined, '^', 'A' ],
  [ '<', 'v', '>' ]
]

function allPaths(grid: (string|undefined)[][]) {
  const result: { [key: string]: string[] } = {}
  const digits = grid.flat().filter(Boolean)
  digits.forEach(digit1 => {
    digits.forEach(digit2 => {
      if (digit1 === digit2) {
        return result[`${digit1},${digit2}`] = ['A']
      }
      if (!digit1 || !digit2) return
      result[`${digit1},${digit2}`] = shortestPath(grid, getPos(grid, digit1), getPos(grid, digit2)).map(result => result.path.concat('A'))
    })
  })
  return result
}

function shortestPath(grid: Grid, start: Position, end: Position) {
  const queue = [{ ...start, path: '', visited: new Set<string>([ posToStr(start) ]) }]
  const endStr = posToStr(end)
  const answer: Path[] = []
  const maxDistance = Math.abs(start.row - end.row) + Math.abs(start.col - end.col)
  while (queue.length) {
    const current = queue.shift()!
    if (current.path.length > maxDistance) continue; 
    if (posToStr(current) === endStr) {
      answer.push(current)
      continue
    }
    Object.keys(directions).forEach(key => {
      const dir = directions[key]
      const newPos = translatePos(current, dir)
      if (!charAtPos(grid, newPos)) return
      if (current.visited.has(posToStr(newPos))) return
      queue.push({ ...newPos, path: current.path + key, visited: new Set(current.visited).add(posToStr(newPos)) })
    })
  }
  return answer
}

function getPos(grid: Grid, char: string) {
  const row = grid.findIndex(row => row.includes(char))
  const col = grid[row].findIndex(cell => cell === char)
  return { row, col }
}

function posToStr(pos: Position) {
  return `${pos.row},${pos.col}`
}

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col
  }
}

function charAtPos(grid: (string|undefined)[][], pos: Position) {
  return grid?.[pos.row]?.[pos.col]
}

function mergePaths(paths: string[][], result = ''): string[] {
  if (paths.length === 0) return [ result ]
  return paths[0]
    .map(path => mergePaths(paths.slice(1), result + path))
    .flat()
}

function findShortestPath(num: string, paths: PathsObj) {
  let prev = 'A'
  return num.split('').map(digit => {
    const temp = paths[`${prev},${digit}`]
    prev = digit
    return temp
  })
}

function findAndMerge(str: string, paths: string) {
  return mergePaths(findShortestPath(str, pathsLookup[paths]))
}

function getComplexity(num: string, maxDepth: number, depth = 0): number {
  if (depth === maxDepth) return num.length
  return findAndMerge(num, depth === 0 ? 'numpadPaths' : 'dirpadPaths')
    .map(path => getComplexity(path, maxDepth, depth + 1))
    .flat().toSorted((a, b) => a - b)[0]
}

// let timeSpent = 0;
const startTime = Bun.nanoseconds();
const pathsLookup: { [key: string]: PathsObj } = {
  numpadPaths: allPaths(numpad),
  dirpadPaths: allPaths(dirpad)
}
const answer = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .reduce((total, number) => {
    const result = getComplexity(number, 3) // .toSorted((a, b) => a - b)[0]
    console.log(number, result, parseInt(number))
    return total + parseInt(number) * result
  }, 0)
)
console.log(answer, [ 126384, 94284 ].includes(answer))
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
// console.log(`time spent finding/merging, ${timeSpent / 10**9}`)
