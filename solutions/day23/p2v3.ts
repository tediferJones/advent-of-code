const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function getHashCount(map: string[][], row: number, col: number) {
  const start = [0, map[0].join('').indexOf('.'), 0];
  const end = [map.length - 1, map[map.length - 1].join('').indexOf('.')]
  if (row === start[0] && col === start[1]) return 4
  if (row === end[0] && col === end[1]) return 4
  return dirs.map(dir => {
    const [dy, dx] = dir;
    const [nextY, nextX] = [row + dy, col + dx];
    if (0 > nextY || nextY >= map.length) return
    if (0 > nextX || nextX >= map[0].length) return
    return map[nextY][nextX] === '#';
  }).filter(isHash => isHash).length
}

function connections(map: string[][], row: number, col: number): number[][] {
  const nextIntersections: number[][] = [];
  const seen = [JSON.stringify([row, col])]
  const test: number[][] = [];
  for (const dir of dirs) {
    const [dy, dx] = dir;
    const [newY, newX] = [row + dy, col + dx]
    if (0 > newY || newY >= map.length) continue
    if (0 > newX || newX >= map[0].length) continue
    if (map[newY][newX] !== '#') {
      seen.push(JSON.stringify([newY, newX]))
      test.push([newY, newX, 1])
    }
  }

  // console.log('STARTING POSITIONS')
  // console.log(test)
  for (const cursor of test) {
    if (cursor === undefined) throw Error('Cursor Not Found')
    let [row, col, stepCount] = cursor;
    while (getHashCount(map, row, col) === 2) {
      for (const dir of dirs) {
        const [dy, dx] = dir;
        const [newY, newX] = [row + dy, col + dx]
        if (0 > newY || newY >= map.length) continue
        if (0 > newX || newX >= map[0].length) continue
        if (map[newY][newX] !== '#' && !seen.includes(JSON.stringify([newY, newX]))) {
          seen.push(JSON.stringify([newY, newX]))
          row = newY;
          col = newX;
          stepCount = stepCount + 1;
          break;
        }
      }
    }
    nextIntersections.push([row, col, stepCount])
  }

  return nextIntersections
}

interface Path {
  row: number,
  col: number,
  stepCount: number,
  seen: string[],
}

function findAllPaths(table: Table, start: number[], end: number[]) {
  // Seen needs to be independent for each possible path
  const seen = [JSON.stringify([start[0], start[1]])]
  // let paths = [ [start[0], start[1], 0] ];
  let paths: Path[] = [{
    row: start[0],
    col: start[1],
    stepCount: 0,
    seen: [JSON.stringify([start[0], start[1]])],
  }]
  const answers: number[][] = []
  while (paths.length) {
    // console.log(paths)
    const newPaths: Path[] = []
    for (const path of paths) {
      // const [row, col, stepCount] = path;
      const { row, col, stepCount, seen } = path;
      // console.log(JSON.stringify([row, col]))
      const newSeen = JSON.parse(JSON.stringify(seen))
      const nextPositions = table[JSON.stringify([row, col])];
      // seen.push(JSON.stringify([row, col]))
      // newSeen.push(JSON.stringify([row, col]))
      nextPositions.forEach(pos => {
        const [nextRow, nextCol, nextStepCount] = pos;
        if (nextRow === end[0] && nextCol === end[1]) {
          // console.log('FOUND END POSITION')
          answers.push([nextRow, nextCol, stepCount + nextStepCount])
          return
        }
        if (!seen.includes(JSON.stringify([nextRow, nextCol]))) {
          newPaths.push({
            row: nextRow,
            col: nextCol,
            stepCount: stepCount + nextStepCount,
            seen: newSeen.concat(JSON.stringify([nextRow, nextCol])) // newSeen,
          })
          // newPaths.push([nextRow, nextCol, stepCount + nextStepCount])
          // seen.push(JSON.stringify([nextRow, nextCol]))
        }
      })
    }
    paths = newPaths;
  }
  return answers
}

const map = (await Bun.file('example.txt').text())
// const map = (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''))

const start = [0, map[0].join('').indexOf('.')];
const end = [map.length - 1, map[map.length - 1].join('').indexOf('.')];

const intersections: number[][] = [];
map.forEach((row, y) => {
  row.forEach((char, x) => {
    if (char === '#') return
    const hashCount = getHashCount(map, y, x)
    if (hashCount < 2) {
      intersections.push([y, x])
    }
  })
})
// intersections.forEach(arr => console.log(arr))
const allPoints = [start, ...intersections] // , end];
// console.log(allPoints)
interface Table {
  [key: string]: number[][],
}
const table: Table = {}
for (const point of allPoints) {
  table[JSON.stringify(point)] = connections(map, point[0], point[1])
}
console.log(table)
// console.log(findAllPaths(table, start, end))
const answers = findAllPaths(table, start, end)
let best = 0;
for (const answer of answers) {
  if (answer[2] > best) {
    best = answer[2]
  }
}
console.log(best)

// console.log(getHashCount(map, 3, 12))
// console.log(connections(map, start[0], start[1]))
// doThing(map, [start], end)
// console.log(getNextIntersections(map, start, end))
