const startTime = Date.now();
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
  return Object.values(dirs).map(dir => {
    const [dy, dx] = dir;
    const [nextY, nextX] = [row + dy, col + dx];
    if (0 > nextY || nextY >= map.length) return
    if (0 > nextX || nextX >= map[0].length) return
    return map[nextY][nextX] === '#';
  }).filter(isHash => isHash).length
}

function longWalkV2(
  map: string[][],
  nextSteps: QueueItem[],
  end: number[],
  best: number = 0,
) {
  if (nextSteps.length === 0) {
    return best
  }
  const newSteps: QueueItem[] = []
  for (let i = 0; i < nextSteps.length; i++) {
    const { row, col, stepCount, seen } = nextSteps[i];
    if (row === end[0] && col === end[1]) {
      if (stepCount > best) {
        console.log('NEW BEST: ', stepCount)
        best = stepCount
      }
    }
    const newSeen = seen.concat([JSON.stringify([row, col])])

    // const curChar = map[row][col];
    // const test = 'v^<>'.includes(curChar) ? [dirs[curChar]] : Object.values(dirs);
    const test = Object.values(dirs)

    test.forEach(dir => {
      const [dy, dx] = dir;
      const [nextY, nextX] = [row + dy, col + dx];
      if (0 > nextY || nextY >= map.length) return
      if (0 > nextX || nextX >= map[0].length) return
      if (map[nextY][nextX] !== '#') {
        // const hashCount = isSurrounded(map, nextY, nextX)
        if (newSeen.includes(JSON.stringify([nextY, nextX]))) {
          return
        }
        newSteps.push({
          row: nextY,
          col: nextX,
          stepCount: stepCount + 1,
          seen: newSeen,
        });
      }
    })
  }
  return longWalkV2(map, newSteps, end, best)
}

// const map = (await Bun.file('example.txt').text())
const map = (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''))

const start = [0, map[0].join('').indexOf('.'), 0];
const end = [map.length - 1, map[map.length - 1].join('').indexOf('.')]
const answer = longWalkV2(map, [{
  row: start[0],
  col: start[1],
  stepCount: 0,
  seen: [],
}], end)
console.log(answer)
console.log(answer === 2254 || answer === 94)
const endTime = Date.now();
console.log(`TIME: ${(endTime - startTime) / 1000}`)

// ANSWER PART 1: 2254
