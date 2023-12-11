// Char directions
// - => east/west
// | => north/south
// L => north/east
// J => north/west
// 7 => south/west
// F => south/east
// . => NOTHING
// S => startPos

// [lineNumber, columnNumber]
let startPos;

const { up, down, left, right } = {
  up: [-1, 0],
  down: [1, 0], 
  right: [0, 1], 
  left: [0, -1],
}

const chars: { [key: string]: number[][] } = {
  '|': [up, down],
  '-': [left, right],
  'L': [up, right],
  'J': [up, left],
  '7': [down, left],
  'F': [down, right],
  'S': [up, down, left, right],
  '.': []
}

function nextCharIsConnected(currChar: string, dir: number[], nextChar: string) {
  // YOU NEED START CHAR, END CHAR, AND DIRECTION
  // if startChar + direction can be endChar
  // AND endChar - direction can be startChar
  // Return true
  // ELSE return false
  // OR JUST CHEAT
  // console.log('is next char connected?')
  // console.log(currChar, dir, nextChar)
  const reverse = JSON.stringify(dir.map(num => num * -1))
  const nextDirs = chars[nextChar].map(dir => JSON.stringify(dir))
  for (let i = 0; i < nextDirs.length; i++) {
    if (nextDirs[i] === reverse) {
      return true
    }
  }
  return false
}

function getChar(map: string[][], pos: number[], dir?: number[]) {
  const row = pos[0] + (dir ? dir[0] : 0)
  const col = pos[1] + (dir ? dir[1] : 0)
  return map[row][col]
}

const pathCoordinates: number[][] = [];
function traceRouteV2(map: string[][], pos: number[], prevPos: number[] | null): number {
  const dirs = chars[map[pos[0]][pos[1]]];
  const char = getChar(map, pos)
  pathCoordinates.push(pos)
  // dirs.some(dir => {
  //   const currentPos = [pos[0] + dir[0], pos[1] + dir[1]]
  //   if (prevPos && currentPos[0] === prevPos[0] && currentPos[1] === prevPos[1]) {
  //     // console.log('FOUND OLD POSITION EARLIER THAN USUAL')
  //     return false
  //   }
  //   // console.log(getChar(map, pos, dir))
  //   const checkChar = getChar(map, pos, dir)
  //   console.log(nextCharIsConnected(char, dir, checkChar))
  //   return false
  // })
  let nextPos;
  for (const dir of dirs) {
    const currentPos = [pos[0] + dir[0], pos[1] + dir[1]]
    if (prevPos && currentPos[0] === prevPos[0] && currentPos[1] === prevPos[1]) {
      continue;
    }
    if (nextCharIsConnected(char, dir, getChar(map, currentPos))) {
      nextPos = currentPos;
      break;
    }
  }
  if (!nextPos) throw Error('FAILED TO FIND NEXT STEP')
  return getChar(map, nextPos) === 'S' ? 1 :
    1 + traceRouteV2(map, nextPos, pos)
  // return 0
}

function prettyPrint(map: string[]) {
  map.forEach(line => console.log(line))
}

// const data = (await Bun.file('example.txt').text())
// const data = (await Bun.file('example2.txt').text())
const data = (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
.map(line => line.split(''))
// prettyPrint(data)
// console.log(data)
data.some((line, i) => line.includes('S') ?
  startPos = [i, line.indexOf('S')] : false
)

console.log(data)
let test = 0;
for (const line of data) {
  for (const char of line) {
    if (char === '.') {
      test++
    }
  }
}
console.log(test)

if (!startPos) throw Error('CANT FIND STARTING POSITION')
// console.log(traceRoute(data, startPos, null))
console.log(traceRouteV2(data, startPos, null))

const totalSteps = traceRouteV2(data, startPos, null);
console.log('Total Steps: ', totalSteps)
console.log('Furthest Point = ', totalSteps/2)

let dotCounter = 0;
data.forEach(line => {
  // console.log(line)
  line.forEach(char => {
    if (char === '.') {
      // console.log('FOUND A DOT')
      dotCounter++
    }
  })
})
console.log(dotCounter)

console.log(pathCoordinates[0], pathCoordinates[pathCoordinates.length - 1])
pathCoordinates.forEach(coordinates => {
  data[coordinates[0]][coordinates[1]] = '#'
});
// console.log(data)

// Bun.write('fixedOutput.txt', data.map(line => line.join('') + '\n'))

let matchCount = 0;
let area = 0;
// [ ...data.map(line => line.join('')).join('').matchAll(/#[\.FJL7|-]+#/g)].map(match => {
//   console.log(match)
//   const length = match[0].length - 2
//   area += length
//   matchCount++
//   // console.log(match)
// })
data.forEach(line => {
  // console.log(line.join(''))
    console.log('########')
  const string = line.join('');
  [...string.matchAll(/#[\.FJL7|-]+#/g)].map(match => {
    console.log(match)
    // area += match
    matchCount++
    area += match[0].length - 2
  })
})
console.log('ANSWER')
console.log(matchCount)
console.log('AREA', area)

// console.log(startPos)
// TOTAL EXCEPT CENTER = 35
// OUTSIDE = 3 ACTUALLY 4
// CENTER = 37 OR 39
// PROBABLY 38
//
// CHECKED
// 71
// 70
// 69
// 68
// 67
//
// ACTUAL 595
// How tf do u get that number? Use the cheaters solution
