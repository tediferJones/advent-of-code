type Position = { row: number, col: number }
type GridStateV4 = { pos: Position, steps: number, reqKeys: string[] }
type DestKeys = Record<string, { steps: number, reqKeys: string[] }> 
type Paths = Record<string, DestKeys>
type PathState = { keys: string[], steps: number }

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

function getMaxKeyCount(grid: string[][]) {
  return grid.reduce((total, row) => {
    return total + row.reduce((miniTotal, cell) => {
      return miniTotal + Number(charIsKey(cell))
    }, 0)
  }, 0)
}

function availableKeysV2(
  grid: string[][],
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
  return availableKeysV2(grid, queue, seen, keys)
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

// function getKeyPaths(keyPositions: Record<string, Position>) {
//   return Object.keys(keyPositions).reduce((paths, key) => {
//     paths[key] = availableKeysV2([{
//       pos: keyPositions[key],
//       steps: 0,
//       reqKeys: []
//     }])
//     return paths
//   }, {} as Paths)
// }

type KeyPos = Record<string, Position>
function getKeyPosV2(grid: string[][]) {
  // return grid.reduce((positions, row, i) => {
  //   return positions.concat(
  //     row.reduce((newPositions, cell, j) => {
  //       if (![ '.', '#' ].includes(cell) && !charIsDoor(cell)) {
  //         return newPositions.concat({ row: i, col: j })
  //       }
  //       return newPositions
  //     }, [] as Position[])
  //   )
  // }, [] as Position[])
  return grid.reduce((keyPos, row, i) => {
    return {
      ...keyPos,
      ...row.reduce((positions, cell, j) => {
        if (![ '.', '#' ].includes(cell) && !charIsDoor(cell)) {
          positions[cell] = { row: i, col: j }
        }
        return positions
      }, {} as KeyPos)
    }
  }, {} as KeyPos)
}

function replaceStart(grid: string[][]) {
  let num = 0
  return grid.map(row => {
    return row.map(cell => {
      return cell === '@' ? (num++).toString() : cell
      // if (cell === '@') return num++
    })
  })
}

function getKeyPathsV2(grid: string[][], keyPositions: KeyPos) {
// function getKeyPathsV2(positions: Position[]) {
  // return positions.reduce((paths, pos) => {
  //   paths[JSON.stringify(pos)] = availableKeysV2([{
  //     pos,
  //     steps: 0,
  //     reqKeys: [],
  //   }])
  //   return paths
  // }, {} as Paths)
  return Object.keys(keyPositions).reduce((paths, key) => {
    paths[key] = availableKeysV2(grid, [{
      pos: keyPositions[key],
      steps: 0,
      reqKeys: []
    }])
    return paths
  }, {} as Paths)
}

function pathsBitMask(state: PathState) {
  const posChar = state.keys[state.keys.length - 1] || '@'
  return `${posChar},${state.keys.toSorted()}`
}

function pathsBitMaskV2(state: PathStateV2) {
  // const posChar = state.keys[state.keys.length - 1] || '@'
  // return `${JSON.stringify(state.pos)},${state.keys.toSorted()}`

  const posStr = state.pos.map(pos => `${pos.row},${pos.col}`).join(':')
  return `${posStr},${state.keys.toSorted()}`
}

function getValidNextPaths(nextPaths: DestKeys, currentKeys: string[]) {
  return Object.keys(nextPaths)
    .filter(newKey => !currentKeys.includes(newKey))
    .filter(newKey => 
      nextPaths[newKey].reqKeys.every(reqKey => currentKeys.includes(reqKey))
    )
}

const dfsPathsCache: Record<string, number> = {}
let dfsPathsBest = Infinity
function dfsPaths(state: PathState, paths: Paths, keyCount: number): number {
  const cacheKey = pathsBitMask(state)
  if (state.keys.length === keyCount) {
    // console.log('found', state.steps)
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
  const validPaths = getValidNextPaths(paths[posChar], state.keys)
  const result = validPaths.reduce((best, newKey) => {
    const newState = {
      steps: state.steps + nextPaths[newKey].steps,
      keys: state.keys.concat(newKey)
    }
    if (newState.steps > dfsPathsBest) return best
    return Math.min(dfsPaths(newState, paths, keyCount), best)
  }, Infinity)
  dfsPathsCache[cacheKey] = result - state.steps
  return result
}

type PathStateV2 = { pos: Position[], keys: string[], steps: number }
function dfsPathsV2(
  state: PathStateV2,
  paths: Paths,
  keyCount: number,
  positions: KeyPos
): number {
  const cacheKey = pathsBitMaskV2(state)
  if (state.keys.length === keyCount) {
    if (state.steps < dfsPathsBest) dfsPathsBest = state.steps
    return state.steps
  }
  if (dfsPathsCache[cacheKey]) {
    const shortCutResult = state.steps + dfsPathsCache[cacheKey]
    if (shortCutResult < dfsPathsBest) dfsPathsBest = shortCutResult
    return shortCutResult
  }
  // const posChar = state.keys[state.keys.length - 1] || '@'
  // const nextPaths = paths[posChar]

  // eliminate this nested reduce
  // reduce state.pos into all possible next states,
  // then reduce nextStates to least steps
  const result = state.pos.reduce((best, pos) => {
    const key = Object.keys(positions).find(key => positions[key] === pos)
    if (!key) {
      console.log(pos, key, state.pos)
      throw Error('cant find key')
    }
    // const nextPaths = paths[JSON.stringify(pos)]
    const nextPaths = paths[key]
    if (!nextPaths) {
      console.log(key, paths)
    }
    // console.log(key, paths[key])
    // console.log(positions)
    // console.log(nextPaths, paths)
    const validPaths = getValidNextPaths(nextPaths, state.keys)
    const result = validPaths.reduce((best, newKey) => {
      const newState = {
        pos: state.pos.filter(newPos => newPos !== pos).concat(positions[newKey]),
        steps: state.steps + nextPaths[newKey].steps,
        keys: state.keys.concat(newKey)
      }
      // console.log(newState.pos.length)
      if (newState.steps > dfsPathsBest) return best
      return Math.min(dfsPathsV2(newState, paths, keyCount, positions), best)
    }, Infinity)
    return Math.min(result, best)
  }, Infinity)
  dfsPathsCache[cacheKey] = result - state.steps
  return result
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

function printGrid(grid: string[][]) {
  grid.forEach(row => console.log(row.join('')))
}

const startTime = Bun.nanoseconds()
const grid = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(row => row.split(''))
)

const keyCount = getMaxKeyCount(grid)

// const part1 = dfsPaths({ keys: [], steps: 0 }, getKeyPaths(getKeyPos(grid)), keyCount)
// console.log(part1, [ 8, 86, 132, 136, 81, 3866 ].includes(part1))
// console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)

const newGrid = replaceStart(grid)
const positions = getKeyPosV2(newGrid)
const paths = getKeyPathsV2(newGrid, positions)
// console.log(positions)
// console.log(paths)
const part1 = dfsPathsV2(
  { keys: [], steps: 0, pos: [ positions['0'] ] },
  paths,
  keyCount,
  positions,
)
console.log(part1, [ 8, 86, 132, 136, 81, 3866 ].includes(part1))

const gridPart2 = replaceStart(splitGrid(grid))
// printGrid(gridPart2)
const part2Positions = getKeyPosV2(gridPart2)
const part2Paths = getKeyPathsV2(gridPart2, part2Positions)
// console.log(part2Paths)
// printGrid(gridPart2)
// console.log([ 0, 1, 2, 3 ].map(num => part2Positions[num.toString()]))
const part2 = dfsPathsV2(
  { keys: [], steps: 0, pos: [ 0, 1, 2, 3 ].map(num => part2Positions[num.toString()]) },
  part2Paths,
  keyCount,
  part2Positions,
)
console.log(part2, [ 8, 24, 32, 72, 1842 ].includes(part2))
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)

// const paths = Object.keys(keyPositions).reduce((paths, key) => {
//   paths[key] = availableKeysV2([{
//     pos: keyPositions[key],
//     steps: 0,
//     reqKeys: []
//   }])
//   return paths
// }, {} as Paths)
// console.log(paths)

// const graphSet = new Set<string>()
// const graphCache: Record<string, number> = {}
// let best = Infinity;
// function bfsPaths(queue: PathState[]) {
//   const current = queue.shift()
//   if (!current) return
//   if (current.steps > best) return bfsPaths(queue)
//   console.log(current.steps, queue.length)
//   if (current.keys.length === keyCount) {
//     best = current.steps
//     return bfsPaths(queue)
//   }
//   const posChar = current.keys[current.keys.length - 1] || '@'
//   const cacheKey = `${posChar},${current.keys.toSorted()}`
//   // if (graphSet.has(cacheKey)) return bfsPaths(queue)
//   // graphSet.add(cacheKey)
//   if (current.steps >= graphCache[cacheKey]) return bfsPaths(queue)
//   graphCache[cacheKey] = current.steps
//   const availableKeys = Object.keys(paths[posChar]).filter(key => {
//     return paths[posChar][key].reqKeys.every(reqKey => current.keys.includes(reqKey)) && !current.keys.includes(key)
//   })
// 
//   const newPaths = availableKeys.map(key => ({
//     steps: paths[posChar][key].steps + current.steps,
//     keys: current.keys.concat(key)
//   }))
// 
//   return bfsPaths(queue.concat(newPaths))
//   return bfsPaths(queue.concat(newPaths).toSorted((a, b) => {
//     const stepDiff = a.steps - b.steps
//     const keyDiff = b.keys.length - a.keys.length
//     if (keyDiff) return keyDiff
//     return stepDiff
//   }))
// }
// console.log(bfsPaths([{ keys: [], steps: 0 }]))
