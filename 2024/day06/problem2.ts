type Position = { row: number, col: number }
type Direction = '^' | 'v' | '<' | '>'

const directions: { [key in Direction]: Position & { next: Direction } } = {
  '^': { row: -1, col:  0, next: '>' },
  '>': { row:  0, col:  1, next: 'v' },
  'v': { row:  1, col:  0, next: '<' },
  '<': { row:  0, col: -1, next: '^' },
}

function getCharAtPos(data: string[][], pos: Position) {
  return data?.[pos.row]?.[pos.col] || '';
}

function setCharAtPos(data: string[][], pos: Position, char: string) {
  data[pos.row][pos.col] = char;
}

function findStartPos(data: string[][]) {
  const startChars = Object.keys(directions)
  const row = data.findIndex(row => row.some(cell => startChars.includes(cell)))
  const col = data[row].findIndex(cell => startChars.includes(cell))
  return { row, col }
}

function takeStep(data: string[][], pos: Position, pastPos = new Set<string>()) {
  const char = getCharAtPos(data, pos) as Direction;
  const dir = directions[char];
  const nextPos = { row: pos.row + dir.row, col: pos.col + dir.col }

  const setStr = `${pos.row},${pos.col},${char}`
  if (pastPos.has(setStr)) return
  pastPos.add(setStr)

  setCharAtPos(data, pos, 'X')
  const nextChar = getCharAtPos(data, nextPos)
  if (!nextChar) {
    return data.reduce((total, row) => {
      return total + row.filter(cell => cell === 'X').length
    }, 0)
  }

  if (nextChar === '#') {
    setCharAtPos(data, pos, dir.next)
    return takeStep(data, pos, pastPos)
  }

  setCharAtPos(data, nextPos, char)
  return takeStep(data, nextPos, pastPos)
}

function part1(data: string[][]) {
  const dataCopy: string[][] = JSON.parse(JSON.stringify(data))
  return {
    stepCount: takeStep(dataCopy, findStartPos(dataCopy)),
    newData: dataCopy
  };
}

function testObs(data: string[][], pos: Position) {
  const dataCopy: string[][] = JSON.parse(JSON.stringify(data))
  setCharAtPos(dataCopy, pos, '#')
  return takeStep(dataCopy, findStartPos(dataCopy)) === undefined
}

function part2(data: string[][]) {
  const { newData } = part1(data)
  const start = findStartPos(data)
  const usedPos = newData.reduce((positions, row, i) => {
    const cols = row.reduce((cols, cell, j) => {
      return cell === 'X' && `${i},${j}` !== `${start.row},${start.col}` ? cols.concat(j): cols
    }, [] as number[])
    return positions.concat(cols.map(col => ({ row: i, col })))
  }, [] as Position[])

  return usedPos.reduce((total, pos) => {
    return total + Number(testObs(data, pos))
  }, 0)
}

const start = Bun.nanoseconds()
const data = (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(''))

const answerPart1 = part1(data).stepCount!
console.log(answerPart1, [ 41, 5331 ].includes(answerPart1))

const answerPart2 = part2(data)
console.log(answerPart2, [ 6, 1812 ].includes(answerPart2))
console.log(`TIME: ${(Bun.nanoseconds() - start) / 10**9}`)

// ANSWER PART 1: 5331
// ANSWER PART 2: 1812
