interface Table { [key: string]: number[][] }

const startTime = Date.now();
const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function findIntersections(map: string[][]) {
  const intersections: number[][] = [];
  map.forEach((row, y) => {
    row.forEach((char, x) => {
      if (char !== '#' && getHashCount(map, y, x) < 2) {
        intersections.push([y, x]);
      }
    })
  })
  return intersections;
}

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

  for (const cursor of test) {
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

function dfsV2(
  table: Table,
  pos: number[],
  [endRow, endCol]: number[],
  seen: string[] = []
) {
  const [row, col] = pos;
  if (row === endRow && col === endCol) return 0;
  let totalStepCount = -Infinity;
  table[[row, col].join()].forEach(nextPos => {
    const [nextRow, nextCol, stepCount] = nextPos;
    if (!seen.includes([nextRow, nextCol].join())) {
      totalStepCount = Math.max(totalStepCount, stepCount + dfsV2(table, [nextRow, nextCol], end, seen.concat([row, col].join())))
    }
  })
  return totalStepCount
}

// const map = (await Bun.file('example.txt').text())
const map = (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''))

const start = [0, map[0].join('').indexOf('.')];
const end = [map.length - 1, map[map.length - 1].join('').indexOf('.')];
const table = [start, ...findIntersections(map)].reduce((table, point) => {
  table[point.join()] = connections(map, point[0], point[1]);
  return table;
}, {} as Table)

const answer = dfsV2(table, start, end)
console.log(answer)
console.log([6394, 154].includes(answer))
const endTime = Date.now();
console.log(`Total Time: ${(endTime - startTime) / 1000} seconds`)

