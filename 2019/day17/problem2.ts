import runIntCode from '../day13/intCode'

type Position = { row: number, col: number }
type DirChars = '^' | '>' | 'v' | '<'
type Turns = 'L' | 'R'
type Pattern = { order: string, patterns: string[] }

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
        return miniTotal.concat([ [ i, j ] ])
      }, [] as [number, number][])
    )
  }, [] as [number, number][])
}

// function getIntersections(map: string[][]) {
//   return map.reduce((intersections, row, i) => {
//     return intersections.concat(
//       row.reduce((miniTotal, cell, j) => {
//         if (cell !== '#') return miniTotal
//         if (map?.[i - 1]?.[j] !== '#') return miniTotal
//         if (map?.[i + 1]?.[j] !== '#') return miniTotal
//         if (map?.[i]?.[j - 1] !== '#') return miniTotal
//         if (map?.[i]?.[j + 1] !== '#') return miniTotal
//         return miniTotal.concat({ row: i, col: j })
//       }, [] as Position[])
//     )
//   }, [] as Position[])
// }

function solvePart1(intersections: [number, number][]) {
  return intersections.reduce((total, int) => {
    return total + int.reduce((val, i) => val * i, 1)
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

// WHY DOES THIS UGLY TRASH WORK
// Ideally, we want to collect the path positions and then create the array of instructions afterwards
//  - use pathConverter from p2v2.ts to convert path to instructions
type PathState = { pos: Position, dir: DirChars, path: (string|number)[], visited: Set<string>, intCount: number } 
function getPaths(map: string[][], intersections: [number, number][]) {
  const intSet = new Set(intersections.map(int => JSON.stringify(int)))
  const { pos, char } = findStart(map)
  const queue: PathState[] = [ { pos, dir: char, path: [], visited: new Set(), intCount: 0 } ]
  const endPos = { row: 28, col: 4 }
  const paths: PathState[] = []
  const minPathLength = map.reduce((count, row) => {
    return count + row.reduce((miniTotal, cell) => miniTotal + Number(cell === '#'), 0) 
  }, 0)
  while (queue.length) {
    const current = queue.shift()!
    if (JSON.stringify(current.pos) === JSON.stringify(endPos)) {
      if (current.visited.size + current.intCount >= minPathLength) {
        paths.push(current)
      }
      continue
    }
    const dir = directions[current.dir]
    const nextStep = translatePos(current.pos, dir)
    if (current.visited.has(JSON.stringify(nextStep))) {
      continue
    }
    if (!intSet.has(JSON.stringify([nextStep.row, nextStep.col]))) {
      if (charAtPos(map, nextStep) === '#') {
        current.visited.add(JSON.stringify(nextStep))
      }
    } else {
      current.intCount++
    }
    const nextChar = charAtPos(map, nextStep)
    if (nextChar !== '#') { // handle turns
      Object.keys(turns[current.dir]).forEach(key => {
        const newDir = turns[current.dir][key as Turns]
        const newPos = translatePos(current.pos, directions[newDir])
        // console.log(key, newDir)
        if (charAtPos(map, newPos) === '#') {
          queue.push({
            pos: current.pos,
            dir: newDir,
            path: current.path.concat(key),
            visited: new Set(current.visited),
            intCount: current.intCount
          })
        }
      })
    } else {
      if (intSet.has(JSON.stringify([current.pos.row, current.pos.col]))) {
        // console.log('FOUND INTERSECTION')
        // ADD SET TO PATH STATE SO WE DONT RETRACE THE SAME PATH (i.e. go in a circle over and over)
        Object.keys(turns[current.dir]).forEach(key => {
          const newDir = turns[current.dir][key as Turns]
          const newPos = translatePos(current.pos, directions[newDir])
          if (charAtPos(map, newPos) === '#') {
            queue.push({
              pos: current.pos,
              dir: newDir,
              path: current.path.concat(key),
              visited: new Set(current.visited),
              intCount: current.intCount
            })
          }
        })
      }
      const last = current.path[current.path.length - 1]
      if (typeof(last) === 'string') current.path.push(0);
      (current.path[current.path.length - 1] as number)++
      current.pos = nextStep
      queue.push(current)
    }
  }
  return paths
}

function getPathsV2(map: string[][], intersections: [number, number][], endPos: Position) {
  const intPos = intersections.map(int => ({ row: int[0], col: int[1] }))
  const intSet = new Set(intPos.map(int => JSON.stringify(int)))
  const startPos = findStart(map)
  const endStr = JSON.stringify(endPos)
  const queue = [{
    pos: startPos.pos,
    route: [] as Position[],
    pathSet: new Set<string>([ JSON.stringify(startPos.pos) ]),
    dir: startPos.char
  }]
  const paths = []
  const minPathLength = map.reduce((count, row) => {
    return count + row.reduce((miniTotal, cell) => miniTotal + Number(cell === '#'), 0) 
  }, 0)
  while (queue.length) {
    const current = queue.shift()!
    if (JSON.stringify(current.pos) === endStr) {
      if (current.route.length >= minPathLength) {
        paths.push(current)
      }
      continue
    }
    const nextPos = translatePos(current.pos, directions[current.dir])
    const nextChar = charAtPos(map, nextPos)
    if (nextChar !== '#' || intSet.has(JSON.stringify(current.pos))) {
      Object.values(turns[current.dir]).forEach(dirChar => {
        const dir = directions[dirChar]
        const turnPos = translatePos(current.pos, dir)
        const turnPosStr = JSON.stringify(turnPos)
        const turnPosChar = charAtPos(map, turnPos)
        if (turnPosChar !== '#') return
        if (current.pathSet.has(turnPosStr)) return
        const newPath = new Set(current.pathSet)
        if (!intSet.has(turnPosStr)) newPath.add(turnPosStr)
        queue.push({
          pos: turnPos,
          route: current.route.concat(turnPos),
          pathSet: newPath,
          dir: dirChar
        })
      })
    } 
    if (nextChar === '#') {
      const nextPosStr = JSON.stringify(nextPos)
      if (!intSet.has(nextPosStr)) current.pathSet.add(nextPosStr)
      queue.push({
        pos: nextPos,
        route: current.route.concat(nextPos),
        pathSet: current.pathSet,
        dir: current.dir
      })
    }
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
        if (path.length) throw Error('should be impossible')
        return answer
      } else {
        currDir = turns[currDir][turnType as Turns]
      }
      answer.push(turnType, 0)
    }
    (answer[answer.length - 1] as number)++
  }
  return answer
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

  for (let i = 0; i <= maxCharsPerPattern; i++) {
    if (path[i] !== ',') continue
    const result = findPathPattern(
      path.slice(i + 1),
      patterns.concat(path.slice(0, i)),
      order + names[patterns.length] + ','
    )
    if (result) return result
  }
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

function solvePart2(map: string[][], intersections: [number, number][]) {
  const paths = getPaths(map, intersections)
  console.log(paths.length)
  // const pathsV2 = getPathsV2(map, intersections, { row: 28, col: 4 })
  // console.log(pathsV2.length)
  // console.log(paths.map(path => path.path))
  // pathsV2.forEach(path => showPath(map, path.route))
  // console.log(pathsV2.map(path => pathConverter(path.route, '^')))
  // const pathsV3 = getPathsV3(map, intersections)
  // console.log(pathsV3.length)
  const pattern = paths
    .map(path => findPathPattern(path.path.join(',')))
    .filter(Boolean)[0]!
  const ascii = patternToAsciiV2(pattern, 'n')
  const intCodePart2 = runIntCode(program.with(0, 2), 0, ascii)
  return intCodePart2.diagnostics[intCodePart2.diagnostics.length - 1]
}

const startTime = Bun.nanoseconds()
const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number)

const result = runIntCode(program)

const map = drawMap(result.diagnostics)
map.forEach(row => console.log(row.join('')))

const intersections = getIntersections(map)
const part1 = solvePart1(intersections)
console.log(part1, [ 8084 ].includes(part1))

const part2 = solvePart2(map, intersections)
console.log(part2, [ 1119775 ].includes(part2))
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
