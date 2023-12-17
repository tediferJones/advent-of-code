// seperate tables
// get col and row counts
// check for reflections

function rotateArray(lines: string[]) {
  const result = [...Array(lines[0].length).keys()].map(i => {
    // return lines.map(line => line[i]).join('')
    // TESTING
    // THIS SEEMS BETTER BUT IDK
    return lines.map(line => line[i]).toReversed().join('')
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
    // isSmudge: res && smudgeCounter < 2
    isSmudge: res && smudgeCounter === 1
  }
}

// function getOrderedIndices(length: number) {
//   const mid = Math.floor(length / 2) + (length % 2 === 0 ? 0 : 1)
//   const result: number[] = [mid]
//   // let amount = 1;
//   for (let i = 1; i < length; i++) {
//     const direction = (i % 2 ? -1 : 1);
//     const change = Math.floor(i / 2) * direction
//     console.log(i, length, change)
//     result.push(mid + (change))
//   }
//   return result;
// }

function scanLine(lines: string[], splitNum: number) {
  const line = lines[0];
  let maxLength = line.length % 2 === 0 ? line.length : line.length - 1;
  // let test;
  const result: { splitNum: number, size: number }[] = [];
  for (let size = maxLength; size > 0; size-=2) {
    // Only even numbers, length of full mirror
    const step = size / 2;
    const start = splitNum - step;
    const end = splitNum + step;
    if (start < 0 || end > line.length) {
      continue
    }
    const left = line.slice(start, splitNum);
    const right = line.slice(splitNum, end);
    if (left === right.split('').toReversed().join('')) {
      // if (validOnAllLines(lines, start, splitNum, end)) {
        const { status, isSmudge } = validOnAllLines(lines, start, splitNum, end)
      if (isSmudge) console.log('SMUDGE')
      // if (status && isSmudge) {
      if (status) {
        result.push({
          splitNum,
          size,
          isSmudge,
        })
        break;
      }
    }
    // console.log(left, right)
  }
  let best = result[0]
  // let best = {
  //   size: 0,
  //   splitNum: 0,
  // };
  // for (const obj of result) {
  //   // console.log(obj)
  //    if (obj.size > best.size) {
  //   // if (obj.isSmudge && obj.size > best.size) {
  //   // if (obj.isSmudge) {
  //     best = obj
  //   }
  // }
  // for (const test of result) {
  //   // @ts-ignore
  //   let temp = 0
  //   const length = test.horizontal ? lines.length : lines[0].length;
  //   if (test.splitNum - (test.size / 2) === 0 || test.splitNum + (test.size / 2) === length) {
  //     // if (test.isSmudge) {
  //     temp = Math.abs(length / 2 - test.splitNum)
  //     // console.log('OUT OF ALL OPTIONS THIS ONE IS CLOSEST TO THE EDGE')
  //     // console.log(test)
  //     best = test
  //   }
  // }
  return best || {
    size: 0,
    splitNum: 0
  }
}

// const fileContent = await Bun.file('example.txt').text()
const fileContent = await Bun.file('inputs.txt').text()
const tables = fileContent.split(/\n\n/)

let total = 0;
let iterCounter = 0;
for (const table of tables) {
  iterCounter++
  const lines = table.split(/\n/).filter(line => line)

  // for (const line of lines) {
  //   console.log(line)
  // }

  let result;
  let counter = 0;
  const allResults: any[] = [];
  for (let i = 1; i < lines[0].length; i++) {
    const foundSplit = scanLine(lines, i)
    if (foundSplit.size && foundSplit.splitNum) {
      allResults.push(foundSplit)
      counter++
    }
    
    if (!result?.size || foundSplit.size > result.size) {
      result = foundSplit
    }
  }

  const rotatedArray = rotateArray(lines).toReversed();
  for (let i = 1; i < rotatedArray[0].length; i++) {
    const foundSplit = scanLine(rotatedArray, i)
    if (foundSplit.size && foundSplit.splitNum) {
      // @ts-ignore
      foundSplit.horizontal = true;

      foundSplit.splitNum = rotatedArray[0].length - foundSplit.splitNum
      allResults.push(foundSplit)
      counter++
    }
    if (!result?.size || foundSplit.size > result.size) {
      result = foundSplit
      // @ts-ignore
      result.horizontal = true;
      result.splitNum = rotatedArray[0].length - result.splitNum
    }
  }
  // @ts-ignore
  if (counter > 1) {
    console.log('AUTO MAGIC', counter)
    console.log(allResults)
    // console.log('FOUND MULTIPLE')
    // console.log('MAP NUMBER: ', iterCounter)
    // console.log(allResults)

    let temp = 0;
    allResults.forEach(test => {
      const length = test.horizontal ? lines.length : lines[0].length;
      if (test.splitNum - (test.size / 2) === 0 || test.splitNum + (test.size / 2) === length) {
      // if (test.isSmudge && test.splitNum - (test.size / 2) === 0 || test.splitNum + (test.size / 2) === length) {
      // if (test.isSmudge) {
        temp = Math.abs(length / 2 - test.splitNum)
        // console.log('OUT OF ALL OPTIONS THIS ONE IS CLOSEST TO THE EDGE')
        // console.log(test)
        result = test
      }
    })
  }

  // @ts-ignore
  total += (result.horizontal ? 100 : 1) * result?.splitNum
  console.log(total)
}
console.log('answer', total)
// console.log(total === 29130)

// ANSWER PART 1: 29130
// ANSWER PART 2: 33438

// WRONG ANSWERS PART 2: 
// 39185
// 32795
// 38789

