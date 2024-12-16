type Position = { row: number, col: number }
type Directions = '^' | '>' | 'v' | '<'

const directions: { [key in Directions]: Position } = {
  '^': { row: -1, col:  0 },
  '>': { row:  0, col:  1 },
  'v': { row:  1, col:  0 },
  '<': { row:  0, col: -1 },
}

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function charAtPos(map: string[][], pos: Position) {
  return map?.[pos.row]?.[pos.col];
}

function setCharAtPos(map: string[][], pos: Position, char: string) {
  map[pos.row][pos.col] = char;
}

function findRobot(map: string[][]) {
  const row = map.findIndex(row => row.includes('@'));
  const col = map[row].findIndex(cell => cell === '@');
  return { row, col };
}

function countBoxes(map: string[][], pos: Position, dir: Position, count = 0) {
  const nextPos = translatePos(pos, dir);
  const nextChar = charAtPos(map, nextPos);
  if (nextChar === 'O') {
    return countBoxes(map, nextPos, dir, count + 1);
  }
  if (nextChar === '#') return;
  return count;
}

function pushBox(map: string[][], pos: Position, dir: Position, maxCount: number) {
  const lastPos = translatePos(pos, {
    row: dir.row * maxCount,
    col: dir.col * maxCount,
  });
  setCharAtPos(map, lastPos, 'O');
  setCharAtPos(map, pos, '.');
}

function move(map: string[][], instructions: string[], pos: Position) {
  // Print board status
  // prettyPrint(map, instructions.length)

  const char = instructions.shift() as Directions;
  if (!char) return map;
  const dir = directions[char];
  const nextPos = translatePos(pos, dir);
  const nextChar = charAtPos(map, nextPos);
  if (nextChar === '#') return move(map, instructions, pos);
  if (nextChar === 'O') {
    const boxCount = countBoxes(map, pos, dir);
    if (!boxCount) return move(map, instructions, pos);

    // for each box, move one block in dir
    pushBox(map, nextPos, dir, boxCount);
  }
  if (nextChar === '[' || nextChar === ']') {
    // found part of a box
    const set = new Set<string>([
      getPosStr(nextPos),
      getPosStr({
        row: nextPos.row,
        col: nextPos.col + (nextChar === ']' ? -1 : 1)
      })
    ]);
    const strPosToMove = pushBoxPart2(map, set, dir);
    if (!strPosToMove) return move(map, instructions, pos);

    // box movement is valid, convert set back to positions and translate
    strPosToMove.map(posFromStr).toReversed().forEach(pos => {
      const char = charAtPos(map, pos)
      const nextPos = translatePos(pos, dir)
      setCharAtPos(map, pos, '.')
      setCharAtPos(map, nextPos, char)
    });
  }
  setCharAtPos(map, pos, '.');
  setCharAtPos(map, nextPos, '@');
  return move(map, instructions, nextPos);
}

function sumGpsCoors(map: string[][]) {
  return map.reduce((total, row, i) => {
    const cols = row.reduce((cols, cell, j) => {
      return cell === 'O' || cell === '[' ? cols.concat(j) : cols;
    }, [] as number[]);
    if (!cols.length) return total;
    return total + cols.reduce((miniTotal, colIndex) => {
      return miniTotal + (100 * i) + colIndex
    }, 0);
  }, 0);
}

function expandMap(map: string[][]) {
  const expansions: { [key: string]: string[] } = {
    '#': [ '#', '#' ],
    'O': [ '[', ']' ],
    '.': [ '.', '.' ],
    '@': [ '@', '.' ],
  }

  const copy: string[][] = [];
  map.forEach((row, i) => {
    if (!copy[i]) copy[i] = [];
    row.forEach(cell => copy[i] = copy[i].concat(expansions[cell]));
  })
  return copy;
}

function getPosStr(pos: Position) {
  return `${pos.row},${pos.col}`;
}

function posFromStr(str: string) {
  const [ row, col ] = str.split(',').map(Number);
  return { row, col }
}

function pushBoxPart2(map: string[][], posSet: Set<string>, dir: Position): string[] | undefined {
  // check every position in positions to see if it hits a wall after applying dir
  // if even one does hit a wall, return undefined
  // if we find more boxes, add them to positions, and continue

  const newSet = new Set<string>();
  const valid = [ ...posSet ].map(posFromStr).every(pos => {
    const nextPos = translatePos(pos, dir);
    const strNextPos = getPosStr(nextPos);
    if (posSet.has(strNextPos)) return true; // already checked it, no need
    const nextChar = charAtPos(map, nextPos);
    if (nextChar === '#') return; // break loop, return false, boxes cant be moved

    if (nextChar === '.') return true;
    newSet.add(getPosStr(nextPos));
    newSet.add(getPosStr({
      row: nextPos.row,
      col: nextPos.col + (nextChar === ']' ? -1 : 1)
    }));
    return true;
  })
  if (valid) {
    // if there are no items in newSet, then next position for each box is '.' chars
    if (!newSet.size) return [ ...posSet ];
    // if valid, and newSet has items, we must check this next set of boxes for collisions
    const test = pushBoxPart2(map, newSet, dir);
    if (test) {
      return [ ...posSet ].concat(test);
    }
  }
}

function prettyPrint(map: string[][], instructionLength?: number) {
  console.clear()
  map.forEach(row => console.log(row.join('')));
  if (instructionLength) {
    console.log(`${initialInstructionLength - instructionLength}/${initialInstructionLength}`)
  }
  const start = new Date().getTime();
  while (new Date().getTime() - start < 15) {}
}

const [ mapData, instructionData ] = (await Bun.file(process.argv[2]).text())
  .split(/\n\n/);
  
const map = mapData.split(/\n/).map(line => line.split(''));
const instructions = instructionData.split('').filter(char => char !== '\n');

const mapPart2 = expandMap(map);
const instructionsPart2 = JSON.parse(JSON.stringify(instructions));

const initialInstructionLength = instructions.length

move(map, instructions, findRobot(map));
const answerPart1 = sumGpsCoors(map);

move(mapPart2, instructionsPart2, findRobot(mapPart2));
const answerPart2 = sumGpsCoors(mapPart2);

console.log(answerPart1, [ 2028, 10092, 1485257 ].includes(answerPart1));
console.log(answerPart2, [ 9021, 1475512 ].includes(answerPart2));

// ANSWER PART 1: 1485257
// ANSWER PART 2: 1475512
