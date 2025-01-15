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
        return miniTotal.concat([ [ i, j ] ])
      }, [] as [number, number][])
    )
  }, [] as [number, number][])
}

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

type PathState = { pos: Position, dir: DirChars, path: (string|number)[], visited: Set<string> } 
function getPaths(map: string[][], intersections: [number, number][]) {
  const intSet = new Set(intersections.map(int => JSON.stringify(int)))
  const { pos, char } = findStart(map)
  const queue: PathState[] = [ { pos, dir: char, path: [], visited: new Set() } ]
  const endPos = { row: 28, col: 4 }
  // const endPos = { row: 2, col: 0 }
  const paths: PathState[] = []
  // console.log(intSet)
  let count = 0
  while (queue.length) {
    // count++
    // if (count > 5) break
    // console.log(queue.length)
    const current = queue.shift()!
    // console.log(current)
    if (JSON.stringify(current.pos) === JSON.stringify(endPos)) {
      paths.push(current)
      continue
    }
    const dir = directions[current.dir]
    const nextStep = translatePos(current.pos, dir)
    if (current.visited.has(JSON.stringify(nextStep))) {
      continue
    }
    // current.visited.add(JSON.stringify(nextStep))
    if (!intSet.has(JSON.stringify([nextStep.row, nextStep.col]))) {
      current.visited.add(JSON.stringify(nextStep))
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
            visited: new Set(current.visited)
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
              visited: new Set(current.visited)
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

// type PathState = { pos: Position, dir: DirChars, path: (string|number)[], visited: Set<string> } 
// function getPaths(map: string[][], intersections: [number, number][]) {
//   // const intSet = new Set(intersections.map(int => JSON.stringify(int)))
//   const intSet = new Set(intersections.map(int => {
//     const [ row, col ] = int
//     return JSON.stringify({ row, col })
//   }))
//   const { pos, char } = findStart(map)
//   const queue: PathState[] = [ { pos, dir: char, path: [], visited: new Set() } ]
//   const endPos = { row: 28, col: 4 }
//   const paths: PathState[] = []
//   console.log(intSet)
//   while (queue.length) {
//     const current = queue.shift()!
//     if (JSON.stringify(current.pos) === JSON.stringify(endPos)) {
//       paths.push(current)
//       continue
//     }
//     const dir = directions[current.dir]
//     const nextStep = translatePos(current.pos, dir)
//     if (current.visited.has(JSON.stringify(nextStep))) {
//       continue
//     }
//     if (!intSet.has(JSON.stringify(nextStep))) {
//       current.visited.add(JSON.stringify(nextStep))
//     }
//     const nextChar = charAtPos(map, nextStep)
//     if (nextChar !== '#') { // handle turns
//       Object.keys(turns[current.dir]).forEach(key => {
//         const newDir = turns[current.dir][key as Turns]
//         const newPos = translatePos(current.pos, directions[newDir])
//         // console.log(key, newDir)
//         if (charAtPos(map, newPos) === '#') {
//           queue.push({
//             pos: current.pos,
//             dir: newDir,
//             path: current.path.concat(key),
//             visited: new Set(current.visited)
//           })
//         }
//       })
//     } else {
//       // if (intSet.has(JSON.stringify([current.pos.row, current.pos.col]))) {
//       if (intSet.has(JSON.stringify(current))) {
//         console.log('FOUND INTERSECTION')
//         // ADD SET TO PATH STATE SO WE DONT RETRACE THE SAME PATH (i.e. go in a circle over and over)
//         Object.keys(turns[current.dir]).forEach(key => {
//           const newDir = turns[current.dir][key as Turns]
//           const newPos = translatePos(current.pos, directions[newDir])
//           if (charAtPos(map, newPos) === '#') {
//             queue.push({
//               pos: current.pos,
//               dir: newDir,
//               path: current.path.concat(key),
//               visited: new Set(current.visited)
//             })
//           }
//         })
//       }
//       const last = current.path[current.path.length - 1]
//       if (typeof(last) === 'string') current.path.push(0);
//       (current.path[current.path.length - 1] as number)++
//       current.pos = nextStep
//       queue.push(current)
//     }
//   }
//   return paths
// }



function findPathPattern(paths: (string|number)[][]) {
  console.log(paths)
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number)

const result = runIntCode(program)

const map = drawMap(result.diagnostics)
map.forEach(row => console.log(row.join('')))

const intersections = getIntersections(map)
const part1 = solvePart1(intersections)
console.log(part1, [ 8084 ].includes(part1))

const paths = getPaths(map, intersections)
console.log('PATHS', paths.length)
// paths.forEach(path => console.log(path.visited.size))
const minPathLength = map.reduce((count, row) => {
  return count + row.reduce((miniTotal, cell) => miniTotal + Number(cell === '#'), 0) 
}, 0) + intersections.length
console.log(minPathLength)
// const mostSteps = Math.max(...paths.map(path => path.visited.size))
// const longestPath = paths.find(path => path.visited.size === mostSteps)
const longestPath = paths.filter(path => path.visited.size >= minPathLength)
console.log(longestPath.map(path => path.path))
// const bestPath = findPathPattern(paths.map(path => path.path))
// const test = runIntCode(program.with(0, 2), 0, [ 'A,A,B,C\n', 'R,12,L,10,L,10,L,6,L,12,R,12,L,4' ])
// console.log(test)

// THIS IS THE PATH THAT MIGHT WORK:
// [
//   "R", 12, "L", 10, "L", 10, "L", 6, "L", 12, "R", 12, "L", 4, "R", 12, "L", 10, "L", 10, "L", 6, "L",
//   12, "R", 12, "L", 4, "L", 12, "R", 12, "L", 6, "L", 6, "L", 12, "R", 12, "L", 4, "L", 12, "R", 12, "L",
//   6, "R", 12, "L", 10, "L", 10, "L", 12, "R", 12, "L", 6, "L", 12, "R", 12, "L", 6
// ]


// 'R,12,L,10,L,10,L,6,L,12,R,12,L,4'

// THIS COULD WORK
// "R", 12, A
// "L", 10,
// "L", 10,
// "L", 6,
// "L", 12,
// "R", 12,
// "L", 4,
//
// "R", 12, A
// "L", 10,
// "L", 10,
// "L", 6,
// "L", 12,
// "R", 12,
// "L", 4,
//
// "L", 12, B
// "R", 12,
// "L", 6,
// "L", 6,
// "L", 12,
// "R", 12,
// "L", 4,
// "L", 12,
// "R", 12,
//
// "L", 6, C
// "R", 12,
// "L", 10,
// "L", 10,
// "L", 12,
// "R", 12,
// "L", 6,
// "L", 12,
// "R", 12,
// "L", 6

// const testMap = 
// `#######...#####
// #.....#...#...#
// #.....#...#...#
// ......#...#...#
// ......#...###.#
// ......#.....#.#
// ^########...#.#
// ......#.#...#.#
// ......#########
// ........#...#..
// ....#########..
// ....#...#......
// ....#...#......
// ....#...#......
// ....#####......`
// 
// const testMapV2 = testMap.split(/\n/).map(row => {
//   return row.split('')
// })
// console.log(testMapV2)
// const testPaths = getPaths(testMapV2, getIntersections(testMapV2))
// console.log(testPaths.map(test => test.path))
