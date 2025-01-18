import runIntCode from '../day13/intCode'

type Position = { row: number, col: number }
type DirChars = '^' | '>' | 'v' | '<'
type Turns = 'L' | 'R'
type Pattern = { order: string, patterns: string[] }
type PathState = {
  pos: Position,
  visited: Set<string>,
  path: Position[],
  dir: DirChars,
}

const directions: Record<DirChars, Position> = {
  '^': { row: -1, col:  0 },
  '>': { row:  0, col:  1 },
  'v': { row:  1, col:  0 },
  '<': { row:  0, col: -1 },
}

const turns: Record<DirChars, Record<Turns, DirChars>> = {
  '^': { L: '<', R: '>' },
  '>': { L: '^', R: 'v' },
  'v': { L: '>', R: '<' },
  '<': { L: 'v', R: '^' },
}

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function charAtPos(map: string[][], pos: Position): string | undefined {
  return map?.[pos.row]?.[pos.col]
}

function drawMap(output: number[]) {
  return output.reduce((map, tile) => {
    if (tile === 10) {
      map.push([])
    } else {
      map[map.length - 1].push(String.fromCharCode(tile))
    }
    return map
  }, [[]] as string[][])
}

function getIntersections(map: string[][]) {
  return map.reduce((intersections, row, i) => {
    return intersections.concat(
      row.reduce((miniTotal, cell, j) => {
        if (cell !== '#') return miniTotal
        const pos = { row: i, col: j }
        const isInt = Object.values(directions).every(dir => {
          return charAtPos(map, translatePos(pos, dir)) === '#'
        })
        if (!isInt) return miniTotal
        return miniTotal.concat({ row: i, col: j })
      }, [] as Position[])
    )
  }, [] as Position[])
}

function solvePart1(intersections: Position[]) {
  return intersections.reduce((total, int) => {
    return total + int.row * int.col
  }, 0)
}

function findStart(map: string[][]) {
  const startChars: DirChars[] = [ '^', '>', 'v', '<' ]
  const char = startChars.find(char => map.some(row => row.includes(char)))
  if (!char) throw Error('cant find starting char')
  const row = map.findIndex(row => row.includes(char))
  const col = map[row].findIndex(cell => cell === char)
  return { pos: { row, col }, char }
}

function findEnd(map: string[][], pos = { row: 0, col: 0 }) {
  if (charAtPos(map, pos) === '#') {
    const freeSpaceCount = Object.values(directions)
      .filter(dir => charAtPos(map, translatePos(pos, dir)) !== '#')
      .length
    if (freeSpaceCount === 3) return pos
  }
  return findEnd(map, {
    row: pos.row === map.length - 1 ? 0 : pos.row + 1,
    col: pos.col === map[pos.row].length - 1 ? 0 : pos.col + 1
  })
}

// Is a recursive function with 8 arguments better than using a while loop?
// Absolutely not but here we are
function getPaths(
  map: string[][],
  intersections: Position[],
  queue: PathState[],
  endPos: Position,
  minPathLength: number,
  turboMode = false,
  paths: PathState[] = [],
  intSet = new Set(intersections.map(int => JSON.stringify(int)))
) {
  if (queue.length === 0) return paths
  const current = queue.shift()!
  const testPos = translatePos(current.pos, directions[current.dir])
  const testChar = charAtPos(map, testPos)
  const testPosStr = JSON.stringify(testPos)
  if (JSON.stringify(current.pos) === JSON.stringify(endPos)) {
    if (current.path.length >= minPathLength) paths.push(current)
  } else if (testChar === '#' && (turboMode || !intSet.has(JSON.stringify(current.pos)))) {
    queue.push({
      pos: testPos,
      path: current.path.concat(testPos),
      visited: current.visited.add(testPosStr),
      dir: current.dir
    })
  } else {
    Object.keys(directions).forEach(dirKey => {
      const dir = directions[dirKey as DirChars]
      const nextPos = translatePos(current.pos, dir)
      const nextChar = charAtPos(map, nextPos)
      const nextPosStr = JSON.stringify(nextPos)
      if (nextChar !== '#') return
      if (current.visited.has(nextPosStr)) return
      const newSet = new Set(current.visited)
      if (!intSet.has(nextPosStr)) newSet.add(nextPosStr)
      queue.push({
        pos: nextPos,
        path: current.path.concat(nextPos),
        visited: newSet,
        dir: dirKey as DirChars
      })
    })
  }
  return getPaths(map, intersections, queue, endPos, minPathLength, turboMode, paths, intSet)
}


function pathConverter(path: Position[], currDir: DirChars, answer: (string|number)[] = []) {
  if (path.length === 0) return answer
  const currPos = path.shift()!
  const dir = directions[currDir]
  const nextPos = translatePos(currPos, dir)
  if (JSON.stringify(nextPos) !== JSON.stringify(path[0])) {
    const turnType = Object.keys(turns[currDir]).find(turn => {
      const turnPos = translatePos(currPos, directions[turns[currDir][turn as Turns]])
      return JSON.stringify(turnPos) === JSON.stringify(path[0])
    })
    if (!turnType) return answer
    currDir = turns[currDir][turnType as Turns]
    answer.push(turnType, 0)
  }
  (answer[answer.length - 1] as number)++
  return pathConverter(path, currDir, answer)
}

function findPathPattern(path: string, patterns: string[] = [], order = ''): undefined | Pattern {
  const maxCharsPerPattern = 20
  const names = [ 'A', 'B', 'C' ]
  if (patterns.length > 3) return
  if (order.length > maxCharsPerPattern) return
  if (path.length === 0) return { order: order.slice(0, -1), patterns }

  const patternIndex = patterns.findIndex(pattern => {
    return path.slice(0, pattern.length) === pattern
  })

  if (patternIndex > -1) {
    return findPathPattern(
      path.slice(patterns[patternIndex].length + 1),
      patterns,
      order + names[patternIndex] + ','
    )
  }

  return checkPatternLengths(0, maxCharsPerPattern, path, patterns, order, names)
}

function checkPatternLengths(
  i: number,
  max: number,
  path: string,
  patterns: string[],
  order: string,
  names: string[]
) {
  if (i > max) return
  if (path[i] === ',') {
    const result = findPathPattern(
      path.slice(i + 1),
      patterns.concat(path.slice(0, i)),
      order + names[patterns.length] + ','
    )
    if (result) return result
  }
  return checkPatternLengths(i + 1, max, path, patterns, order, names)
}

function patternToAsciiV2(pattern: Pattern, outputMode: 'y' | 'n') {
  return `${pattern.order}\n${pattern.patterns.join('\n')}\n${outputMode}\n`
    .split('').map(char => char.charCodeAt(0))
}

function showPath(map: string[][], visited: Position[]) {
  const mapCopy: string[][] = JSON.parse(JSON.stringify(map))
  visited.forEach(pos => mapCopy[pos.row][pos.col] = '$')
  mapCopy.forEach(row => console.log(row.join('')))
  console.log('~~~~~~~~')
}

function getPathLength(map: string[][]) {
  return map.reduce((count, row) => {
    return count + row.reduce((miniTotal, cell) => {
      return miniTotal + Number(cell === '#')
    }, 0) 
  }, 0)
}

function solvePart2(map: string[][], intersections: Position[], turboMode?: boolean) {
  const startPos = findStart(map)
  const endPos = findEnd(map)
  const minPathLength = getPathLength(map)
  const paths = getPaths(
    map,
    intersections,
    [{
      pos: startPos.pos,
      visited: new Set<string>().add(JSON.stringify(startPos)),
      path: [ startPos.pos ] as Position[],
      dir: startPos.char
    }],
    endPos,
    minPathLength,
    !!turboMode,
  )

  const instructions = paths.map(path => pathConverter(path.path, startPos.char))
  const patterns = instructions.map(ins => findPathPattern(ins.join(','))).filter(Boolean)
  const ascii = patternToAsciiV2(patterns[0]!, 'n')
  const intCodePart2 = runIntCode(program.with(0, 2), 0, ascii)
  return intCodePart2.diagnostics[intCodePart2.diagnostics.length - 1]
}

const startTime = Bun.nanoseconds()
const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number)

const result = runIntCode(program)
const map = drawMap(result.diagnostics)
const intersections = getIntersections(map)

const part1 = solvePart1(intersections)
console.log(part1, [ 8084 ].includes(part1))

// passing true to solvePart2 will activate turbo mode
// turbo mode will only generate the single path with the longest straight lines
// this is the correct path for my input, but may not work for all of inputs
// if you dont use turbo mode, all possible paths will be generated
const part2 = solvePart2(map, intersections, true)
console.log(part2, [ 1119775 ].includes(part2))
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)

// getPaths, but with a while loop instead of recursion
// function getPaths(
//   map: string[][],
//   intersections: Position[],
//   queue: PathState[],
//   endPos: Position,
//   turboMode = false,
// ) {
//   const intSet = new Set(intersections.map(int => JSON.stringify(int)))
//   const endStr = JSON.stringify(endPos)
//   const minPathLength = map.reduce((count, row) => {
//     return count + row.reduce((miniTotal, cell) => miniTotal + Number(cell === '#'), 0) 
//   }, 0)
//   const paths: PathState[] = []
//   const dirKeys = Object.keys(directions)
//   while (queue.length) {
//     const current = queue.shift()!
//     // console.log(queue.length)
//     if (JSON.stringify(current.pos) === endStr) {
//       if (current.path.length >= minPathLength) {
//         paths.push(current)
//       }
//       continue
//     }
// 
//     const testPos = translatePos(current.pos, directions[current.dir])
//     const testChar = charAtPos(map, testPos)
//     const testPosStr = JSON.stringify(testPos)
//     // if (testChar === '#' && !intSet.has(JSON.stringify(current.pos))) {
//     if (testChar === '#' && (turboMode || !intSet.has(JSON.stringify(current.pos)))) {
//       queue.push({
//         pos: testPos,
//         path: current.path.concat(testPos),
//         visited: current.visited.add(testPosStr),
//         dir: current.dir
//       })
//       continue
//     }
// 
//     // Object.keys(directions).forEach(dirKey => {
//     dirKeys.forEach(dirKey => {
//       const dir = directions[dirKey as DirChars]
//       const nextPos = translatePos(current.pos, dir)
//       const nextChar = charAtPos(map, nextPos)
//       const nextPosStr = JSON.stringify(nextPos)
//       if (nextChar !== '#') return
//       if (current.visited.has(nextPosStr)) return
//       if (nextPosStr === JSON.stringify(current.path[current.path.length - 2])) {
//         return
//       }
//       const newSet = new Set(current.visited)
//       if (!intSet.has(nextPosStr)) newSet.add(nextPosStr)
//       queue.push({
//         pos: nextPos,
//         path: current.path.concat(nextPos),
//         visited: newSet,
//         dir: dirKey as DirChars
//       })
//     })
//   }
//   return paths
// }
