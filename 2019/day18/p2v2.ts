type Position = { row: number, col: number }
type GridStateV3 = { pos: Position[], steps: number, keys: Set<string> }

const directions = [
  { row:  0, col:  1 },
  { row: -1, col:  0 },
  { row:  0, col: -1 },
  { row:  1, col:  0 },
]

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

function getMaxKeyCount(grid: string[][]) {
  return grid.reduce((total, row) => {
    return total + row.reduce((miniTotal, cell) => {
      return miniTotal + Number(charIsKey(cell))
    }, 0)
  }, 0)
}

function availableKeys(
  grid: string[][],
  queue: GridStateV3[],
  seen = new Set<string>(),
  answers: GridStateV3[] = []
) {
  const current = queue.shift()!
  if (!current) return answers
  current.pos.forEach(pos => {
    const char = charAtPos(grid, pos)
    if (charIsDoor(char) && !current.keys.has(char.toLowerCase())) {
      return
    }
    if (charIsKey(char) && !current.keys.has(char)) {
      return answers.push({
        ...current,
        keys: new Set(current.keys).add(char)
      })
    }
    directions.forEach(dir => {
      const newPos = translatePos(pos, dir)
      const newChar = charAtPos(grid, newPos)
      if (!newChar || newChar === '#') return
      const newPosStr = JSON.stringify(newPos)
      if (seen.has(newPosStr)) return
      seen.add(newPosStr)
      queue.push({
        pos: current.pos.filter(other => other !== pos).concat(newPos),
        steps: current.steps + 1,
        keys: current.keys,
      })
    })
  })
  return availableKeys(grid, queue, seen, answers)
}

function getBitMask(state: GridStateV3, maxKeyCount: number) {
  const keys = Array(maxKeyCount).fill(0)
  state.keys.forEach(key => keys[key.charCodeAt(0) - 97] = 1)
  return `${JSON.stringify(state.pos)},${keys.join('')}`
}

const set = new Set<string>()
function bfs(
  grid: string[][],
  queue: GridStateV3[],
  maxKeyCount: number,
  best: number = Infinity
) {
  const current = queue.shift()
  if (!current) return best

  console.log(current.steps)
  if (current.keys.size === maxKeyCount) {
    return current.steps
    // best = current.steps
    // return bfs(grid, queue, maxKeyCount, best)
  }
  const setStr = getBitMask(current, maxKeyCount)
  if (set.has(setStr)) return bfs(grid, queue, maxKeyCount, best)
  set.add(setStr)

  const newGridStates = availableKeys(grid, [ current ])
  return bfs(
    grid,
    queue.concat(newGridStates).toSorted((a, b) => a.steps - b.steps),
    maxKeyCount,
    best
  )
}

function getBitMaskV2(gridState: GridStateV3, maxKeyCount: number) {
  let keyMask = 0n;
  gridState.keys.forEach(key => {
    keyMask |= (1n << BigInt(key.charCodeAt(0) - 97));
  });

  // Convert positions into a bitmask (stored in upper bits)
  let posMask = 0n;
  gridState.pos.forEach(pos => {
    const bitIndex = pos.row * gridWidth + pos.col;
    posMask |= (1n << BigInt(maxKeyCount + bitIndex));  // Shift beyond keyMask bits
  });

  // Merge keyMask and posMask into a single unique bigint
  return (keyMask | posMask).toString();
}

function getBitMaskV3(gridState: GridStateV3, maxKeyCount: number) {
  // const keyMask = Array(maxKeyCount).fill(0)
  let keyMask = 0
  gridState.keys.forEach(key => {
    // keyMask[key.charCodeAt(0) - 97] = 1
    keyMask |= key.charCodeAt(0) - 97
  })

  const posMask = gridState.pos.reduce((posMask, pos) => {
    return posMask + pos.row.toString().padStart(digitSize.height, '0') + pos.col.toString().padStart(digitSize.width, '0')
  }, '')

  // return keyMask.join('') + posMask
  return keyMask + posMask
}

const simpleCache: Record<string, number> = {}
let simpleBest = Infinity
function dfsSimple(
  grid: string[][],
  gridState: GridStateV3,
  maxKeyCount: number
): number {
  // const cacheStr = getBitMask(gridState, maxKeyCount)
  // const startMaskTime = Bun.nanoseconds()
  const cacheStr = getBitMaskV2(gridState, maxKeyCount)
  // const cacheStr = getBitMaskV3(gridState, maxKeyCount)
  // console.write(`\rRun time: ${(Bun.nanoseconds() - startTime) / 10**9}`)
  if (gridState.keys.size === maxKeyCount) {
    if (gridState.steps < simpleBest) simpleBest = gridState.steps
    return gridState.steps
  }
  if (simpleCache[cacheStr]) {
    const shortCutResult = gridState.steps + simpleCache[cacheStr]
    if (shortCutResult < simpleBest) simpleBest = shortCutResult
    return shortCutResult
  }
  const nextGridStates = availableKeys(grid, [ gridState ])
  const result = nextGridStates.reduce((lowest, gridState) => {
    if (gridState.steps > simpleBest) return lowest
    return Math.min(dfsSimple(grid, gridState, maxKeyCount), lowest)
  }, Infinity)
  simpleCache[cacheStr] = result - gridState.steps
  return result
}

const bfsCache: Record<string, number> = {}
let bfsBest = Infinity
function bfsSimple(
  grid: string[][],
  queue: GridStateV3[],
  maxKeyCount: number,
) {
  const current = queue.shift()
  if (!current) return bfsBest
  const cacheStr = getBitMaskV2(current, maxKeyCount)
  if (current.steps > bfsBest) return bfsSimple(grid, queue, maxKeyCount)
  if (current.steps >= bfsCache[cacheStr]) return bfsSimple(grid, queue, maxKeyCount)
  bfsCache[cacheStr] = current.steps
  if (current.keys.size === maxKeyCount) {
    console.log('found', current.steps)
    if (current.steps < bfsBest) bfsBest = current.steps
    return bfsSimple(grid, queue, maxKeyCount)
  }

  const nextGridStates = availableKeys(grid, [ current ])
  return bfsSimple(
    grid,
    // queue.concat(nextGridStates).toSorted((a, b) => a.steps - b.steps),
    queue.concat(nextGridStates),
    maxKeyCount,
  )
}

function modifyGrid(grid: string[][], pos: Position, char: string) {
  return grid.with(pos.row, grid[pos.row].with(pos.col, char))
}

function splitGrid(grid: string[][]) {
  const tempStart = findMultiple(grid, '@')!
  let newGrid = grid
  if (tempStart.length === 1) {
    const startPos = tempStart[0]
    newGrid = directions.reduce((newGrid, dir, i) => {
      let tempGrid = modifyGrid(newGrid, translatePos(startPos, dir), '#')
      const nextDir = directions[(i + 1) % directions.length]
      const diagonal = translatePos(dir, nextDir)
      tempGrid = modifyGrid(tempGrid, translatePos(startPos, diagonal), '@')
      return tempGrid
    }, grid)
    newGrid = modifyGrid(newGrid, startPos, '#')
  }
  return newGrid
}

function printGrid(grid: string[][], state: GridStateV3) {
  const updatedGrid = grid.map((row, i) => {
    return row.map((cell, j) => {
      if (cell === '@') return '.'
      const foundPos = state.pos.find(pos => pos.row === i && pos.col === j)
      if (foundPos) return '@'
      if (state.keys.has(cell.toLowerCase())) return '.'
      return cell
    })
  })
  updatedGrid.forEach(row => console.log(row.join('')))
}

const startTime = Bun.nanoseconds()
const grid = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(row => row.split(''))
)

const initialStatePart1 = {
  pos: findMultiple(grid, '@'),
  steps: 0,
  keys: new Set<string>(),
}
const keyCount = getMaxKeyCount(grid)
const gridHeight = grid.length
const gridWidth = grid[0].length
const digitSize = { height: gridHeight.toString().length, width: gridWidth.toString().length }
let maskTime = 0
// const part1 = bfs(grid, [ initialStatePart1 ], keyCount)
// const part1 = dfs(grid, initialStatePart1, keyCount)
const part1 = dfsSimple(grid, initialStatePart1, keyCount)
// const part1 = bfsSimple(grid, [ initialStatePart1 ], keyCount)
console.log(part1, [ 8, 86, 132, 136, 81, 3866 ].includes(part1))

const newGrid = splitGrid(grid)
const initialStatePart2 = {
  pos: findMultiple(newGrid, '@'),
  steps: 0,
  keys: new Set<string>(),
}
// const part2 = bfs(newGrid, [ initialStatePart2 ], getMaxKeyCount(newGrid))
const part2 = dfsSimple(newGrid, initialStatePart2, getMaxKeyCount(newGrid))
console.log(part2, [ 8, 24, 32, 72, 1842 ].includes(part2))
// console.log('cache size', Object.keys(simpleCache).length)

console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
