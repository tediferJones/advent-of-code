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
  seen: string[],
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

// function walkInOrder(map: string[], nextSteps: number[][], end: number[], graph: any, seen: string[]) {
//   for (let i = 0; i < nextSteps.length; i++) {
//     const { row, col, stepCount, seen } = nextSteps[i];
//     if (row === end[0] && col === end[1]) {
//       if (stepCount > best) {
//         console.log('NEW BEST: ', stepCount)
//         best = stepCount
//       }
//     }
//     const newSeen = seen.concat([JSON.stringify([row, col])])
// 
//     // const curChar = map[row][col];
//     // const test = 'v^<>'.includes(curChar) ? [dirs[curChar]] : Object.values(dirs);
//     const test = Object.values(dirs)
// 
//     test.forEach(dir => {
//       const [dy, dx] = dir;
//       const [nextY, nextX] = [row + dy, col + dx];
//       if (0 > nextY || nextY >= map.length) return
//       if (0 > nextX || nextX >= map[0].length) return
//       if (map[nextY][nextX] !== '#') {
//         // const hashCount = isSurrounded(map, nextY, nextX)
//         if (newSeen.includes(JSON.stringify([nextY, nextX]))) {
//           return
//         }
//         newSteps.push({
//           row: nextY,
//           col: nextX,
//           stepCount: stepCount + 1,
//           seen: newSeen,
//         });
//       }
//     })
//   }
// }

// We want to crawl the map one time
// This should return some structure that indicates the relationships between intersections
// i.e which intersections can point to which other instersection and the stepCount between them
// Then just find the longest possible combination that involves none of the same intersection points

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
// const answer = longWalkV2(map, [{
//   row: start[0],
//   col: start[1],
//   stepCount: 0,
//   seen: [],
// }], end)
// console.log(answer)
// console.log(answer === 2254 || answer === 94)
