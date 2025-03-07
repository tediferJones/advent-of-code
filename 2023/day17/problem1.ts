// // @ts-ignore
// const top = 0;
// // @ts-ignore
// const parent = i => ((i + 1) >>> 1) - 1;
// // @ts-ignore
// const left = i => (i << 1) + 1;
// // @ts-ignore
// const right = i => (i + 1) << 1;
// 
// class PriorityQueue {
// // @ts-ignore
//   // constructor(comparator = (a, b) => a > b) {
//   // TESTING
//   constructor(comparator = (a, b) => a.heatLoss < b.heatLoss) {
// // @ts-ignore
//     this._heap = [];
// // @ts-ignore
//     this._comparator = comparator;
//   }
//   size() {
// // @ts-ignore
//     return this._heap.length;
//   }
//   isEmpty() {
// // @ts-ignore
//     return this.size() == 0;
//   }
//   peek() {
// // @ts-ignore
//     return this._heap[top];
//   }
// // @ts-ignore
//   push(...values) {
//     values.forEach(value => {
// // @ts-ignore
//       this._heap.push(value);
//       this._siftUp();
//     });
//     return this.size();
//   }
//   pop() {
//     const poppedValue = this.peek();
//     const bottom = this.size() - 1;
//     if (bottom > top) {
//       this._swap(top, bottom);
//     }
// // @ts-ignore
//     this._heap.pop();
//     this._siftDown();
//     return poppedValue;
//   }
// // @ts-ignore
//   replace(value) {
//     const replacedValue = this.peek();
// // @ts-ignore
//     this._heap[top] = value;
//     this._siftDown();
//     return replacedValue;
//   }
// // @ts-ignore
//   _greater(i, j) {
// // @ts-ignore
//     return this._comparator(this._heap[i], this._heap[j]);
//   }
// // @ts-ignore
//   _swap(i, j) {
// // @ts-ignore
//     [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
//   }
//   _siftUp() {
//     let node = this.size() - 1;
//     while (node > top && this._greater(node, parent(node))) {
//       this._swap(node, parent(node));
//       node = parent(node);
//     }
//   }
//   _siftDown() {
//     let node = top;
//     while (
//       (left(node) < this.size() && this._greater(left(node), node)) ||
//       (right(node) < this.size() && this._greater(right(node), node))
//     ) {
//       let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
//       this._swap(node, maxChild);
//       node = maxChild;
//     }
//   }
// }

class PriorityQueueV2 {
  queue: QueueItem[];
  constructor() {
    this.queue = [];
  }
  push(e: QueueItem) {
    // console.log('PUSHING ', e)
    this.queue.push(e)
    this.queue.sort((a, b) => {
      if (a.heatLoss < b.heatLoss) {
      // if (a.totalSteps < b.totalSteps) {
        return -1
      }
      if (a.heatLoss > b.heatLoss) {
      // if (a.totalSteps > b.totalSteps) {
        return 1
      }
      return 0
    })
  }
  pop() {
    // console.log('POPPING')
    const test = this.queue.shift()
    // console.log(test)
    // if (!test) throw Error('NOTHING TO POP')
    // console.log('END OF POPPING')
    return test
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
  // totalSteps: number
}

// Possible dirs
const dirs = [
  [-1, 0], // up
  [1, 0],  // down
  [0, 1],  // right
  [0, -1], // left
]

// const fileContent = await Bun.file('example.txt').text()
const fileContent = await Bun.file('inputs.txt').text()
const map = fileContent
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split('').map(str => Number(str)))
// console.log(map)

for (const line of map) {
  console.log(line)
}

const alreadyVisted: string[] = [];
// PRIORITY QUEUE
const start = {
  heatLoss: 0,
  row: 0,
  col: 0,
  rowDir: 0,
  colDir: 0,
  stepCount: 0,
  // totalSteps: 0,
}
const pq = new PriorityQueueV2()
pq.push(start)
// console.log(pq)

const leastHeat: number[] = [];
while (pq.size() > 0) {
  const test = pq.pop()
  // console.log(test)
  if (test === undefined) {
    console.log('NOTHING TO POP')
    break;
  };
  const { heatLoss, row, col, rowDir, colDir, stepCount } = test;
  // const { heatLoss, row, col, rowDir, colDir, stepCount, totalSteps } = test;
  // const { heatLoss, row, col, rowDir, colDir, stepCount } = pq.pop()

  
  // if (heatLoss > 700) console.log(heatLoss, row, col)
  if (row === map.length - 1 && col === map[0].length - 1) {
    // console.log(row, col)
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

  if (stepCount < 3 && (rowDir !== 0 || colDir !== 0)) {
    const nextRow = row + rowDir;
    const nextCol = col + colDir;
    if (nextRow >= 0 && nextRow < map.length &&
      nextCol >= 0 && nextCol < map[0].length
    ) {
      // if (nextRow === map.length - 1 && nextCol === map[0].length - 1) {
      //   console.log('DONE EARLY, going straight')
      //   console.log(nextRow, nextCol)
      //   console.log(heatLoss, map[nextRow][nextCol])
      // }
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

  dirs.forEach(dir => {
    const [nextRowDir, nextColDir] = dir;
    if ((nextRowDir !== rowDir || nextColDir !== colDir) &&
      (nextRowDir !== rowDir * -1 || nextColDir !== colDir * -1)
    ) {
    // if (!(nextRowDir === rowDir && nextColDir === colDir) &&
    //   !(nextRowDir === rowDir * -1 && nextColDir === colDir * -1)
    // ) {
      const nextRow = row + nextRowDir;
      const nextCol = col + nextColDir;
      // if (nextRow === map.length - 1 && nextCol === map[0].length - 1) {
      //   console.log('DONE EARLY, setting new direction')
      //   console.log(nextRow, nextCol)
      //   console.log(heatLoss, map[nextRow][nextCol])
      // }
      // console.log(nextRow, nextCol)
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

// ANSWER PART 1:
// 722
