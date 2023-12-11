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
  return chars[nextChar]
    .map(dir => JSON.stringify(dir))
    .some(dirStr => dirStr === reverse)
}

function getChar(map: string[], pos: number[], dir?: number[]) {
  const row = pos[0] + (dir ? dir[0] : 0)
  const col = pos[1] + (dir ? dir[1] : 0)
  return map[row][col]
}

function isPrevPos(currPos: number[], dir: number[], prevPos: number[] | null) {
  return prevPos &&
    currPos[0] + dir[0] === prevPos[0] &&
    currPos[1] + dir[1] === prevPos[1]
}

function traceRouteV2(map: string[], pos: number[], prevPos: number[] | null): number {
  let nextPos: number[] = [];
  chars[map[pos[0]][pos[1]]].some(dir => {
    const currentPos = [pos[0] + dir[0], pos[1] + dir[1]]
    return !isPrevPos(pos, dir, prevPos) && 
      nextCharIsConnected(getChar(map, pos), dir, getChar(map, currentPos)) ?
        nextPos = currentPos || true : false;
  })
  return !nextPos || getChar(map, nextPos) === 'S' ? 1 :
    1 + traceRouteV2(map, nextPos, pos)
}

// [lineNumber, columnNumber]
let startPos;

// const data = (await Bun.file('example.txt').text())
// const data = (await Bun.file('example2.txt').text())
const data = (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
data.some((line, i) => line.includes('S') ?
  startPos = [i, line.indexOf('S')] : false
)

if (!startPos) throw Error('CANT FIND STARTING POSITION')
const totalSteps = traceRouteV2(data, startPos, null);
console.log('Total Steps: ', totalSteps)
console.log('Furthest Point = ', totalSteps/2)
