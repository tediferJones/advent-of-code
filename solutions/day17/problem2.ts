// Many thanks to these two people, I have never done dijkstras algorithm before
// and would not have been able to complete this without them
// https://github.com/hyper-neutrino/advent-of-code/blob/main/2023/day17p1.py
// https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript

class PriorityQueueV2 {
  queue: QueueItem[];
  constructor() {
    this.queue = [];
  }
  push(e: QueueItem) {
    this.queue.push(e)
    this.queue.sort((a, b) => {
      if (a.heatLoss < b.heatLoss) {
        return -1
      }
      if (a.heatLoss > b.heatLoss) {
        return 1
      }
      return 0
    })
  }
  pop() {
    return this.queue.shift()
  }
  size() {
    return this.queue.length
  }
}

interface QueueItem {
  heatLoss: number,
  row: number,
  col: number,
  rowDir: number,
  colDir: number,
  stepCount: number,
}

// Possible dirs
const dirs = [
  [-1, 0], // up
  [1, 0],  // down
  [0, 1],  // right
  [0, -1], // left
]

const fileContent = await Bun.file('example.txt').text()
// const fileContent = await Bun.file('inputs.txt').text()
const map = fileContent
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split('').map(str => Number(str)))
// console.log(map)

for (const line of map) {
  console.log(line)
}

const alreadyVisted: string[] = [];
const start = {
  heatLoss: 0,
  row: 0,
  col: 0,
  rowDir: 0,
  colDir: 0,
  stepCount: 0,
}
const pq = new PriorityQueueV2()
pq.push(start)

const leastHeat: number[] = [];
while (pq.size() > 0) {
  const test = pq.pop()
  if (test === undefined) {
    console.log('NOTHING TO POP')
    break;
  };
  const { heatLoss, row, col, rowDir, colDir, stepCount } = test;
  // const { heatLoss, row, col, rowDir, colDir, stepCount } = pq.pop()

  
  // if (heatLoss > 700) console.log(heatLoss, row, col)

  // if (row === map.length - 1 && col === map[0].length - 1) {
  if (row === map.length - 1 && col === map[0].length - 1 && stepCount > 4) {
    console.log('ANSWER', heatLoss)
    break;
  }

  if (!(heatLoss % 100)) {
    if (!leastHeat.includes(heatLoss)) {
      leastHeat.push(heatLoss)
      console.log(heatLoss)
    }
  }

  if (alreadyVisted.includes(JSON.stringify({
    row,
    col,
    rowDir,
    colDir,
    stepCount,
  }))) {
    continue;
  }
  alreadyVisted.push(JSON.stringify({
    row,
    col,
    rowDir,
    colDir,
    stepCount,
  }))

  // if (stepCount < 3 && (rowDir !== 0 || colDir !== 0)) {
  if (stepCount < 10 && (rowDir !== 0 || colDir !== 0)) {
    const nextRow = row + rowDir;
    const nextCol = col + colDir;
    if (nextRow >= 0 && nextRow < map.length &&
      nextCol >= 0 && nextCol < map[0].length
    ) {
      pq.push({
        heatLoss: heatLoss + map[nextRow][nextCol],
        row: nextRow,
        col: nextCol,
        rowDir,
        colDir,
        stepCount: stepCount + 1,
      })
    }
  }

  if (stepCount >= 4 || (rowDir === 0 && colDir === 0)) {
    dirs.forEach(dir => {
      const [nextRowDir, nextColDir] = dir;
      if ((nextRowDir !== rowDir || nextColDir !== colDir) &&
        (nextRowDir !== rowDir * -1 || nextColDir !== colDir * -1)
      ) {
        const nextRow = row + nextRowDir;
        const nextCol = col + nextColDir;
        if (nextRow >= 0 && nextRow < map.length &&
          nextCol >= 0 && nextCol < map[0].length
        ) {
          pq.push({
            heatLoss: heatLoss + map[nextRow][nextCol],
            row: nextRow,
            col: nextCol,
            rowDir: nextRowDir,
            colDir: nextColDir,
            stepCount: 1,
          })
        }
      }
    })
  }
}

// It takes like 5 hours, but it works
// ANSWER PART 2: 894
// ANSWER PART 1: 722

// TOO HIGH:
// 724
