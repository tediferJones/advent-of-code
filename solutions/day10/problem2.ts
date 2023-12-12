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

function isInside(map: string[][], coordinate: number[]) {
  // start by just checking 4 directions
  // if there is # any distance away in all 4 directions, return true
  const [row, col] = coordinate;
  const exists: { [key: string]: Function } = {
    up: (map: string[][], coordinate: number[]) => {
      // Check every row above (less than) specified index
      if (row - 1 < 0) return false
      return [...Array(row - 1).keys()]
        .some(i => map[i][col] === '#')
    },
    down: (map: string[][], coordinate: number[]) => {
      return [...Array(map.length - row - 1).keys()]
        .map(i => i + row)
        .some(i => map[i][col] === '#')
    },
    left: (map: string[][], coordinate: number[]) => {
      if (col - 1 < 0) return false
      return [...Array(col - 1).keys()]
        .reverse() // so it actually checks in the right order
        .some(i => map[row][i] === '#')
    },
    right: (map: string[][], coordinate: number[]) => {
      return [...Array(map[0].length - col - 1).keys()]
        .some(i => map[i][col] === '#')
    },
    // CHECK FOR DIAGANOLS TOO
  }

  for (const key in exists) {
    if (!exists[key](map, coordinate)) {
      return false
    }
  }

  return true
}

let matchCount = 0;
let area = 0;
// data.forEach((line, i) => {
//   // console.log(line.join(''))
//     console.log('########')
//   if (i < 15 || i > 130) return
//   const string = line.join('');
//   [...string.matchAll(/#[^#]+#/g)].map(match => {
//     console.log(match, i)
//     // area += match
//     matchCount++
//     area += match[0].length - 2
//   })
// })

// for (const line,i  of data) {
//   for (const char of line) {
//     if (char !== '#' && isInside()) {
//       console.log('ITS INSIDE THE PIPES')
//     }
//   }
// }
let counter = 0;
// let totalChars = 0;
const pairs: number[][] = []
data.forEach((line, y) => {
  line.forEach((char, x) => {
    if (char !== '#' && isInside(data, [y, x])) {
      counter++
      pairs.push([y, x])
    }
    // totalChars++
  })
})
console.log(pairs)
// console.log('Total Chars: ', totalChars)
// YOU COULD USE THIS DATA TO WRITE A NEW FILE
// WITH ALL THESE POSITIONS CHANGED TO *
// Then we can see what is catching and what it isnt
// pairs.forEach(pair => {
//   data[pair[0]][pair[1]] = ' '
// })
// Bun.write('fixedOutputV2.txt', data.map(line => line.join('') + '\n'));

console.log('TESTING: ', counter)

// console.log('ANSWER')
// console.log(matchCount)
// console.log('AREA', area)
// console.log(data)

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
