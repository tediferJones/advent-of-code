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
  return map?.[pos.row]?.[pos.col]
}

function setCharAtPos(map: string[][], pos: Position, char: string) {
  map[pos.row][pos.col] = char
}

function findRobot(map: string[][]) {
  const row = map.findIndex(row => row.includes('@'))
  const col = map[row].findIndex(cell => cell === '@')
  return { row, col }
}

function countBoxes(map: string[][], pos: Position, dir: Position, count = 0) {
  const nextPos = translatePos(pos, dir)
  const nextChar = charAtPos(map, nextPos)
  if (nextChar === 'O') {
    return countBoxes(map, nextPos, dir, count + 1)
  }
  if (nextChar === '#') return
  return count
}

function pushBox(map: string[][], pos: Position, dir: Position, maxCount: number) {
  const lastPos = Array(maxCount).fill(0).reduce((finalPos) => {
    return translatePos(finalPos, dir)
  }, pos)
  setCharAtPos(map, lastPos, 'O')
  setCharAtPos(map, pos, '.')
}

// let iterCount = 0
function move(map: string[][], instructions: string[], pos: Position) {
  // if (iterCount > 5) return 'idk'
  // console.log(iterCount, instructions[0])
  // prettyPrint(map)
  // iterCount++

  const char = instructions.shift() as Directions;
  if (!char) return map
  const dir = directions[char]
  const nextPos = translatePos(pos, dir)
  const nextChar = charAtPos(map, nextPos)
  if (nextChar === '#') {
    return move(map, instructions, pos)
  }
  if (nextChar === 'O') {
    const boxCount = countBoxes(map, pos, dir)
    if (!boxCount) {
      // boxes cannot be moved, do nothing
      return move(map, instructions, pos)
    }

    // for each box, move one block in dir
    pushBox(map, nextPos, dir, boxCount)
  }
  setCharAtPos(map, pos, '.')
  setCharAtPos(map, nextPos, '@')
  return move(map, instructions, nextPos)
}

function sumGpsCoors(map: string[][]) {
  return map.reduce((total, row, i) => {
    const cols = row.reduce((cols, cell, j) => {
      return cell === 'O' ? cols.concat(j) : cols
    }, [] as number[])
    if (!cols.length) return total
    return total + cols.reduce((miniTotal, colIndex) => {
      return miniTotal + (100 * i) + colIndex
    }, 0)
  }, 0)
}

function prettyPrint(map: string[][]) {
  map.forEach(row => console.log(row.join('')))
}

const [ mapData, instructionData ] = (await Bun.file(process.argv[2]).text())
  .split(/\n\n/)
  
const map = mapData.split(/\n/).map(line => line.split(''))

const instructions = instructionData.split('').filter(char => char !== '\n')

move(map, instructions, findRobot(map))
const answerPart1 = sumGpsCoors(map)
console.log(answerPart1, [ 2028, 10092, 1485257 ].includes(answerPart1))

// ANSWER PART 1: 1485257
