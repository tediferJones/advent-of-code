interface Position {
  stepCount?: number,
  row: number,
  col: number,
}

const startTime = Date.now();
function walkV2(queue: Position[], maxStep: number, stepCount: number = 0) {
  // if (stepCount === maxStep) return queue.length
  if (stepCount === maxStep) {
    return {
      answer: queue.length,
      queue,
      stepCount
    }
  }
  let newQueue: Position[] = [];
  queue.forEach(({ row, col }) => {
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(dir => {
      const [dy, dx] = dir;
      const [newRow, newCol] = [row + dy, col + dx]
      let [fixedRow, fixedCol] = [newRow, newCol]
      if (newRow >= map.length || newRow < 0) {
        fixedRow = (fixedRow >= map.length ? fixedRow % map.length
          : (map.length - 1) - Math.abs(fixedRow + 1) % map.length)
      }
      if (newCol >= map[0].length || newCol < 0) {
        fixedCol = (fixedCol >= map[0].length ? fixedCol % map[0].length
          : (map[0].length - 1) - Math.abs(fixedCol + 1) % map[0].length)
      }
      if (map[fixedRow][fixedCol] !== '#' && newQueue.every(pos => pos.row !== newRow || pos.col !== newCol)) {
        newQueue.push({
          row: newRow,
          col: newCol,
        })
      }
    })
  });
  return walkV2(newQueue, maxStep, stepCount + 1)
}

// const map = (await Bun.file('example.txt').text())
const map = (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''))

const start: Position = {
  row: 0,
  col: 0,
}
map.some((line, y) => {
  return line.some((char, x) => {
    if (char === 'S') {
      start.row = y;
      start.col = x;
      return true
    }
  })
})
// WORKING
// const answer = walkV2([start], 65);
// console.log(answer)
// console.log(answer === 3532 || answer === 64)

const size = map.length
// Step count to first edge of map
const original = Math.floor(size / 2)
// console.log(original)

function getQuadraticEquation() {
  // I was only able to figure this out thanks to this video:
  // https://www.youtube.com/watch?v=C5wYxR6ZAPM&t=5209s&ab_channel=HyperNeutrino
  // Start at 1:21:00
  const results = [];
  let x = 0;
  let oldResult = {
    answer: 0,
    queue: [start],
    stepCount: 0,
  }
  while (true) {
    console.log(results)
    console.log('Checking for max step count of: ')
    console.log(original + size * x)
    const walkResult = walkV2(oldResult.queue, original + size * x, oldResult.stepCount)
    results.push(walkResult.answer)
    oldResult = walkResult
    x = x + 1;
    if (results.length >= 4) {
      const [one, two, three, four] = results;
      const [fd1, fd2, fd3] = [two - one, three - two, four - three]
      const [sd1, sd2] = [fd2 - fd1, fd3 - fd2]
      if (sd1 === sd2) {
        console.log('diffs are equal')
        break;
      } else {
        results.shift()
      }
    }
  }
  console.log('DONE')
  console.log(results)
  const [alpha, beta, gamma] = results;
  const c = alpha;
  const a = (gamma - 2 * beta + c) / 2
  const b = (beta - c - a)
  console.log(a, b, c)
  const eq = (x: number) => a*x**2 + b*x + c
  // Test to make sure equation solves correctly
  console.log(eq(0), eq(1), eq(2), eq(3))
  return eq
}
const endTime = Date.now();
console.log(`Time: ${(endTime - startTime) / 1000} seconds`)

// WORKING
const steps = 26501365

// This is the result of running getQuadraticEquation
const realEq = (x: number) => 14419*x**2 + 14590*x + 3703

console.log('THE REAL ANSWER IS: ', realEq((steps - original) / size))

// ANSWER PART 1: 3532
// ANSWER PART 2: 590104708070703
