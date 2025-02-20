import { stat } from "node:fs"

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
let simpleAvg = Infinity
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
    if (gridState.steps < simpleBest) {
      simpleBest = gridState.steps
      simpleAvg = gridState.steps / maxKeyCount
    }
    return gridState.steps
  }
  if (simpleCache[cacheStr]) {
    const shortCutResult = gridState.steps + simpleCache[cacheStr]
    if (shortCutResult < simpleBest) simpleBest = shortCutResult
    return shortCutResult
  }
  const nextGridStates = availableKeys(grid, [ gridState ])
  const result = nextGridStates.reduce((lowest, gridState) => {
    // if (gridState.steps / gridState.keys.size > simpleAvg) return lowest
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

const keyCount = getMaxKeyCount(grid)
const gridHeight = grid.length
const gridWidth = grid[0].length
const digitSize = { height: gridHeight.toString().length, width: gridWidth.toString().length }

// const initialStatePart1 = {
//   pos: findMultiple(grid, '@'),
//   steps: 0,
//   keys: new Set<string>(),
// }
// // const part1 = bfs(grid, [ initialStatePart1 ], keyCount)
// // const part1 = dfs(grid, initialStatePart1, keyCount)
// const part1 = dfsSimple(grid, initialStatePart1, keyCount)
// // const part1 = bfsSimple(grid, [ initialStatePart1 ], keyCount)
// console.log(part1, [ 8, 86, 132, 136, 81, 3866 ].includes(part1))
// 
// const newGrid = splitGrid(grid)
// const initialStatePart2 = {
//   pos: findMultiple(newGrid, '@'),
//   steps: 0,
//   keys: new Set<string>(),
// }
// // const part2 = bfs(newGrid, [ initialStatePart2 ], getMaxKeyCount(newGrid))
// const part2 = dfsSimple(newGrid, initialStatePart2, getMaxKeyCount(newGrid))
// console.log(part2, [ 8, 24, 32, 72, 1842 ].includes(part2))
// 
// console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)

// Start at last key (or '@' if there is are no keys)
// get step count for all available keys from start pos

type GridStateV4 = { pos: Position, steps: number, reqKeys: string[] }
type DestKeys = Record<string, { steps: number, reqKeys: string[] }> 
function availableKeysV2(
  queue: GridStateV4[],
  seen = new Set<string>(queue.map(state => JSON.stringify(state.pos))),
  keys: DestKeys = {}
) {
  const current = queue.shift()
  if (!current) return keys
  const pos = current.pos
  const char = grid[pos.row][pos.col]
  if (!char) throw Error('no char')
  if (charIsKey(char)) {
    if (current.steps) {
      keys[char] = {
        steps: current.steps,
        reqKeys: current.reqKeys
      }
    }
  }
  directions.forEach(dir => {
    const newPos = translatePos(pos, dir)
    const newChar = charAtPos(grid, newPos)
    if (newChar === '#') return
    const newPosStr = JSON.stringify(newPos)
    if (seen.has(newPosStr)) return
    seen.add(newPosStr)

    if (charIsDoor(newChar)) {
      queue.push({
        pos: newPos,
        steps: current.steps + 1,
        reqKeys: current.reqKeys.concat(newChar.toLowerCase())
      })
    } else {
      queue.push({
        pos: newPos,
        steps: current.steps + 1,
        reqKeys: current.reqKeys
      })
    }
  })
  return availableKeysV2(queue, seen, keys)
}

function getKeyPos(grid: string[][]) {
  return grid.reduce((keyPos, row, i) => {
    return {
      ...keyPos,
      ...row.reduce((positions, cell, j) => {
        if (cell === '@' || charIsKey(cell)) positions[cell] = { row: i, col: j }
        return positions
      }, {} as Record<string, Position>)
    }
  }, {} as Record<string, Position>)
}

const keyPositions = getKeyPos(grid)
// console.log(keyPositions)

type Paths = Record<string, DestKeys>
const paths = Object.keys(keyPositions).reduce((paths, key) => {
  paths[key] = availableKeysV2([{
    pos: keyPositions[key],
    steps: 0,
    reqKeys: []
  }])
  return paths
}, {} as Paths)
// console.log(paths)

type PathState = { keys: string[], steps: number }
// const graphSet = new Set<string>()
const graphCache: Record<string, number> = {}
let best = Infinity;
function bfsPaths(queue: PathState[]) {
  const current = queue.shift()
  if (!current) return
  if (current.steps > best) return bfsPaths(queue)
  console.log(current.steps, queue.length)
  if (current.keys.length === keyCount) {
    best = current.steps
    return bfsPaths(queue)
  }
  const posChar = current.keys[current.keys.length - 1] || '@'
  const cacheKey = `${posChar},${current.keys.toSorted()}`
  // if (graphSet.has(cacheKey)) return bfsPaths(queue)
  // graphSet.add(cacheKey)
  if (current.steps >= graphCache[cacheKey]) return bfsPaths(queue)
  graphCache[cacheKey] = current.steps
  const availableKeys = Object.keys(paths[posChar]).filter(key => {
    return paths[posChar][key].reqKeys.every(reqKey => current.keys.includes(reqKey)) && !current.keys.includes(key)
  })

  const newPaths = availableKeys.map(key => ({
    steps: paths[posChar][key].steps + current.steps,
    keys: current.keys.concat(key)
  }))

  return bfsPaths(queue.concat(newPaths))
  return bfsPaths(queue.concat(newPaths).toSorted((a, b) => {
    const stepDiff = a.steps - b.steps
    const keyDiff = b.keys.length - a.keys.length
    if (keyDiff) return keyDiff
    return stepDiff
  }))
}
// console.log(bfsPaths([{ keys: [], steps: 0 }]))

function pathsBitMask(state: PathState) {
  const posChar = state.keys[state.keys.length - 1] || '@'
  return `${posChar},${state.keys.toSorted()}`
}

const dfsPathsCache: Record<string, number> = {}
let dfsPathsBest = Infinity
function dfsPaths(state: PathState): number {
  const cacheKey = pathsBitMask(state)
  if (state.keys.length === keyCount) {
    console.log('found', state.steps)
    if (state.steps < dfsPathsBest) dfsPathsBest = state.steps
    return state.steps
  }
  if (dfsPathsCache[cacheKey]) {
    const shortCutResult = state.steps + dfsPathsCache[cacheKey]
    if (shortCutResult < dfsPathsBest) dfsPathsBest = shortCutResult
    return shortCutResult
  }
  const posChar = state.keys[state.keys.length - 1] || '@'
  const nextPaths = paths[posChar]
  const result = Object.keys(nextPaths)
  .filter(newKey => !state.keys.includes(newKey))
  .filter(newKey => nextPaths[newKey].reqKeys.every(reqKey => state.keys.includes(reqKey)))
  .reduce((best, newKey) => {
    const newState = {
      steps: state.steps + nextPaths[newKey].steps,
      keys: state.keys.concat(newKey)
    }
    if (newState.steps > dfsPathsBest) return best
    return Math.min(dfsPaths(newState), best)
  }, Infinity)
  dfsPathsCache[cacheKey] = result - state.steps
  return result
}

const part1 = dfsPaths({ keys: [], steps: 0 })
console.log(part1, [ 8, 86, 132, 136, 81, 3866 ].includes(part1))
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
