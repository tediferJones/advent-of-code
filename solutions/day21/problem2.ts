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

// Essentially copied all of this from:
// https://www.youtube.com/watch?v=C5wYxR6ZAPM&t=5209s&ab_channel=HyperNeutrino
// Start at 1:21:00
// TESTING
const steps = 26501365
const size = map.length
// SHOULD WORK
const original = steps % (2 * size)
// TESTING
// const original = steps % size
// console.log(walkV2([start], 5)) // First map edge
const results = [];
let x = 0;
let oldResult = {
  answer: 0,
  queue: [start],
  stepCount: 0,
}
while (true) {
  console.log(results)
  // results.push(walkV2([start], x))
  // results.push(walkV2([start], original + 2 * size * x))

  // Probably right
  const walkResult = walkV2(oldResult.queue, original + 2 * size * x, oldResult.stepCount)

  // Probably borked
  // const walkResult = walkV2(oldResult.queue, original + size * x, oldResult.stepCount)
  // console.log(walkResult)
  results.push(walkResult.answer)
  oldResult = walkResult
  x = x + 1;
  if (results.length >= 4) {
    const [one, two, three, four] = results;
    const [fd1, fd2, fd3] = [two - one, three - two, four - three]
    const [sd1, sd2] = [fd2 - fd1, fd3 - fd2]
    console.log(sd1, sd2)
    if (sd1 === sd2) {
      console.log('diffs are equal')
      break;
    } else {
      results.shift()
    }
  }
}
const offset = x - 4;
console.log('DONE?')
console.log(results)
const [alpha, beta, gamma] = results;
const c = alpha;
const a = (gamma - 2 * beta + c) / 2
const b = (beta - c - a)
console.log(a, b, c)
const eq = (x: number) => a*x**2 + b*x + c
console.log(eq(0), eq(1), eq(2), eq(3))
const realAnswer = eq(Math.floor(steps / 2 * size) - offset)
console.log(realAnswer)

const endTime = Date.now();
console.log(`Time: ${(endTime - startTime) / 1000} seconds`)

// console.log(walkV2([start], 65)) // First map edge
// console.log(walkV2([start], 65 + 131)) // Second map edge
// console.log(walkV2([start], 65 + (131 * 2))) // Third map edge
// 3703 First Edge
// 32712 Second Edge
// 90559 Third Edge
//
// WRONG
// y = 87x^2 - 1351x + 51865
// const equation = (x: number) => (87 * x**2) - (1351 * x) + 51865
// console.log('equation answer')
// console.log(equation(65))

// we want to derive a quadratic equation
// The total step count will reach an edge of the map

// ANSWER PART 1: 3532
//
// PART 2 WRONG ANSWERS:
// Too High:
// 43446443291092095000000
