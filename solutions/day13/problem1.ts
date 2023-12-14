// seperate tables
// get col and row counts
// check for reflections

function rotateArray(lines: string[]) {
  const result = [...Array(lines[0].length).keys()].map(i => {
    return lines.map(line => line[i]).join('')
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
    if (left === right.split('').reverse().join('')) {
      return true
    }
    return false
  })
  // console.log(res);
  return res
}

function getOrderedIndices(length: number, mid: number) {
  const result: number[] = []
  for (let i = 0; i < length; i++) {
    result.push(mid + (i * i % 2 ? -1 : 1))
  }
  return result;
}

function gcfOld(lines: string[]) {
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

function getReflectionCount(lines: string[]) {
  // const rowMax = lines.length;
  // const colMax = lines[0].length;
  // console.log(rowMax, colMax)

  // let split = 1;
  // let checkLength = 1;
  const lineLength = lines[0].length;
  const maxLength = Math.floor(lines[0].length / 2)
  const line = lines[0]

  // NEW
  const left = line.slice(0, maxLength)
  const right = line.slice(maxLength, maxLength * 2)
  // console.log('FIRST SLICE', left, right)
  if ((left === right.split('').reverse().join(''))) {
    // console.log('CHECKING ALL LINES')
    if (validOnAllLines(lines, maxLength)) {
      // console.log("THATS A FULL FUCKING MATCH")
      return maxLength
    }
  }

  if (lines[0].length % 2 !== 0) {
    const left = line.slice(1, maxLength + 1)
    const right = line.slice(maxLength + 1, (maxLength * 2) + 1)
    // console.log('SECOND SLICE', left, right)
    if ((left === right.split('').reverse().join(''))) {
      // console.log('CHECKING ALL LINES')
      if (validOnAllLines(lines, maxLength, true)) {
        // console.log("THATS A FULL FUCKING MATCH FROM SECOND SLICE")
        return maxLength + 1
      }
    }
  }
  return 0

  // console.log('max length', maxLength)
  // console.log('DONE')
}
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

// const fileContent = await Bun.file('example.txt').text()
const fileContent = await Bun.file('inputs.txt').text()
// console.log(fileContent)
// console.log('is new line?')
// console.log(fileContent[fileContent.length - 1])
const tables = fileContent.slice(0, fileContent.length - 1).split(/\n\n/)
// console.log(tables)

let total = 0;
for (const table of tables) {
  // console.log(table)
  // console.log('~~~~~~~~')
  // console.log(lines)
  console.log('~~~~~~~~~~~~~~~~')
  console.log('total', total)
  const lines = table.split(/\n/)
  // console.log(lines)
  console.log('ORIGINAL ARRAY')
  for (const line of lines) {
    console.log(line)
  }
  // const result = getReflectionCount(lines)
  const result = gcfOld(lines)
  console.log(result)
  // if (result) {
  //   console.log('FOUND RESULT BEFORE ROTATING')
  //   // total += result;
  //   // continue;
  // }
  // break;

  // const resV2 = getReflectionCount(rotateArray(lines))
  const resV2 = gcfOld(rotateArray(lines))
  console.log("DISPLAY ROTATED ARRAY")
  rotateArray(lines).forEach(line => console.log(line))
  console.log(resV2)
  // if (resV2) {
  //   console.log('FOUND RESULT AFTER ROTATING')
  //   // console.log(resV2 * 100)
  //   // total += resV2 * 100;
  // }
  // total += result.largestSize > resV2.largestSize ? result.total : (resV2.total)*100
  total += result.largestSize > resV2.largestSize ? result.largestSize : (resV2.largestSize)*100
  // total += result > resV2 ? result : (resV2)*100

  // For each table get row count and col count
  // Use this information to scan until we confirm its not a reflection
}
console.log('answer', total)

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

