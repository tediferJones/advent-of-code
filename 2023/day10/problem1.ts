// Char directions
// - => east/west
// | => north/south
// L => north/east
// J => north/west
// 7 => south/west
// F => south/east
//
// . => NOTHING
// S => startPos

// const dirs = [
//   [1, 0], // Above
//   [-1, 0], // Below
//   [0, 1], // Right
//   [0, -1], // Left
// ]

// [lineNumber, columnNumber]
let startPos;

// const dirMap = new Map([
//   [[-1, 0], ['|', '7', 'F']], // Up 
//   [[1, 0], ['|', 'J', 'L']], // Down
//   [[0, 1], ['-', 'J', '7']], // Right
//   [[0, -1], ['-', 'L', 'F']], // Left
// ])
// console.log(dirMap)

// The character you are on dictates 
// what the next char can be, and WHERE it can be
//

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
  console.log('is next char connected?')
  console.log(currChar, dir, nextChar)
  const reverse = JSON.stringify(dir.map(num => num * -1))
  const nextDirs = chars[nextChar].map(dir => JSON.stringify(dir))
  for (let i = 0; i < nextDirs.length; i++) {
    if (nextDirs[i] === reverse) {
      return true
    }
  }
  return false
}

function getChar(map: string[], pos: number[], dir?: number[]) {
  const row = pos[0] + (dir ? dir[0] : 0)
  const col = pos[1] + (dir ? dir[1] : 0)
  return map[row][col]
}

function traceRouteV2(map: string[], pos: number[], prevPos: number[] | null): number {
  const dirs = chars[map[pos[0]][pos[1]]];
  const char = getChar(map, pos)
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

// Just trace the entire map and divide result by 2?
// Round up if necessary
function traceRoute(map: string[], pos: number[], prevPos: number[] | null): number {
  console.log('########')
  // console.log('CURRENT POSITION', pos)
  // console.log('PREVIOUS POSITION', prevPos)
  const dirs = chars[map[pos[0]][pos[1]]]
  // console.log('CHECKING POSSIBLE DIRECTIONS', dirs)
  // dirs.forEach(dir => {
  let nextValidDir;
  // console.log('POSSIBLE MOVES', dirs)
  dirs.some(dir => {
    const currentPos = [pos[0] + dir[0], pos[1] + dir[1]]
    if (prevPos && currentPos[0] === prevPos[0] && currentPos[1] === prevPos[1]) {
      // console.log('FOUND OLD POSITION EARLIER THAN USUAL')
      return false
    }

    // console.log('SOME SHIT')
    // console.log(map)
    // console.log(pos)
    // console.log(dir)
    if (currentPos[0] < 0 || currentPos[1] < 0) {
      // Skip of position doesnt exist
      // console.log('FUCKERY')
      return false
    }
    const nextChar = map[pos[0] + dir[0]][pos[1] + dir[1]];
    const nextDirs = chars[nextChar]
    // console.log('CURRENT DIR ', dir)
    // console.log('NEXT DIRS ', nextDirs)
    // console.log('CHECK POSSIBLE DIRECTIONS')
    const dirIsValid = !nextDirs.some(nextDir => {
      // console.log('CHECKING', nextDir, pos)
      // console.log('for new dir', dir)
      if (nextDir[0] + currentPos[0] === pos[0] && nextDir[1] + currentPos[1] === pos[1]) {
        // console.log('FOUND OLD POSITION BUT LATER')
        return false
      }
      // NEW CHAR NEEDS TO HAVE A DIRECTION THAT IS OPPOSITE TO THE CURRENT DIRECTION
      // return !nextDir
      //   .some((num, i) => num * -1 === dir[i])
      // return nextDir[0] * -1 === dir[0] && nextDir[1] * -1 === dir[1]
      // return currentPos[0] + nextDir[0] === dir[0] && currentPos[1] + nextDir[0] === dir[0]
      if (pos[0] + dir[0] + nextDir[0] < 0) return false
      if (pos[1] + dir[1] + nextDir[1] < 0) return false
      const checkingChar = map[pos[0] + dir[0] + nextDir[0]][pos[1] + dir[1] + nextDir[1]]
      return nextCharIsConnected(nextChar, dir, checkingChar)
    })

    // console.log(dirIsValid, dir)

    if (dirIsValid) {
      // console.log('DIR IS VALID')
      // console.log(dir)
      nextValidDir = dir
      // BREAK SOME LOOP
      return true
    }
  })
  // console.log(nextValidDir)
  if (!nextValidDir) throw Error('NO NEW DIRECTIONS FOUND')

  const nextValidChar = map[pos[0] + nextValidDir[0]][pos[1] + nextValidDir[1]]
  console.log('CURRENT POSITION IS', pos)
  console.log('CURRENT CHAR IS', map[pos[0]][pos[1]])
  console.log('NEXT CHAR IS', nextValidChar)
  // console.log('CHOSEN DIRECTION', nextValidDir)
  // console.log('NEXT CHAR IS', nextValidChar)

  if (nextValidChar !== 'S') {
    // return 1 + traceRoute(map, nextValidDir)
    return 1 + traceRoute(map, [pos[0] + nextValidDir[0], pos[1] + nextValidDir[1]], pos)
  } else {
    return 1;
  }
}

function prettyPrint(map: string[]) {
  map.forEach(line => console.log(line))
}

// const data = (await Bun.file('example.txt').text())
// const data = (await Bun.file('example2.txt').text())
const data = (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
prettyPrint(data)
// console.log(data)
data.some((line, i) => line.includes('S') ?
  startPos = [i, line.indexOf('S')] : false
)
if (!startPos) throw Error('CANT FIND STARTING POSITION')
// console.log(traceRoute(data, startPos, null))
console.log(traceRouteV2(data, startPos, null))

const totalSteps = traceRouteV2(data, startPos, null);
console.log('Total Steps: ', totalSteps)
console.log('Furthest Point = ', totalSteps/2)

// console.log(startPos)
