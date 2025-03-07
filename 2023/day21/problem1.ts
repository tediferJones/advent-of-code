interface Position {
  stepCount: number,
  row: number,
  col: number,
}

const dirs = [ [-1, 0], [1, 0], [0, -1], [0, 1], ];
function walk(queue: Position[], resultCounter = 0) {
  const maxStep = 64
  const pos = queue.shift()
  if (!pos) return 'There is a problem'
  const { stepCount, row, col } = pos
  if (stepCount === maxStep) return queue
  dirs.forEach(dir => {
    const [dy, dx] = dir;
    const newChar = map[row + dy][col + dx]
    if (newChar === '.' || newChar === 'S') {
      if (!queue.some(pos => {
        return (pos.stepCount === stepCount + 1) &&
          pos.row === row + dy && pos.col === col + dx
      })) {
        if (stepCount + 1 === maxStep) {
          resultCounter++
        }
        queue.push({
          stepCount: stepCount + 1,
          row: row + dy,
          col: col + dx,
        })
      }
    }
  })
  return walk(queue, resultCounter)
}

// const map = (await Bun.file('example.txt').text())
const map = (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''))
// map.forEach(line => console.log(line.join('')))

const start: Position = {
  stepCount: 0,
  row: 0,
  col: 0,
}
map.some((line, y) => {
  return line.some((char, x) => {
    if (char === 'S') {
      // start = [y, x]
      start.row = y;
      start.col = x;
      return true
    }
  })
})
console.log(walk([start]).length + 1)

// ANSWER PART 1: 3532
