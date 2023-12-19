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
const corners: number[][] = [];
function traceRouteV2(map: string[][], pos: number[], prevPos: number[] | null): number {
  const dirs = chars[map[pos[0]][pos[1]]];
  const char = getChar(map, pos)
  // PROBABLY SHOULDNT ALWAYS COUNT S AS A CORNER
  // But in our case it is a corner in both the example and input
  if ('LJF7S'.includes(char)) corners.push(pos)
  pathCoordinates.push(pos)
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
}

// const data = (await Bun.file('example.txt').text())
// const data = (await Bun.file('example2.txt').text())
const data = (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''))

data.some((line, i) => line.includes('S') ?
  startPos = [i, line.indexOf('S')] : false
)

if (!startPos) throw Error('CANT FIND STARTING POSITION')
const totalSteps = traceRouteV2(data, startPos, null);

// data.forEach(line => console.log(line.join('')))
console.log('Total Steps: ', totalSteps)
console.log('Furthest Point = ', totalSteps/2)

function getArea(coors: number[][]) {
  const length = coors.length;
  let area = 0;

  for (let i = 0; i < length; i++) {
    const j = (i + 1) % length;
    area += coors[i][0] * coors[j][1]
    area -= coors[j][0] * coors[i][1]
  }

  area = Math.abs(area) / 2;
  return area
}

console.log('AREA: ', getArea(corners))
// It's just pick's theorm, but instead of
// Area = i + b/2 - 1
// we do
// i = Area - b/2 + 1
// Where i = number of interior points, and b = perimeter length
console.log(getArea(corners) - (totalSteps / 2) + 1)

// ANSWER PART 1: 6867
// ANSWER PART 2: 595
