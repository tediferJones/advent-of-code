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

// TO-DO
// re-write that ugly chatGPT function
//
// Ideas for further optimization
// faster way to recognize a unique graph, 
//  - JSON.stringify is responsible for about 25% of the total runtime
//  - try making cache key from current position and available keys
// try to memoize availableKeys()
//  - this function is responsble for about 75% of the total runtime

const part1 = pathLengths(grid, 0, true)
console.log(part1, [ 8, 86, 132, 136, 81, 3866 ].includes(part1))

const part2 = pathLengths(splitGrid(grid), 0, true)
console.log(part2, [ 8, 24, 32, 72, 1842 ].includes(part2))

console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
