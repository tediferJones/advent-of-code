const dirs: { [key: string]: number[] } = {
  'v': [1, 0],
  '^': [-1, 0],
  '>': [0, 1],
  '<': [0, -1]
}

interface QueueItem {
  row: number,
  col: number,
  stepCount: number,
  // seen: string[],
  // intersections: number[][],
  intersections: QueueItem[],
}

function isSurrounded(map: string[][], row: number, col: number) {
  if (map[row][col] === '#') return 4
  return Object.values(dirs).map(dir => {
    const [dy, dx] = dir;
    const [nextY, nextX] = [row + dy, col + dx];
    if (0 > nextY || nextY >= map.length) return
    if (0 > nextX || nextX >= map[0].length) return
    return map[nextY][nextX] === '#';
  }).filter(isHash => isHash).length
}

function walkOnce(
  map: string[][],
  // paths: number[][][],
  paths: QueueItem[],
  // seen: string[],
  end: number[],
  answers: QueueItem[] = [],
  seen: string[] = [],
  // intersections: number[][],
) {
  while (paths.length > 0) {
    // console.log('WHILE LOOP')
    // console.log(paths)
    const newPaths: QueueItem[] = []
    // console.log('CHECKING PATHS: ', paths.length)
    for (let i = 0; i < paths.length; i++) {
      // const [row, col, stepCount, path] = paths[i][paths[i].length - 1];
      const { row, col, stepCount, /*seen,*/ intersections } = paths[i];
      if (row === end[0] && col === end[1]) {
        console.log('END POINT')
        answers.push(paths[i])
        continue
      }
      // const surroundCount = isSurrounded(map, row, col)
      // if (surroundCount < 2) {
      //   intersections.push([row, col])
      // }
      let counter = 0;
      Object.values(dirs).forEach(dir => {
        const [dy, dx] = dir;
        const [newY, newX] = [row + dy, col + dx];
        if (0 > newY || newY >= map.length) return
        if (0 > newX || newX >= map[0].length) return

        const newSurroundCount = isSurrounded(map, newY, newX)
        let split = false;
        if (newSurroundCount < 2) {
          // console.log('NEXT POS IS INTERSECTION')
          // console.log([newY, newX])
          // console.log(paths[i])
          split = true;
          if (seen.includes(JSON.stringify([newY, newX]))) {
            console.log('NEXT POS IS LOOP')
            // intersections.push([newY, newX])
            console.log(intersections)
          }
        }


        if (map[newY][newX] !== '#' && !seen.includes(JSON.stringify([newY, newX]))) {
          seen.push(JSON.stringify([newY, newX]))
          // console.log('new move')
          let intCopy = JSON.parse(JSON.stringify(intersections))
            .concat({
            row: newY,
            col: newX,
            stepCount: stepCount + 1
          })
          counter++
          newPaths.push({
            row: newY,
            col: newX,
            stepCount: stepCount + 1,
            intersections: split ? intCopy : intersections,
          })
        }
      });
      if (counter === 0) {
        console.log('DEAD END, no moves to make')
      }
    }
    paths = newPaths;
  }
  return answers;
}

const map = (await Bun.file('example.txt').text())
// const map = (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''))

const start = [0, map[0].join('').indexOf('.'), 0];
const end = [map.length - 1, map[map.length - 1].join('').indexOf('.')]
const intersections: number[][] = [];
map.forEach((row, y) => {
  row.forEach((char, x) => {
    const hashCount = isSurrounded(map, y, x)
    if (hashCount < 2) {
      intersections.push([y, x])
    }
  })
})
intersections.forEach(arr => console.log(arr))
const test = walkOnce(map, [{
  row: start[0],
  col: start[1],
  // seen: [],
  stepCount: 0,
  intersections: [],
}], end)
console.log(test)

// const answer = longWalkV2(map, [{
//   row: start[0],
//   col: start[1],
//   stepCount: 0,
//   seen: [],
// }], end)
// console.log(answer)
// console.log(answer === 2254 || answer === 94)
