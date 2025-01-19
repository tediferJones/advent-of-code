type Position = { row: number, col: number }

const directions = [
  { row:  0, col:  1 },
  { row: -1, col:  0 },
  { row:  0, col: -1 },
  { row:  1, col:  0 },
]

function posAtChar(grid: string[][], char: string) {
  const row = grid.findIndex(row => row.includes(char))
  if (row === -1) return
  const col = grid[row].findIndex(cell => cell === char)
  return { row, col }
}

function charAtPos(grid: string[][], pos: Position) {
  return grid?.[pos.row]?.[pos.col]
}

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function charIsDoor(char: string) {
  return 'A' <= char && char <= 'Z' 
}

function charIsKey(char: string) {
  return 'a' <= char && char <= 'z'
}

type KeyPath = { pos: Position, steps: number }
function availableKeys(
  grid: string[][],
  queue: KeyPath[],
  seen = new Set<string>(),
  keys: (KeyPath & { key: string })[] = []
) {
  if (!queue.length) return keys
  const current = queue.shift()!
  const char = charAtPos(grid, current.pos)
  if (charIsDoor(char)) {
    return availableKeys(grid, queue, seen, keys)
  }
  if (charIsKey(char)) {
    keys.push({ pos: current.pos, steps: current.steps, key: char })
    return availableKeys(grid, queue, seen, keys)
  }
  directions.forEach(dir => {
    const newPos = translatePos(current.pos, dir)
    const newChar = charAtPos(grid, newPos)
    if (newChar === '#') return
    const newPosStr = JSON.stringify(newPos)
    if (seen.has(newPosStr)) return
    seen.add(newPosStr)
    queue.push({
      pos: newPos,
      steps: current.steps + 1
    })
  })
  return availableKeys(grid, queue, seen, keys)
}

const cache: Record<string, number> = {}
function pathLengths(grid: string[][], pos: Position, steps = 0, keys = 0): number {
  const cacheStr = JSON.stringify(grid)
  if (cache[cacheStr]) return cache[cacheStr]
  const temp = availableKeys(grid, [{ pos, steps }])
  if (!temp.length) return steps
  const result = temp.reduce((lowest, path) => {
    const newGrid = updateGrid(grid, path.key, path.pos)
    const totalSteps = path.steps + pathLengths(newGrid, path.pos, steps, keys + 1)
    return totalSteps < lowest ? totalSteps : lowest
  }, Infinity)
  cache[cacheStr] = result
  return result
}

function updateGrid(grid: string[][], char: string, pos: Position) {
  let newGrid = grid

  // move player pos to key pos
  const playerPos = posAtChar(newGrid, '@')!
  newGrid = modifyGrid(newGrid, playerPos, '.')
  newGrid = modifyGrid(newGrid, pos, '@')

  // if door exists, remove it
  const doorPos = posAtChar(newGrid, char.toUpperCase())
  if (doorPos) newGrid = modifyGrid(newGrid, doorPos, '.')

  return newGrid
}

function modifyGrid(grid: string[][], pos: Position, char: string) {
  return grid.with(pos.row, grid[pos.row].with(pos.col, char))
}

function printGrid(grid: string[][]) {
  grid.forEach(row => console.log(row.join('')))
  console.log()
}

function solvePart1(grid: string[][]) {
  // printGrid(grid)
  const startPos = posAtChar(grid, '@')!
  // console.log(startPos)
  return pathLengths(grid, startPos, 0)
}

function findMultiple(grid: string[][], char: string) {
  return grid.reduce((pos, row, i) => {
    return pos.concat(
      row.reduce((miniPos, cell, j) => {
        if (cell === char) {
          return miniPos.concat({ row: i, col: j })
        }
        return miniPos
      }, [] as Position[])
    )
  }, [] as Position[])
}

function solvePart2(grid: string[][]) {
  printGrid(grid)
  const tempStart = findMultiple(grid, '@')!
  let newGrid = grid
  if (tempStart.length === 1) {
    const startPos = tempStart[0]
    newGrid = directions.reduce((newGrid, dir, i) => {
      let tempGrid = modifyGrid(newGrid, translatePos(startPos, dir), '#')
      const diagonal = translatePos(dir, directions[(i + 1) % directions.length]);
      tempGrid = modifyGrid(tempGrid, translatePos(startPos, diagonal), '@')
      return tempGrid
    }, grid)
    newGrid = modifyGrid(newGrid, startPos, '#')
  }
  printGrid(newGrid)
  const newStarts = findMultiple(newGrid, '@')
  console.log(newStarts)
  newStarts.forEach((start => {
    console.log(pathLengths(newGrid, start, 0))
    printGrid(newGrid)
  }))
}

const startTime = Bun.nanoseconds()
const grid = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(row => row.split(''))
)

const part1 = solvePart1(grid)
console.log(part1, [ 8, 86, 132, 136, 81, 3866 ].includes(part1))

// const part2 = solvePart2(grid)
// console.log(part2)

console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
