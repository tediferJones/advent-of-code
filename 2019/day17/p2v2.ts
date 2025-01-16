import runIntCode from '../day13/intCode'

type Position = { row: number, col: number }
type DirChars = '^' | '>' | 'v' | '<'
type Turns = 'L' | 'R'

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
  return  output.reduce((map, tile) => {
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
        if (map?.[i - 1]?.[j] !== '#') return miniTotal
        if (map?.[i + 1]?.[j] !== '#') return miniTotal
        if (map?.[i]?.[j - 1] !== '#') return miniTotal
        if (map?.[i]?.[j + 1] !== '#') return miniTotal
        return miniTotal.concat({ row: i, col: j })
      }, [] as Position[])
    )
  }, [] as Position[])
}

function solvePart1(intersections: Position[]) {
  return intersections.reduce((total, int) => {
    return total + int.row * int.col
    // return total + int.reduce((val, i) => val * i, 1)
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

function findPathPattern(path: string, patterns: string[] = []): undefined | string[] {
  const maxCharsPerPattern = 100
  // console.log(paths.join(','))
  if (patterns.length > 3) return
  if (path.length === 0) {
    console.log('FOUND')
    return patterns 
  }

  const reusePattern = patterns.find(pattern => {
    return path.slice(0, pattern.length) === pattern
  })
  if (reusePattern) {
    // console.log('REUSE PATTERN', reusePattern, path, path.slice(reusePattern.length))
    return findPathPattern(path.slice(reusePattern.length), patterns)
  }

  for (let i = maxCharsPerPattern; i > 0; i--) {
    // const tempPattern = path.slice(0, i)
    if (path[i] !== ',') continue
    // console.log('TESTING PATTERN', path.slice(0, i), patterns)
    const result = findPathPattern(path.slice(i + 1), patterns.concat(path.slice(0, i)))
    if (result) return result
  }
}

const usedPaths = new Set<string>()
function showPath(map: string[][], visited: Position[]) {
  // console.log(visited)
  const visitStr = visited.map(pos => JSON.stringify(pos)).join(',')
  if (usedPaths.has(visitStr)) {
    console.log('SAME')
  }
  usedPaths.add(visitStr)
  const mapCopy: string[][] = JSON.parse(JSON.stringify(map))
  visited.forEach(pos => mapCopy[pos.row][pos.col] = '$')
  mapCopy.forEach(row => console.log(row.join('')))
  console.log('~~~~~~~~')
}

function getPaths(map: string[][], intersections: Position[]) {
  const start = findStart(map)
  // console.log(start)
  const queue = [{
    pos: start.pos,
    visited: new Set<string>(),
    prev: { row: Infinity, col: Infinity },
    intCount: 0,
  }]
  const endPos = JSON.stringify({ row: 28, col: 4 })
  const answer = []
  const intSet = new Set(intersections.map(int => JSON.stringify(int)))
  console.log(intSet)
  while (queue.length) {
    const current = queue.shift()!
    if (JSON.stringify(current.pos) === endPos) {
      // console.log('FOUND')
      answer.push(current)
      continue
    }
    Object.values(directions).forEach(dir => {
      const nextPos = translatePos(current.pos, dir)
      const nextChar = charAtPos(map, nextPos)
      const nextPosStr = JSON.stringify(nextPos)
      if (nextChar !== '#') return
      if (current.visited.has(nextPosStr)) return
      const nextPosIsInt = intSet.has(nextPosStr)
      if (JSON.stringify(nextPos) === JSON.stringify(current.prev)) return
      queue.push({
        pos: nextPos,
        // visited: new Set(current.visited).add(nextPosStr),
        visited: nextPosIsInt ? new Set(current.visited) : new Set(current.visited).add(nextPosStr),
        prev: current.pos,
        intCount: nextPosIsInt ? current.intCount + 1 : current.intCount
      })
    })
  }
  return answer
}

let intCount = 0;
function getPathsV2(map: string[][], intersections: Position[], endPos: Position) {
  const endStr = JSON.stringify(endPos)
  const start = findStart(map)
  const queue = [{
    pos: start.pos,
    visited: new Set<string>(),
    // ints: {} as Record<string, number>,
    ints: 0,
    prev: { row: Infinity, col: Infinity },
    path: [ start.pos ] as Position[]
  }]
  const paths = []
  const intSet = new Set(intersections.map(pos => JSON.stringify(pos)))
  const minPathLength = map.reduce((count, row) => {
    return count + row.reduce((miniTotal, cell) => miniTotal + Number(cell === '#'), 0) 
  }, 0)
  while (queue.length) {
    const current = queue.shift()!
    if (JSON.stringify(current.pos) === endStr) {
      // if (current.visited.size + current.ints >= minPathLength) {
      //   paths.push(current)
      // }
      if (current.path.length >= minPathLength) {
        paths.push(current)
      }
      continue
    }
    Object.values(directions).forEach(dir => {
      const newPos = translatePos(current.pos, dir)
      const newPosStr = JSON.stringify(newPos)
      if (newPosStr === JSON.stringify(current.prev)) return
      const newChar = charAtPos(map, newPos)
      if (newChar !== '#') return
      if (current.visited.has(newPosStr)) return
      const newVisited = new Set(current.visited)
      // const newInts = { ...current.ints }
      let newInts = current.ints
      if (!intSet.has(newPosStr)) {
        newVisited.add(newPosStr)
      } else {
        newInts++
      }
      queue.push({
        pos: newPos,
        visited: newVisited,
        ints: newInts,
        prev: current.pos,
        path: current.path.concat(newPos)
      })
    })
  }
  return paths
}

function pathConverter(path: Position[], currDir: DirChars) {
  const answer: (string|number)[] = []
  while (path.length) {
    const currPos = path.shift()!
    const dir = directions[currDir]
    const nextPos = translatePos(currPos, dir)
    if (JSON.stringify(nextPos) !== JSON.stringify(path[0])) {
      // console.log('TURNING', {currPos})
      const turnType = Object.keys(turns[currDir]).find(turn => {
        const turnPos = translatePos(currPos, directions[turns[currDir][turn as Turns]])
        return JSON.stringify(turnPos) === JSON.stringify(path[0])
      })
      if (!turnType) {
        // console.log({ nextPos, shouldBeNext: path[0], currPos, currDir })
        if (path.length) throw Error('should be impossible')
        return answer
      } else {
        // console.log('FOUND TURN', turnType, turns[currDir][turnType as Turns])
        currDir = turns[currDir][turnType as Turns]
      }
      answer.push(turnType, 0)
    }
    (answer[answer.length - 1] as number)++
    // if (answer[0] === 'R' && answer[1] === 11) {
    //   break
    // }
    // console.log(answer)
  }
  return answer
}

type Pattern = Record<string, number>
const allPatterns: Pattern[] = []
function findPathPatternV2(path: string, patterns: Pattern = {}): undefined | Pattern {
  const maxCharsPerPattern = 30
  // console.log(paths.join(','))
  if (Object.keys(patterns).length > 3) return
  if (Object.values(patterns).reduce((total, num) => total + num, 0) > 10) {
    return
  }
  if (path.length === 0) {
    console.log('FOUND')
    allPatterns.push(patterns)
    return patterns 
  }
  
  // if (patterns.includes('R,8,R,8') && patterns.includes('R,4,R,4,R,8') && patterns.includes('L,6,L,2')) {
  //   console.log(path, patterns)
  // }

  const reusePattern = Object.keys(patterns).find(pattern => {
    return path.slice(0, pattern.length) === pattern
  })
  if (reusePattern) {
    // console.log('REUSE PATTERN', reusePattern, path, path.slice(reusePattern.length))
    return findPathPatternV2(path.slice(reusePattern.length + 1), {  ...patterns, [reusePattern]: patterns[reusePattern] + 1})
  }

  // for (let i = maxCharsPerPattern; i > 0; i--) {
  //   // const tempPattern = path.slice(0, i)
  //   if (path[i] !== ',') continue
  //   // console.log('TESTING PATTERN', path.slice(0, i), patterns)
  //   const result = findPathPattern(path.slice(i + 1), patterns.concat(path.slice(0, i)))
  //   if (result) return result
  // }
  for (let i = 0; i <= maxCharsPerPattern; i++) {
    // const tempPattern = path.slice(0, i)
    if (path[i] !== ',') continue
    // console.log('TESTING PATTERN', path.slice(0, i), patterns)
    // const result = findPathPattern(path.slice(i + 1), patterns.concat(path.slice(0, i)))
    const result = findPathPatternV2(path.slice(i + 1),  { ...patterns, [path.slice(0, i)]: 1 })
    // if (result) return result
  }
}

const startTime = Bun.nanoseconds()
const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number)

const result = runIntCode(program)

const map = drawMap(result.diagnostics)
map.forEach(row => console.log(row.join('')))

const intersections = getIntersections(map)
const part1 = solvePart1(intersections)
console.log(part1, [ 8084 ].includes(part1))

// console.log(findPathPatternV2('R,8,R,8,R,4,R,4,R,8,L,6,L,2,R,4,R,4,R,8,R,8,R,8,L,6,L,2'))
// console.log(allPatterns)

const paths = getPathsV2(map, intersections, { row: 28, col: 4 })
console.log(paths.length)
const idk = paths.map(path => pathConverter(path.path, '^'))
// let fixer = false;
idk.forEach(miniIdk => {
  findPathPatternV2(miniIdk.join(','))
  // if (!fixer && allPatterns.length > 0) {
  //   fixer = true
  //   console.log(miniIdk.join(','))
  // }
})
console.log(allPatterns)

// THIS SHIT ACTUALLY WORKED WHAT THE FUCK
const answerStr = `A,B,A,B,C,B,C,A,C,C\nR,12,L,10,L,10\nL,6,L,12,R,12,L,4\nL,12,R,12,L,6\nn\n`
const asciiAns = answerStr.split('').map(char => char.charCodeAt(0))
console.log(asciiAns)
const maybePart2 = runIntCode(program.with(0, 2), 0, asciiAns)
const part2 = maybePart2.diagnostics[maybePart2.diagnostics.length - 1]
console.log('ANSWER', part2, part2 === 1119775)

// Somehow this actually worked:
// R,12,L,10,L,10,L,6,L,12,R,12,L,4,R,12,L,10,L,10,L,6,L,12,R,12,L,4,L,12,R,12,L,6,L,6,L,12,R,12,L,4,L,12,R,12,L,6,R,12,L,10,L,10,L,12,R,12,L,6,L,12,R,12,L,6
// MAIN : A,B,A,B,C,B,C,A,C,C
// [
//   {
//     "R,12,L,10,L,10": 3, -> A
//     "L,6,L,12,R,12,L,4": 3, -> B
//     "L,12,R,12,L,6": 4, -> C
//   }
// ]

// console.log(idk)

// console.log(paths[0].path)
// const testPath = [ { row: 10, col: 13, }, { row: 10, col: 14, }, { row: 10, col: 15, }, { row: 10, col: 16, }, { row: 10, col: 17, }, { row: 10, col: 18, }, { row: 10, col: 19, }, { row: 10, col: 20, }, { row: 10, col: 21, }, { row: 10, col: 22, }, { row: 10, col: 23, }, { row: 10, col: 24, }, { row: 9, col: 24, }, { row: 8, col: 24, }, { row: 7, col: 24, }, { row: 6, col: 24, }, { row: 5, col: 24, }, { row: 4, col: 24, }, { row: 3, col: 24, }, { row: 2, col: 24, }, { row: 1, col: 24, }, { row: 0, col: 24, }, { row: 0, col: 23, }, { row: 0, col: 22, }, { row: 0, col: 21, }, { row: 0, col: 20, }, { row: 0, col: 19, }, { row: 0, col: 18, }, { row: 0, col: 17, }, { row: 0, col: 16, }, { row: 0, col: 15, }, { row: 0, col: 14, }, { row: 1, col: 14, }, { row: 2, col: 14, }, { row: 3, col: 14, }, { row: 4, col: 14, }, { row: 5, col: 14, }, { row: 6, col: 14, }, { row: 6, col: 15, }, { row: 6, col: 16, }, { row: 6, col: 17, }, { row: 6, col: 18, }, { row: 6, col: 19, }, { row: 6, col: 20, }, { row: 6, col: 21, }, { row: 6, col: 22, }, { row: 6, col: 23, }, { row: 6, col: 24, }, { row: 6, col: 25, }, { row: 6, col: 26, }, { row: 7, col: 26, }, { row: 8, col: 26, }, { row: 9, col: 26, }, { row: 10, col: 26, }, { row: 11, col: 26, }, { row: 12, col: 26, }, { row: 13, col: 26, }, { row: 14, col: 26, }, { row: 15, col: 26, }, { row: 16, col: 26, }, { row: 17, col: 26, }, { row: 18, col: 26, }, { row: 18, col: 27, }, { row: 18, col: 28, }, { row: 18, col: 29, }, { row: 18, col: 30, }, { row: 19, col: 30, }, { row: 20, col: 30, }, { row: 21, col: 30, }, { row: 22, col: 30, }, { row: 23, col: 30, }, { row: 24, col: 30, }, { row: 25, col: 30, }, { row: 26, col: 30, }, { row: 27, col: 30, }, { row: 28, col: 30, }, { row: 29, col: 30, }, { row: 30, col: 30, }, { row: 30, col: 31, }, { row: 30, col: 32, }, { row: 30, col: 33, }, { row: 30, col: 34, }, { row: 29, col: 34, }, { row: 28, col: 34, }, { row: 27, col: 34, }, { row: 26, col: 34, }, { row: 25, col: 34, }, { row: 24, col: 34, }, { row: 23, col: 34, }, { row: 22, col: 34, }, { row: 21, col: 34, }, { row: 20, col: 34, }, { row: 20, col: 35, }, { row: 20, col: 36, }, { row: 20, col: 37, }, { row: 20, col: 38, }, { row: 20, col: 39, }, { row: 20, col: 40, }, { row: 21, col: 40, }, { row: 22, col: 40, }, { row: 23, col: 40, }, { row: 24, col: 40, }, { row: 25, col: 40, }, { row: 26, col: 40, }, { row: 27, col: 40, }, { row: 28, col: 40, }, { row: 29, col: 40, }, { row: 30, col: 40, }, { row: 30, col: 39, }, { row: 30, col: 38, }, { row: 30, col: 37, }, { row: 30, col: 36, }, { row: 30, col: 35, }, { row: 30, col: 34, }, { row: 31, col: 34, }, { row: 32, col: 34, }, { row: 32, col: 33, }, { row: 32, col: 32, }, { row: 32, col: 31, }, { row: 32, col: 30, }, { row: 32, col: 29, }, { row: 32, col: 28, }, { row: 31, col: 28, }, { row: 30, col: 28, }, { row: 30, col: 27, }, { row: 30, col: 26, }, { row: 30, col: 25, }, { row: 30, col: 24, }, { row: 31, col: 24, }, { row: 32, col: 24, }, { row: 32, col: 25, }, { row: 32, col: 26, }, { row: 32, col: 27, }, { row: 32, col: 28, }, { row: 33, col: 28, }, { row: 34, col: 28, }, { row: 35, col: 28, }, { row: 36, col: 28, }, { row: 36, col: 29, }, { row: 36, col: 30, }, { row: 36, col: 31, }, { row: 36, col: 32, }, { row: 36, col: 33, }, { row: 36, col: 34, }, { row: 37, col: 34, }, { row: 38, col: 34, }, { row: 39, col: 34, }, { row: 40, col: 34, }, { row: 41, col: 34, }, { row: 42, col: 34, }, { row: 42, col: 35, }, { row: 42, col: 36, }, { row: 42, col: 37, }, { row: 42, col: 38, }, { row: 42, col: 39, }, { row: 42, col: 40, }, { row: 43, col: 40, }, { row: 44, col: 40, }, { row: 45, col: 40, }, { row: 46, col: 40, }, { row: 47, col: 40, }, { row: 48, col: 40, }, { row: 48, col: 39, }, { row: 48, col: 38, }, { row: 48, col: 37, }, { row: 48, col: 36, }, { row: 48, col: 35, }, { row: 48, col: 34, }, { row: 47, col: 34, }, { row: 46, col: 34, }, { row: 45, col: 34, }, { row: 44, col: 34, }, { row: 43, col: 34, }, { row: 42, col: 34, }, { row: 42, col: 33, }, { row: 42, col: 32, }, { row: 42, col: 31, }, { row: 42, col: 30, }, { row: 42, col: 29, }, { row: 42, col: 28, }, { row: 41, col: 28, }, { row: 40, col: 28, }, { row: 39, col: 28, }, { row: 38, col: 28, }, { row: 37, col: 28, }, { row: 36, col: 28, }, { row: 36, col: 27, }, { row: 36, col: 26, }, { row: 36, col: 25, }, { row: 36, col: 24, }, { row: 35, col: 24, }, { row: 34, col: 24, }, { row: 33, col: 24, }, { row: 32, col: 24, }, { row: 32, col: 23, }, { row: 32, col: 22, }, { row: 33, col: 22, }, { row: 34, col: 22, }, { row: 35, col: 22, }, { row: 36, col: 22, }, { row: 36, col: 23, }, { row: 36, col: 24, }, { row: 37, col: 24, }, { row: 38, col: 24, }, { row: 39, col: 24, }, { row: 40, col: 24, }, { row: 41, col: 24, }, { row: 42, col: 24, }, { row: 42, col: 23, }, { row: 42, col: 22, }, { row: 43, col: 22, }, { row: 44, col: 22, }, { row: 45, col: 22, }, { row: 46, col: 22, }, { row: 46, col: 21, }, { row: 46, col: 20, }, { row: 46, col: 19, }, { row: 46, col: 18, }, { row: 46, col: 17, }, { row: 46, col: 16, }, { row: 46, col: 15, }, { row: 46, col: 14, }, { row: 46, col: 13, }, { row: 46, col: 12, }, { row: 47, col: 12, }, { row: 48, col: 12, }, { row: 48, col: 11, }, { row: 48, col: 10, }, { row: 49, col: 10, }, { row: 50, col: 10, }, { row: 51, col: 10, }, { row: 52, col: 10, }, { row: 53, col: 10, }, { row: 54, col: 10, }, { row: 55, col: 10, }, { row: 56, col: 10, }, { row: 57, col: 10, }, { row: 58, col: 10, }, { row: 58, col: 9, }, { row: 58, col: 8, }, { row: 58, col: 7, }, { row: 58, col: 6, }, { row: 58, col: 5, }, { row: 58, col: 4, }, { row: 58, col: 3, }, { row: 58, col: 2, }, { row: 58, col: 1, }, { row: 58, col: 0, }, { row: 57, col: 0, }, { row: 56, col: 0, }, { row: 55, col: 0, }, { row: 54, col: 0, }, { row: 53, col: 0, }, { row: 52, col: 0, }, { row: 51, col: 0, }, { row: 50, col: 0, }, { row: 49, col: 0, }, { row: 48, col: 0, }, { row: 48, col: 1, }, { row: 48, col: 2, }, { row: 48, col: 3, }, { row: 48, col: 4, }, { row: 48, col: 5, }, { row: 48, col: 6, }, { row: 48, col: 7, }, { row: 48, col: 8, }, { row: 48, col: 9, }, { row: 48, col: 10, }, { row: 47, col: 10, }, { row: 46, col: 10, }, { row: 46, col: 11, }, { row: 46, col: 12, }, { row: 45, col: 12, }, { row: 44, col: 12, }, { row: 43, col: 12, }, { row: 42, col: 12, }, { row: 42, col: 13, }, { row: 42, col: 14, }, { row: 42, col: 15, }, { row: 42, col: 16, }, { row: 42, col: 17, }, { row: 42, col: 18, }, { row: 42, col: 19, }, { row: 42, col: 20, }, { row: 42, col: 21, }, { row: 42, col: 22, }, { row: 41, col: 22, }, { row: 40, col: 22, }, { row: 40, col: 21, }, { row: 40, col: 20, }, { row: 40, col: 19, }, { row: 40, col: 18, }, { row: 40, col: 17, }, { row: 40, col: 16, }, { row: 40, col: 15, }, { row: 40, col: 14, }, { row: 40, col: 13, }, { row: 40, col: 12, }, { row: 40, col: 11, }, { row: 40, col: 10, }, { row: 39, col: 10, }, { row: 38, col: 10, }, { row: 37, col: 10, }, { row: 36, col: 10, }, { row: 35, col: 10, }, { row: 34, col: 10, }, { row: 33, col: 10, }, { row: 32, col: 10, }, { row: 31, col: 10, }, { row: 30, col: 10, }, { row: 29, col: 10, }, { row: 28, col: 10, }, { row: 28, col: 9, }, { row: 28, col: 8, }, { row: 28, col: 7, }, { row: 28, col: 6, }, { row: 28, col: 5, }, { row: 28, col: 4, } ]
// console.log(pathConverter(testPath, '^'))
// pathConverter(paths[0].path, '^')
// pathConverter([{ row: 0, col: 0 }, { row: 0, col: 1 }], '^')

// const minPathLength = map.reduce((count, row) => {
//   return count + row.reduce((miniTotal, cell) => miniTotal + Number(cell === '#'), 0) 
// }, 0)
// const valid = paths.filter(path => path.visited.size + path.ints >= minPathLength)
// console.log(valid.length)

// const posPaths = paths.map(path => [ ...path.visited ].map(pos => JSON.parse(pos)))
// posPaths.forEach(path => showPath(map, path))
// const repeatDetector = new Set<string>();
// const unqPaths = paths.filter(path => {
//   const pathStr = [ ...path.visited ].join('')
//   if (repeatDetector.has(pathStr)) {
//     console.log('REPEAT')
//     return false
//   }
//   repeatDetector.add(pathStr)
//   return true
// })
// console.log(unqPaths.length)
// paths.forEach(path => console.log(path.visited.size + path.intCount))
// paths.forEach(path => showPath(map, [ ...path ].map(pos => JSON.parse(pos))))
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9}`)
