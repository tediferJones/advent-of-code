type Position = { row: number, col: number }
type Grid = string[][]
type GridState = { grid: Grid, steps: number }
type KeyPath = { pos: Position, steps: number }
type AvailableKey = KeyPath & { key: string }

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

function availableKeys(
  grid: string[][],
  queue: KeyPath[],
  seen = new Set<string>(),
  keys: AvailableKey[] = []
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

function updateGrid(
  grid: string[][],
  key: string,
  playerPos: Position,
  newPlayerPos: Position
) {
  let newGrid = grid
  newGrid = modifyGrid(newGrid, playerPos, '.')
  newGrid = modifyGrid(newGrid, newPlayerPos, '@')
  // if door exists, remove it
  const doorPos = posAtChar(newGrid, key.toUpperCase())
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

function processQuadrants(gridStates: GridState[], positions: Position[]) {
  if (positions.length === 0) return gridStates
  const newGrids = gridStates.map(({ grid, steps }) => {
    const pos = positions[0]
    const available = availableKeys(grid, [{ pos, steps: 0 }])
    return available.map(newPos => ({
      grid: updateGrid(grid, newPos.key, pos, newPos.pos),
      steps: steps + newPos.steps
    }))
  }).flat()
  return processQuadrants(newGrids, positions.slice(1))
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

const cacheV3: Record<string, number> = {}
function pathLengths(grid: Grid, steps = 0, isFirst?: true): number {
  const cacheStr = JSON.stringify(grid)
  if (cacheV3[cacheStr]) return cacheV3[cacheStr]
  if (allKeysCollected(grid)) return cacheV3[cacheStr] = steps
  const starts = findMultiple(grid, '@')

  let gridStates
  if (starts.length === 1) {
    gridStates = processQuadrants([{ grid, steps: 0 }], [ starts[0] ])
  } else {
    const knownBad: string[] = []
    gridStates = combinations.map(combo => {
      if (isBad(knownBad, combo.join(','))) return []
      const posOrder = combo.map(i => starts[i])
      const newGrids = processQuadrants([{ grid, steps: 0 }], posOrder)
      if (newGrids.length === 0) knownBad.push(combo.join(','))
      return newGrids
    }).flat()
  }

  // best state is always the first one, but only if isFirst is true,
  // this is almost certainly a coincidence
  // gridState = (isFirst ? [ gridStates[0] ]  : gridStates)

  const result = gridStates.reduce((lowest, gridState, i) => {
    const totalSteps = gridState.steps + pathLengths(gridState.grid, steps)
    if (isFirst) console.log(
      i + 1,
      gridStates.length,
      totalSteps, lowest,
      'BEST', Math.min(totalSteps, lowest),
      'TIME', (Bun.nanoseconds() - startTime) / 10**9
    )
    return totalSteps < lowest ? totalSteps : lowest
  }, Infinity)
  return cacheV3[cacheStr] = result
}

function allKeysCollected(grid: string[][]) {
  return !grid.flat().filter(char => ![ '#', '.', '@' ].includes(char)).length
}

function isBad(knownBad: string[], check: string) {
  return knownBad.some(bad => bad.slice(0, check.length) === check)
    || knownBad.some(bad => bad === check.slice(0, bad.length))
}

// This function is brought to you by chatGPT
function getAllCombinations<T>(array: T[]): T[][] {
  const results: T[][] = [];

  function generateCombinations(current: T[], remaining: T[]): void {
    if (current.length > 0) {
      results.push(current);
    }

    remaining.forEach((element, index) => {
      const nextCurrent = [...current, element];
      const nextRemaining = remaining.filter((_, i) => i !== index);
      generateCombinations(nextCurrent, nextRemaining);
    });
  }

  generateCombinations([], array);
  return results;
}

const combinations = getAllCombinations([0, 1, 2, 3])
combinations.sort((a, b) => a.length - b.length)

const startTime = Bun.nanoseconds()
const grid = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(row => row.split(''))
)

// START TESTING
type GridStateV2 = { grid: Grid, steps: number, keys: string[] }
// const keysCache: Record<string, GridStateV2[]> = {}
const keysCache: Record<string, GridStateV2[]> = {}
function processQuadrantsV2(gridStates: GridStateV2[], positions: Position[]): GridStateV2[] {
  // const tempCacheStr = JSON.stringify(gridStates)
  // if (keysCache[tempCacheStr]) {
  //   return keysCache[tempCacheStr]
  // }
  if (positions.length === 0) {
    return gridStates
  }
  const newGrids = gridStates.map(({ grid, steps, keys }) => {
    const cacheStr = JSON.stringify(grid)

    // TESTING
    // const pos = positions[0]
    // let available
    if (keysCache[cacheStr]) {
      throw Error('found recycable cache str')
      return keysCache[cacheStr]
    }
    // else {
    //   const tempTime = Bun.nanoseconds()
    //   available = availableKeys(grid, [{ pos, steps: 0 }])
    //   availableKeysTime += Bun.nanoseconds() - tempTime
    // }

    // WORKING
    const pos = positions[0]
    const tempTime = Bun.nanoseconds()
    const available = availableKeys(grid, [{ pos, steps: 0 }])
    availableKeysTime += Bun.nanoseconds() - tempTime

    const gridModStart = Bun.nanoseconds()
    const result = available.map(newPos => ({
      grid: updateGrid(grid, newPos.key, pos, newPos.pos),
      steps: steps + newPos.steps,
      keys: keys.concat(newPos.key)
    }))
    gridModTime += Bun.nanoseconds() - gridModStart
    keysCache[cacheStr] = result
    return result
  }).flat()
  const result = processQuadrantsV2(newGrids, positions.slice(1))
  // keysCache[tempCacheStr] = result
  return result
}

const cacheV4: Record<string, number> = {}
const miniCache: Record<string, number> = {}
function pathLengthsV2(grid: Grid, steps = 0, keys = [] as string[], isFirst?: true, depth = 0): number {
  const cacheStr = JSON.stringify(grid)
  if (cacheV4[cacheStr]) return cacheV4[cacheStr]
  const starts = findMultiple(grid, '@')
  if (allKeysCollected(grid)) return cacheV4[cacheStr] = steps
  // if (allKeysCollected(grid)) return steps

  let gridStates
  if (starts.length === 1) {
    gridStates = processQuadrantsV2([{ grid, steps: 0, keys }], [ starts[0] ])
  } else {
    const knownBad: string[] = []
    gridStates = combinations.map(combo => {
      if (isBad(knownBad, combo.join(','))) return []
      const posOrder = combo.map(i => starts[i])
      const newGrids = processQuadrantsV2([{ grid, steps: 0, keys }], posOrder)
      if (newGrids.length === 0) knownBad.push(combo.join(','))
      return newGrids
    }).flat()
  }

  // best state is always the first one, but only if isFirst is true,
  // this is almost certainly a coincidence
  // gridState = (isFirst ? [ gridStates[0] ] : gridStates)

  const result = gridStates.reduce((lowest, gridState, i) => {
    // TESTING, turbo mode
    let totalSteps;
    if (miniCache[cacheStr]) {
      // console.log(cacheV4[testStr])
      console.log('miniCache', miniCache[cacheStr])
      totalSteps = gridState.steps + miniCache[cacheStr]
    } else {
      const result = pathLengthsV2(gridState.grid, steps, gridState.keys, undefined, depth + 1)
      totalSteps = gridState.steps + result
      miniCache[cacheStr] = result
    }

    // WORKING
    // const totalSteps = gridState.steps + pathLengthsV2(gridState.grid, steps, gridState.keys, undefined, depth + 1)

    if (isFirst) console.log(
      i + 1,
      gridStates.length,
      totalSteps, lowest,
      'BEST', Math.min(totalSteps, lowest),
      'TIME', (Bun.nanoseconds() - startTime) / 10**9
    )
    return totalSteps < lowest ? totalSteps : lowest
  }, Infinity)
  return cacheV4[cacheStr] = result
}
function pathLengthsV3(grid: Grid, steps = 0, keys = [] as string[], isFirst?: true, depth = 0): number {
  const cacheStr = JSON.stringify(grid)
  // if (cacheV4[cacheStr]) return cacheV4[cacheStr]
  const starts = findMultiple(grid, '@')
  if (allKeysCollected(grid)) return cacheV4[cacheStr] = steps
  // if (allKeysCollected(grid)) return steps

  let gridStates
  if (starts.length === 1) {
    gridStates = processQuadrantsV2([{ grid, steps: 0, keys }], [ starts[0] ])
  } else {
    const knownBad: string[] = []
    gridStates = combinations.map(combo => {
      if (isBad(knownBad, combo.join(','))) return []
      const posOrder = combo.map(i => starts[i])
      const newGrids = processQuadrantsV2([{ grid, steps: 0, keys }], posOrder)
      if (newGrids.length === 0) knownBad.push(combo.join(','))
      return newGrids
    }).flat()
  }

  // best state is always the first one, but only if isFirst is true,
  // this is almost certainly a coincidence
  // gridState = (isFirst ? [ gridStates[0] ]  : gridStates)

  const result = gridStates.reduce((lowest, gridState, i) => {
    // TESTING, turbo mode
    // let totalSteps;
    // if (miniCache[cacheStr]) {
    //   // console.log(cacheV4[testStr])
    //   console.log('miniCache', miniCache[cacheStr])
    //   totalSteps = gridState.steps + miniCache[cacheStr]
    // } else {
    //   const result = pathLengthsV2(gridState.grid, steps, gridState.keys, undefined, depth + 1)
    //   totalSteps = gridState.steps + result
    //   miniCache[cacheStr] = result
    // }

    // WORKING
    const totalSteps = pathLengthsV2(gridState.grid, gridState.steps, gridState.keys, undefined, depth + 1)

    if (isFirst) console.log(
      i + 1,
      gridStates.length,
      totalSteps, lowest,
      'BEST', Math.min(totalSteps, lowest),
      'TIME', (Bun.nanoseconds() - startTime) / 10**9
    )
    return totalSteps < lowest ? totalSteps : lowest
  }, Infinity)
  return cacheV4[cacheStr] = result
}

const cache9001: Record<string, number> = {}
function pathLengthsV4(gridState: GridStateV2, best = Infinity, isFirst?: true): number {
  const cacheStr = JSON.stringify(gridState.grid)
  if (gridState.steps > best) return Infinity
  if (cache9001[cacheStr]) {
    return gridState.steps + cache9001[cacheStr]
  }
  if (gridState.keys.length === maxKeys) {
    return gridState.steps
  }
  const starts = findMultiple(gridState.grid, '@')

  const gridGenStartTime = Bun.nanoseconds()
  let gridStates
  if (starts.length === 1) {
    gridStates = processQuadrantsV2([ gridState ], [ starts[0] ])
  } else {
    throw Error('shouldnt be here unless running part 2')
    const knownBad: string[] = []
    gridStates = combinations.map(combo => {
      if (isBad(knownBad, combo.join(','))) return []
      const posOrder = combo.map(i => starts[i])
      const newGrids = processQuadrantsV2([ gridState ], posOrder)
      if (newGrids.length === 0) knownBad.push(combo.join(','))
      return newGrids
    }).flat()
  }
  generateGridsTime += Bun.nanoseconds() - gridGenStartTime
  // console.log('output grids')
  // gridStates.forEach(gridState => printGrid(gridState.grid))

  const result = gridStates.reduce((lowest, miniGridState, i) => {
    // const miniCacheStr = JSON.stringify(miniGridState.grid)
    const totalSteps = pathLengthsV4(miniGridState, best)
    // let totalSteps
    // if (cache9001[miniCacheStr]) {
    //   totalSteps = miniGridState.steps + cache9001[miniCacheStr]
    // } else {
    //   totalSteps = pathLengthsV4(miniGridState, best)
    // }
    // if (totalSteps < best) best = totalSteps
    if (isFirst) console.log(
      i + 1,
      gridStates.length,
      totalSteps, lowest,
      'BEST', Math.min(totalSteps, lowest),
      'TIME', (Bun.nanoseconds() - startTime) / 10**9
    )
    return Math.min(lowest, totalSteps)
  }, Infinity)
  cache9001[cacheStr] = result - gridState.steps
  return result
}

function insertSorted(queue: GridStateV2[], toAdd: GridStateV2[], i = 0) {
  if (!toAdd.length) return queue
  if (!queue[i]) return queue.concat(toAdd)
  if (queue[i].steps > toAdd[0].steps) {
    return insertSorted(queue.toSpliced(i, 0, toAdd[0]), toAdd.slice(1), i)
  }
  return insertSorted(queue, toAdd, i + 1)
}

function getBitMask(keys: string[], pos: Position) {
  const keyMask = Array(maxKeys).fill(0)
  keys.forEach(key => {
    // 97 is ascii for 'a', thus a = 0, b = 1, etc...
    const keyCode = key.charCodeAt(0) - 97
    keyMask[keyCode] = 1
  })
  return Number(`0b${pos.row.toString(2)}${pos.col.toString(2)}${keyMask.join('')}`)
}

const bfsSet = new Set<number>()
function gridBfs(queue: GridStateV2[]) {
  const current = queue.shift()
  if (!current) return Infinity
  const starts = findMultiple(current.grid, '@')
  const cacheStr = getBitMask(current.keys, starts[0])
  if (bfsSet.has(cacheStr)) return gridBfs(queue)
  bfsSet.add(cacheStr)
  // console.log(current.steps)
  if (current.keys.length === maxKeys) return current.steps

  let nextGridStates: GridStateV2[]
  if (starts.length === 1) {
    nextGridStates = processQuadrantsV2([ current ], [ starts[0] ])
  } else {
    const knownBad: string[] = []
    nextGridStates = combinations.map(combo => {
      if (isBad(knownBad, combo.join(','))) return []
      const posOrder = combo.map(i => starts[i])
      const newGrids = processQuadrantsV2([ current ], posOrder)
      if (newGrids.length === 0) knownBad.push(combo.join(','))
      return newGrids
    }).flat()
  }

  // return gridBfs(insertSorted(queue, nextGridStates))
  // queue.push(...nextGridStates)
  // return gridBfs(queue)
  return gridBfs(
    queue.concat(nextGridStates).toSorted((a, b) => a.steps - b.steps)
  )
}

// END TESTING

// TO-DO
// re-write that ugly chatGPT function
//
// Ideas for further optimization
// faster way to recognize a unique graph,
//  - JSON.stringify is responsible for about 25% of the total runtime
//  - try making cache key from current position and available keys
// try to memoize availableKeys()
//  - this function is responsble for about 75% of the total runtime
//
// Two ideas:
// currently steps is always 0 and we accumulate as we go back up the tree
//  - we should accumulate as we go down the tree
//  - once no keys remain, set that value to a global best variable,
//    - then for each level of the tree, check if current steps > best, if it is skip, its already too long
// look at turbo mode in pathLengthsV2, this seems to provide massive improvements, and is only off by a little bit
//
// NEW IDEA: do bfs instead of dfs
//  - in addition, maybe sort by least number of steps
//  - dont modify grid, track keys and current position
//    - availableKeys() will need to be modified so that we can pass through doors if we have the key

let availableKeysTime = 0
let generateGridsTime = 0
let gridModTime = 0
const maxKeys = grid.reduce((total, row) => {
  return total + row.reduce((miniTotal, cell) => {
    return miniTotal + Number(charIsKey(cell))
  }, 0)
}, 0)
console.log(maxKeys)
// const part1 = pathLengths(grid, 0, true)
// const part1 = pathLengthsV2(grid, 0, [], true)
// const part1 = pathLengthsV3(grid, 0, [], true)
// const part1 = pathLengthsV4({ grid, steps: 0, keys: [] }, Infinity, true)
const part1 = gridBfs([{ grid, steps: 0, keys: [] }])
console.log(part1, [ 8, 86, 132, 136, 81, 3866 ].includes(part1))
console.log('availableKeys time', availableKeysTime / 10**9)
console.log('gridMod time', gridModTime / 10**9)
// console.log('generateGrids time', generateGridsTime / 10**9)
// Object.keys(cache9001).forEach(key => {
//   console.log(cache9001[key])
//   printGrid(JSON.parse(key))
// })
// console.log(Object.values(cache9001).map(idk => idk.endSteps))

// const part2 = pathLengths(splitGrid(grid), 0, true)
// const part2 = pathLengthsV2(splitGrid(grid), 0, [], true)
// const part2 = gridBfs([{ grid: splitGrid(grid), steps: 0, keys: [] }])
// console.log(part2, [ 8, 24, 32, 72, 1842 ].includes(part2))

console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
