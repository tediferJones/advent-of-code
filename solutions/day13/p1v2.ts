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
  // length = next ? length + 1 : length;
  // const start = next ? 1 : 0;
  const res = lines.every(line => {
    // const left = line.slice(start, length)
    // const right = line.slice(length, length * 2)
    const left = line.slice(start, mid)
    const right = line.slice(mid, end)
    // console.log('CHECK LINE', left, right)
    // if (left === right.split('').reverse().join('')) {
    // if (start === 4 && mid === 5 && end === 6) {
    //   console.log(left, right, start, mid, end)
    //   // console.log(right.split('').toReversed().join(''))
    // }
    // console.log(left, right, start, mid, end)
    if (left === right.split('').toReversed().join('')) {
      return true
    }
    return false
  })
  // if (res) console.log("SUCCESS")
  // console.log(res);
  return res
}

function getOrderedIndices(length: number) {
  const mid = Math.floor(length / 2) + (length % 2 === 0 ? 0 : 1)
  const result: number[] = [mid]
  // let amount = 1;
  for (let i = 1; i < length; i++) {
    const direction = (i % 2 ? -1 : 1);
    const change = Math.floor(i / 2) * direction
    console.log(i, length, change)
    result.push(mid + (change))
  }
  return result;
}
// console.log(getOrderedIndices(5))

function gcfOldV2(lines: string[]) {
  const lineLength = lines[0].length;
  const maxLength = Math.floor(lines[0].length / 2)
  const line = lines[0]
  let total = 0;
  let largestSize = 0;
  const orderedIndices: number[] = getOrderedIndices(lineLength, maxLength);
  // COL = SPLIT LOCATION
  // for (let col = 1; col < lines[0].length; col++) {
  for (const col of orderedIndices) {
    // console.log('checking col', col)
    let maxSize = maxLength
    if (col < maxLength) {
      maxSize = col
    }
    if (lineLength - col < maxLength) {
      maxSize = lineLength - col
    }
    // for (let size = 1; size <= maxSize; size++) {
    for (let size = maxSize; size > 0; size--) {
      const left = line.slice(col - size, col)
      const right = line.slice(col, col + size)
      if (!(left === right.split('').reverse().join(''))) {
        break;
      }
      // if (size === maxLength) {
        // Now scan the whole table and make sure every row is a reflection
        if (validOnAllLines(lines, col - size, col, col + size)) {
          total += lineLength - size
          if (size > largestSize) {
            largestSize = size
          }  
          // return largestSize
          break;
        }
      // }
    }
    // console.log('################')
  }
  // return 0
  // return total
  return {
    total,
    largestSize
  }
}

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
      // console.log('MATCHES')
      if (validOnAllLines(lines, start, splitNum, end)) {
        // console.log(result)
        result.push({
          splitNum,
          size,
        })
      }
    }
    // console.log(left, right)
  }
  // return test
  // console.log('GET BEST ONE')
  // console.log(result)
  let best = {
    size: 0,
    splitNum: 0,
  };
  for (const obj of result) {
    // console.log(obj)
    if (obj.size > best.size) {
      best = obj
    }
  }
  return best
}

// function gcf(lines: string[]) {
//   for (let i = 1; i < lines.length; i++) {
//     scanLine(lines, i)
//     console.log('~~~~~~~~')
//   }
// }
// console.log(gcf(['12345678']));


// function gcfOld(lines: string[]) {
//   const lineLength = lines[0].length;
//   const maxLength = Math.floor(lines[0].length / 2)
//   const line = lines[0]
//   let total = 0;
//   let largestSize = 0;
//   const orderedIndices: number[] = getOrderedIndices(lineLength, maxLength);
//   // COL = SPLIT LOCATION
//   // for (let col = 1; col < lines[0].length; col++) {
//   for (const col of orderedIndices) {
//     // console.log('checking col', col)
//     let maxSize = maxLength
//     if (col < maxLength) {
//       maxSize = col
//     }
//     if (lineLength - col < maxLength) {
//       maxSize = lineLength - col
//     }
//     // for (let size = 1; size <= maxSize; size++) {
//     for (let size = maxSize; size > 0; size--) {
//       const left = line.slice(col - size, col)
//       const right = line.slice(col, col + size)
//       if (!(left === right.split('').reverse().join(''))) {
//         break;
//       }
//       // if (size === maxLength) {
//         // Now scan the whole table and make sure every row is a reflection
//         if (validOnAllLines(lines, col - size, col, col + size)) {
//           total += lineLength - size
//           if (size > largestSize) {
//             largestSize = size
//           }  
//           // return largestSize
//           break;
//         }
//       // }
//     }
//     // console.log('################')
//   }
//   // return 0
//   // return total
//   return {
//     total,
//     largestSize
//   }
// }

// function getReflectionCount(lines: string[]) {
//   // const rowMax = lines.length;
//   // const colMax = lines[0].length;
//   // console.log(rowMax, colMax)
// 
//   // let split = 1;
//   // let checkLength = 1;
//   const lineLength = lines[0].length;
//   const maxLength = Math.floor(lines[0].length / 2)
//   const line = lines[0]
// 
//   // NEW
//   const left = line.slice(0, maxLength)
//   const right = line.slice(maxLength, maxLength * 2)
//   // console.log('FIRST SLICE', left, right)
//   if ((left === right.split('').reverse().join(''))) {
//     // console.log('CHECKING ALL LINES')
//     if (validOnAllLines(lines, maxLength)) {
//       // console.log("THATS A FULL FUCKING MATCH")
//       return maxLength
//     }
//   }
// 
//   if (lines[0].length % 2 !== 0) {
//     const left = line.slice(1, maxLength + 1)
//     const right = line.slice(maxLength + 1, (maxLength * 2) + 1)
//     // console.log('SECOND SLICE', left, right)
//     if ((left === right.split('').reverse().join(''))) {
//       // console.log('CHECKING ALL LINES')
//       if (validOnAllLines(lines, maxLength, true)) {
//         // console.log("THATS A FULL FUCKING MATCH FROM SECOND SLICE")
//         return maxLength + 1
//       }
//     }
//   }
//   return 0
// 
//   // console.log('max length', maxLength)
//   // console.log('DONE')
// }
console.log('TESTING')
// getReflectionCount(['123456'])
// getReflectionCount(['#.##..##.'])

// CHANGED
// getReflectionCount(['.##..##.'])
// getReflectionCount([
//   '#.##..##.',
//   '..#.##.#.',
//   '##......#',
//   '##......#',
//   '..#.##.#.',
//   '..##..##.',
//   '#.#.##.#.',
// ]);

// WRONG SIZE, SHOULD BE 12
// ##.#.#.##.#..
// ...##....####
// .##..##.#####
// #.##.##...###
// #....##..##.#
// ..##..#.##..#
// ..##..#.##..#
// #....##..##.#
// #.##.##...###
// .##..##.#####
// ...##....####
// ##.#...##.#..
// ##.#...##.#..

// const fileContent = await Bun.file('example.txt').text()
const fileContent = await Bun.file('inputs.txt').text()
// console.log(fileContent)
// console.log('is new line?')
// console.log(fileContent[fileContent.length - 1])
// const tables = fileContent.slice(0, fileContent.length - 1).split(/\n\n/)
const tables = fileContent.split(/\n\n/)
// console.log(tables)
// console.log(tables)

let total = 0;
let iterCounter = 0;
for (const table of tables) {
  iterCounter++
  // console.log(table)
  // console.log('~~~~~~~~')
  // console.log(lines)
  // console.log('~~~~~~~~~~~~~~~~')
  // console.log('total', total)
  const lines = table.split(/\n/).filter(line => line)
  // console.log(lines)
//   console.log('ORIGINAL ARRAY')

  for (const line of lines) {
    console.log(line)
  }

  // if (total === 1212) {
  //   console.log("FIXER 9000")
  //   total += 1400
  //   console.log(total)
  //   continue
  // }

  // const result = getReflectionCount(lines)
  // const result = gcfOld(lines)
  // const result = gcf(lines)
  let result;
  // const line = lines[0];
  // let maxLength = line.length % 2 === 0 ? line.length : line.length - 1;
  // const orderedIndices: number[] = getOrderedIndices(line.length, maxLength / 2);
  // console.log(orderedIndices)

  let counter = 0;
  const allResults: any[] = [];
  // TESTING
  for (let i = 1; i < lines[0].length; i++) {
    // console.log('CHECKING SPLIT ', i)
    const foundSplit = scanLine(lines, i)
    // console.log(foundSplit)
    if (foundSplit.size && foundSplit.splitNum) {
      allResults.push(foundSplit)
      counter++
    }
    
    if (!result?.size || foundSplit.size > result.size) {
      result = foundSplit
    }
    // result = scanLine(lines, i)
    // console.log('RESULT')
    // console.log(result)
  }

  const rotatedArray = rotateArray(lines).toReversed();
  for (let i = 1; i < rotatedArray[0].length; i++) {
    // console.log('CHECKING SPLIT ', i)
    const foundSplit = scanLine(rotatedArray, i)
    // console.log(foundSplit)
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
    // result = scanLine(lines, i)
    // console.log('RESULT')
    // console.log(result)
  }
  // @ts-ignore
  if (result.splitNum === 0 || result.size === 0) {
    console.log("KAFUCKERED")
  }
  if (counter > 1) {
    console.log('FOUND MULTIPLE')
    console.log('MAP NUMBER: ', iterCounter)
    console.log(allResults)

    let temp = 0;
    allResults.forEach(test => {
      // const length = lines[0].length;
      const length = test.horizontal ? lines.length : lines[0].length;
      // if (Math.abs(length / 2 - test.splitNum) > temp) {
      if (test.splitNum - (test.size / 2) === 0 || test.splitNum + (test.size / 2) === length) {
        temp = Math.abs(length / 2 - test.splitNum)
        console.log('OUT OF ALL OPTIONS THIS ONE IS CLOSEST TO THE EDGE')
        console.log(test)
        result = test
      }
    })
  }
  // GET THE SPLIT NUMBER THAT IS CLOSEST TO EITHER END


  // console.log('REAL TEST')
  // console.log(result)
  // console.log(rotatedArray.length)
  // @ts-ignore
  total += (result.horizontal ? 100 : 1) * result?.splitNum
  console.log(total)

  // console.log(result)
  // if (result === 0) {
  //   console.log('FOUND RESULT BEFORE ROTATING')
  //   // total += result;
  //   // continue;
  // }
  // break;

  // const resV2 = getReflectionCount(rotateArray(lines))
  // const resV2 = gcfOld(rotateArray(lines))
  // console.log("DISPLAY ROTATED ARRAY")
  // rotateArray(lines).forEach(line => console.log(line))

  // console.log(resV2)
  // if (resV2) {
  //   console.log('FOUND RESULT AFTER ROTATING')
  //   // console.log(resV2 * 100)
  //   // total += resV2 * 100;
  // }
  // total += result.largestSize > resV2.largestSize ? result.total : (resV2.total)*100
  //
  // WORKING
  // total += result.largestSize > resV2.largestSize ? result.largestSize : (resV2.largestSize)*100
  //
  // total += result > resV2 ? result : (resV2)*100

  // For each table get row count and col count
  // Use this information to scan until we confirm its not a reflection
}
console.log('answer', total)
console.log(total === 29130)

// ANSWER PART 1: 29130

// console.log(rotateArray([
//   '123',
//   '456',
//   '789',
// ]))

// ALSO WRONG:
// 37421
// 54081
// 74766
// 4234
//
// TOO HIGH
// 173778
// 120208

// TOO LOW
// 927

