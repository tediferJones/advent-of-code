type Position = { row: number, col: number }
type GridState = { pos: Position, steps: number, reqKeys: string[] }
type DestKeys = Record<string, { steps: number, reqKeys: string[] }> 
type Paths = Record<string, DestKeys>
type PathState = { pos: Position[], keys: string[], steps: number }
type PosMap = TwoWayMap<string, Position>

class TwoWayMap<K, V> {
  keyVal: Map<K, V>
  valKey: Map<V, K>

  constructor() {
    this.keyVal = new Map<K, V>()
    this.valKey = new Map<V, K>()
  }

  insert(key: K, val: V) {
    this.keyVal.set(key, val)
    this.valKey.set(val, key)
  }

  getVal(key: K) {
    return this.keyVal.get(key)
  }

  getKey(val: V) {
    return this.valKey.get(val)
  }

  keys() {
    return [ ...this.keyVal.keys() ]
  }

  vals() {
    return [ ...this.valKey.keys() ]
  }
}

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

function availableKeys(
  grid: string[][],
  queue: GridState[],
  // seen = new Set<string>(queue.map(state => JSON.stringify(state.pos))),
  seen = new Set<string>(queue.map(state => `${state.pos.row},${state.pos.col}`)),
  keys: DestKeys = {}
) {
  const current = queue.shift()
  if (!current) return keys
  const pos = current.pos
  const char = grid[pos.row][pos.col]
  if (!char) throw Error('no char')
  if (current.steps && charIsKey(char)) {
    keys[char] = {
      steps: current.steps,
      reqKeys: current.reqKeys
    }
  }
  directions.forEach(dir => {
    const newPos = translatePos(pos, dir)
    const newChar = charAtPos(grid, newPos)
    if (newChar === '#') return
    // const newPosStr = JSON.stringify(newPos)
    const newPosStr = `${newPos.row},${newPos.col}`
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
  return availableKeys(grid, queue, seen, keys)
}

function getKeyPos(grid: string[][]) {
  return grid.reduce((twoWayMap, row, i) => {
    row.forEach((cell, j) => {
      if (![ '.', '#' ].includes(cell) && !charIsDoor(cell)) {
        twoWayMap.insert(cell, { row: i, col: j })
      }
    })
    return twoWayMap
  }, new TwoWayMap() as PosMap)
}

function replaceStart(grid: string[][]) {
  let count = 0
  return {
    newGrid: grid.map(row => {
      return row.map(cell => {
        return cell === '@' ? (count++).toString() : cell
      })
    }),
    count,
  }
}

function getKeyPaths(grid: string[][], keyPositions: PosMap) {
  return keyPositions.keys().reduce((paths, key) => {
    paths[key] = availableKeys(grid, [{
      pos: keyPositions.getVal(key)!,
      steps: 0,
      reqKeys: []
    }])
    return paths
  }, {} as Paths)
}

function pathsBitMask(state: PathState, keyCount: number, positions: PosMap) {
  // const posChar = state.keys[state.keys.length - 1] || '@'
  // return `${JSON.stringify(state.pos)},${state.keys.toSorted()}`

  // const posStr = state.pos.map(pos => `${pos.row},${pos.col}`).join(':')
  // return `${posStr},${state.keys.toSorted()}`
  // const posStr = state.pos.map(pos => positions.getKey(pos)!).join(':')
  // const keyMask = Array(keyCount).fill(0)
  // state.keys.forEach(key => {
  //   keyMask[key.charCodeAt(0) - 97] = 1
  // })
  // return `${posStr}:${keyMask.join('')}`

  const mask = Array(keyCount).fill(0)
  state.keys.forEach(key => {
    mask[key.charCodeAt(0) - 97] = 1
  })
  state.pos.forEach(pos => {
    const char = positions.getKey(pos)!
    mask[char.charCodeAt(0) - 97] = 2
  })
  mask.push(state.pos.length)
  return mask.join('')
}

function getValidNextPaths(nextPaths: DestKeys, currentKeys: string[]) {
  return Object.keys(nextPaths).filter(newKey => {
    if (currentKeys.includes(newKey)) return
    return nextPaths[newKey].reqKeys.every(reqKey => currentKeys.includes(reqKey))
  })
    // .filter(newKey => !currentKeys.includes(newKey))
    // .filter(newKey => 
    //   nextPaths[newKey].reqKeys.every(reqKey => currentKeys.includes(reqKey))
    // )
}

const dfsPathsCache: Record<string, number> = {}
let dfsPathsBest = Infinity
function dfsPaths(
  state: PathState,
  paths: Paths,
  keyCount: number,
  positions: PosMap,
): number {
  // const startCacheKeyTime = Bun.nanoseconds()
  const cacheKey = pathsBitMask(state, keyCount, positions)
  // cacheKeyTime += Bun.nanoseconds() - startCacheKeyTime
  // console.log(cacheKey)
  if (state.keys.length === keyCount) {
    if (state.steps < dfsPathsBest) dfsPathsBest = state.steps
    return state.steps
  }
  if (dfsPathsCache[cacheKey]) {
    const shortCutResult = state.steps + dfsPathsCache[cacheKey]
    if (shortCutResult < dfsPathsBest) dfsPathsBest = shortCutResult
    return shortCutResult
  }

  // eliminate this nested reduce
  // reduce state.pos into all possible next states,
  // then reduce nextStates to least steps
  // pos is required to know create new pos array
  const result = state.pos.reduce((best, pos) => {
    const key = positions.getKey(pos)!
    const nextPaths = paths[key]
    const validPaths = getValidNextPaths(nextPaths, state.keys)
    const newPositions = state.pos.filter(oldPos => oldPos !== pos)
    const result = validPaths.reduce((best, newKey) => {
      const newState = {
        pos: newPositions.concat(positions.getVal(newKey)!),
        steps: state.steps + nextPaths[newKey].steps,
        keys: state.keys.concat(newKey)
      }
      if (newState.steps > dfsPathsBest) return best
      return Math.min(dfsPaths(newState, paths, keyCount, positions), best)
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

function solveGrid(grid: string[][]) {
  const { newGrid, count } = replaceStart(grid)
  const keyCount = getMaxKeyCount(newGrid)
  const positions = getKeyPos(newGrid)
  const paths = getKeyPaths(newGrid, positions)
  const pos = Array(count).fill(0).map((_, i) => positions.getVal(i.toString())!)
  return dfsPaths(
    { keys: [], steps: 0, pos },
    paths,
    keyCount,
    positions,
  )
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

const part1 = solveGrid(grid)
console.log(part1, [ 8, 86, 132, 136, 81, 3866 ].includes(part1))

const part2 = solveGrid(splitGrid(grid))
console.log(part2, [ 8, 24, 32, 72, 1842 ].includes(part2))

console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
