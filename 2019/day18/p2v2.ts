type Position = { row: number, col: number }
type GridStateV3 = { pos: Position[], steps: number, keys: Set<string> }

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
      // return availableKeys(grid, queue, seen, answers)
    }
    if (charIsKey(char) && !current.keys.has(char)) {
      return answers.push({
        ...current,
        keys: new Set(current.keys).add(char)
      })
      // return availableKeys(
      //   grid,
      //   queue,
      //   seen,
      //   answers.concat({
      //     ...current,
      //     keys: new Set(current.keys).add(char)
      //   })
      // )
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
  // return [ ...state.keys ].join(',')
  const keys = Array(maxKeyCount).fill(0)
  state.keys.forEach(key => keys[key.charCodeAt(0) - 97] = 1)
  return `${JSON.stringify(state.pos)},${keys.join('')}`
  // return keys.join('')
}

const set = new Set<string>()
const cache: Record<string, number> = {}
const cacheV2: Record<string, { steps: number, keyCount: number }> = {}
function shortestPath(
  grid: string[][],
  queue: GridStateV3[],
  maxKeyCount: number,
  best: number = Infinity
) {
  const masterKey = cache['1'.repeat(maxKeyCount)]
  const current = queue.shift()
  if (!current) {
    console.log(cache)
    return masterKey
  }
  // console.log(cache)
  // printGrid(grid, current)
  // console.write(`\rcurrent step count ${current.steps}`)
  // console.log(current)
  // console.log('queue length', queue.length)

  // Cache key is obtained keys, points to steps to get there
  // try to get this working with example2.txt
  // if (current.steps > masterKey) {
  //   console.log('skipping already found faster path', { current: current.steps, masterKey })
  //   return shortestPath(grid, queue, maxKeyCount, best)
  // }
  // const cacheStr = getBitMask(current, maxKeyCount)
  // // console.log(cacheStr)
  // if (current.steps > cache[cacheStr]) {
  //   // printGrid(grid, current)
  //   console.log('skipping already been here with less steps')
  //   return shortestPath(grid, queue, maxKeyCount, best)
  // }
  // cache[cacheStr] = current.steps

  // TESTING
  // if (current.keys.size === maxKeyCount) {
  //   if (current.steps < best) best = current.steps
  //   return shortestPath(grid, queue, maxKeyCount, best)
  // }
  // const cacheStr = JSON.stringify(current.pos)
  // if (cacheV2[cacheStr]) {
  //   const cached = cacheV2[cacheStr]
  //   // if (cached.steps <= current.steps && cached.keyCount >= current.keys.size) {
  //   //   return shortestPath(grid, queue, maxKeyCount, best)
  //   // }
  //   // if (cached.steps < current.steps) {
  //   //   return shortestPath(grid, queue, maxKeyCount, best)
  //   // }
  //   if (cached.keyCount > current.keys.size) {
  //     return shortestPath(grid, queue, maxKeyCount, best)
  //   }
  //   // if (cached.steps < current.steps || cached.keyCount > current.keys.size) {
  //   //   return shortestPath(grid, queue, maxKeyCount, best)
  //   // }
  // }
  // cacheV2[cacheStr] = { steps: current.steps, keyCount: current.keys.size }

  // WORKS BUT SLOW
  // Where bitmask is just keys
  // if (current.keys.size === maxKeyCount) {
  //   console.log('FOUND ANSWER', current.steps)
  //   if (current.steps <= best) best = current.steps
  //   return shortestPath(grid, queue, maxKeyCount, best)
  // }
  // const cacheStr = getBitMask(current, maxKeyCount)
  // if (current.steps >= cache[cacheStr]) {
  //   return shortestPath(grid, queue, maxKeyCount, best)
  // }
  // cache[cacheStr] = current.steps

  // WORKING
  // Use position and keys for cacheKey
  if (current.keys.size === maxKeyCount) return current.steps
  const setStr = getBitMask(current, maxKeyCount)
  if (set.has(setStr)) return shortestPath(grid, queue, maxKeyCount, best)
  set.add(setStr)

  const newGridStates = availableKeys(grid, [ current ])
  // .filter(newGridState => {
  //   const setStr = getBitMask(newGridState, maxKeyCount)
  //   return !set.has(setStr)
  // })
  // console.log(newGridStates)
  return shortestPath(
    grid,
    queue.concat(newGridStates).toSorted((a, b) => a.steps - b.steps),
    // queue.concat(newGridStates).toSorted((a, b) => b.keys.size - a.keys.size),
    // queue.concat(newGridStates),
    maxKeyCount,
    best
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

// function preComputePaths(grid: string[][], queue: GridStateV3[], cache: Record<string, number>) {
//   const current = queue.shift()
//   if (!current) return 
//   const nextStates = availableKeys(grid, [ current ])
//   queue.push(...nextStates)
//   return preComputePaths(grid, queue, cache)
// }

const startTime = Bun.nanoseconds()
const grid = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(row => row.split(''))
)

const part1 = shortestPath(grid, [{
  pos: findMultiple(grid, '@'),
  steps: 0,
  keys: new Set<string>(),
}], getMaxKeyCount(grid))
console.log(part1, [ 8, 86, 132, 136, 81, 3866 ].includes(part1))

// const newGrid = splitGrid(grid)
// const part2 = shortestPath(newGrid, [{
//   pos: findMultiple(newGrid, '@'),
//   steps: 0,
//   keys: new Set<string>(),
// }], getMaxKeyCount(newGrid))
// console.log(part2, [ 8, 24, 32, 72, 1842 ].includes(part2))

console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
