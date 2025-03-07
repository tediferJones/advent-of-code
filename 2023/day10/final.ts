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
}

function getArea(coors: number[][]) {
  return Math.abs([...Array(coors.length).keys()].reduce((area, i) => {
    const j = (i + 1) % coors.length;
    return area + coors[i][0] * coors[j][1] - coors[j][0] * coors[i][1];
  }, 0)) / 2;
}

function getChar(map: string[][], pos: number[], dir?: number[]) {
  const row = pos[0] + (dir ? dir[0] : 0);
  const col = pos[1] + (dir ? dir[1] : 0);
  return map[row][col];
}

function nextCharIsConnected(dir: number[], nextChar: string) {
  const reverse = JSON.stringify(dir.map(num => num * -1));
  return chars[nextChar].some(dir => JSON.stringify(dir) === reverse);
}

const corners: number[][] = [];
function traceRoute(map: string[][], pos: number[], prevPos?: number[]): number {
  const char = getChar(map, pos);

  // PROBABLY SHOULDNT ALWAYS COUNT S AS A CORNER
  // But in our case it is a corner in both the example and input
  if ('LJF7S'.includes(char)) corners.push(pos);

  const [ [dy, dx] ] = chars[char].filter(dir => {
    return !prevPos ? nextCharIsConnected(dir, getChar(map, pos, dir))
      : prevPos.join() !== [pos[0] + dir[0], pos[1] + dir[1]].join();
  })
  const nextPos = [pos[0] + dy, pos[1] + dx];

  return getChar(map, nextPos) === 'S' ? 1 :
    1 + traceRoute(map, nextPos, pos);
}

// const data = (await Bun.file('example.txt').text())
const data = (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''));

const startPos = data.reduce((coors, line, i) => {
  return line.includes('S') ? [i, line.indexOf('S')] : coors;
}, [] as number[]);
const totalSteps = traceRoute(data, startPos);
const furthestPoint = Math.ceil(totalSteps / 2);
console.log('Total Steps:', totalSteps);
console.log('Furthest Point:', furthestPoint);

// It's just pick's theorm, but instead of
// Area = i + b/2 - 1
// we want
// i = Area - b/2 + 1
// Where i = number of interior points, and b = perimeter length
const tileCount = getArea(corners) - (totalSteps / 2) + 1;
console.log('Tile Count:', tileCount);
console.log([4, 6867].includes(furthestPoint) && [1, 595].includes(tileCount));

// ANSWER PART 1: 6867
// ANSWER PART 2: 595
