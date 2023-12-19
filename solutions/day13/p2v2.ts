// seperate tables
// get col and row counts
// check for reflections

function rotateArray(lines: string[]) {
  const result = [...Array(lines[0].length).keys()].map(i => {
    return lines.map(line => line[i]).join('')
    // TESTING
    // THIS SEEMS BETTER BUT IDK
    // return lines.map(line => line[i]).toReversed().join('')
  })
  // console.log(result)
  return result;
}
// rotateArray([
//   '123',
//   '456',
//   '789',
// ])

function validOnAllLines(lines: string[], start: number, mid: number, end: number) {
  let smudgeCounter = 0;
  const res = lines.every(line => {
    const left = line.slice(start, mid)
    const right = line.slice(mid, end)
    if (left === right.split('').toReversed().join('')) {
      return true
    }
    smudgeCounter++
    return false
    // return smudgeCounter < 2
  })
  // return res
  return {
    status: res,
    isSmudge: false,
    // isSmudge: res && smudgeCounter < 2
    // isSmudge: res && smudgeCounter === 1
  }
}

// interface Result {
//   splitNum: number,
//   size: number,
//   isSmudge?: boolean
//   isHorizontal?: boolean
// }

// function scanLine(lines: string[], splitNum: number) {
//   const line = lines[0];
//   let maxLength = line.length % 2 === 0 ? line.length : line.length - 1;
//   // let test;
//   const result: Result[] = [];
//   for (let size = maxLength; size > 0; size-=2) {
//     // Only even numbers, length of full mirror
//     const step = size / 2;
//     const start = splitNum - step;
//     const end = splitNum + step;
//     if (start < 0 || end > line.length) {
//       continue
//     }
//     const left = line.slice(start, splitNum);
//     const right = line.slice(splitNum, end);
//     if (left === right.split('').toReversed().join('')) {
//       // if (validOnAllLines(lines, start, splitNum, end)) {
//       const { status, isSmudge } = validOnAllLines(lines, start, splitNum, end)
//       if (status) {
//         // return {}
//         result.push({
//           splitNum,
//           size,
//           isSmudge,
//           isHorizontal: false,
//         })
//       }
//       // if (isSmudge) console.log('SMUDGE')
//       // // if (status && isSmudge) {
//       // if (status) {
//       //   result.push({
//       //     splitNum,
//       //     size,
//       //     isSmudge,
//       //   })
//       //   break;
//       // }
// 
//     }
//     // console.log(left, right)
//   }
//   if (result.length === 0) return undefined
//   return result.reduce((old, cur) => {
//     return old.size > cur.size ? old : cur
//   })
//   // let best = result[0]
//   // let best = {
//   //   size: 0,
//   //   splitNum: 0,
//   // };
//   // for (const obj of result) {
//   //   // console.log(obj)
//   //    if (obj.size > best.size) {
//   //   // if (obj.isSmudge && obj.size > best.size) {
//   //   // if (obj.isSmudge) {
//   //     best = obj
//   //   }
//   // }
//   // for (const test of result) {
//   //   // @ts-ignore
//   //   let temp = 0
//   //   const length = test.horizontal ? lines.length : lines[0].length;
//   //   if (test.splitNum - (test.size / 2) === 0 || test.splitNum + (test.size / 2) === length) {
//   //     // if (test.isSmudge) {
//   //     temp = Math.abs(length / 2 - test.splitNum)
//   //     // console.log('OUT OF ALL OPTIONS THIS ONE IS CLOSEST TO THE EDGE')
//   //     // console.log(test)
//   //     best = test
//   //   }
//   // }
//   // return best || {
//   //   size: 0,
//   //   splitNum: 0
//   // }
// }

function scanForSym(lines: string[]) {
  const lineLength = lines[0].length;
  const line = lines[0];
  const maxSize = Math.floor(line.length / 2)
  let isOdd = lineLength % 2 !== 0
  let tickDown = false;
  let size = 0;
  let counter = 0;
  for (let i = 1; i <= lineLength - 1; i++) {
    if (tickDown) {
      size--
      counter+=2
    } else {
      size++
    }
    if (size === maxSize) {
      tickDown = true
    }
    const start = (maxSize === size && isOdd) ? counter-- : counter 
    const mid = i;
    const end = !(maxSize === size && isOdd) && tickDown ? lineLength : size*2
    const left = line.slice(start, mid)
    const right = line.slice(mid, end)
    if (left === right.split('').toReversed().join('')) {
      const { status, isSmudge } = validOnAllLines(lines, start, mid, end)
      // const { status, isSmudge } = validOnAllLines(lines, start, mid, end)
      if (status) {
      // if (status && isSmudge) {
        return {
          splitNum: i,
          size,
          isSmudge,
          isHorizontal: false,
        }
      }
    } 
    if (isOdd && size === maxSize) {
      isOdd = false
      // counter--
    }
  }
}
// const test1 = ['12345678']
// const test2 = ['123456789']
// console.log(scanForSym(test1))
// console.log(scanForSym(test2))
// console.log(scanForSym(test.toReversed()))

// const fileContent = await Bun.file('example.txt').text()
const fileContent = await Bun.file('inputs.txt').text()
const tables = fileContent.split(/\n\n/)
let total = 0;
for (const table of tables) {
  let map = table.split(/\n/).filter(line => line)
  // console.log(map)
  map.forEach(line => console.log(line))
  console.log('')
  // console.log(scanForSym(map))
  // const rotatedArray = rotateArray(map);
  // console.log(scanForSym(rotatedArray))
  console.log('CHECKING FOR VERTICAL SPLIT')
  const veticalResult = scanForSym(map)
  console.log('CHECKING FOR HORIZONTAL SPLIT')
  const rotatedArray = rotateArray(map);
  const horizontalResult = scanForSym(rotatedArray)
  if (veticalResult) {
    total += veticalResult.splitNum
  }
  if (horizontalResult) {
    total += horizontalResult.splitNum * 100
  }
}

console.log('answer', total)
console.log(total === 29130)

// ANSWER PART 1: 29130
// ANSWER PART 2: 33438

// WRONG ANSWERS PART 2: 
// 39185
// 32795
// 38789

