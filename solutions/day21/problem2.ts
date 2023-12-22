interface Position {
  stepCount?: number,
  row: number,
  col: number,
}

const startTime = Date.now();
function walkV2(queue: Position[], maxStep: number, stepCount: number = 0) {
  if (stepCount === maxStep) return queue.length
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

const map = (await Bun.file('example.txt').text())
// const map = (await Bun.file('inputs.txt').text())
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
const answer = walkV2([start], 100);
console.log(answer)
console.log(answer === 3532 || answer === 64)
const endTime = Date.now();
console.log(`Time: ${(endTime - startTime) / 1000} seconds`)

// ANSWER PART 1: 3532
