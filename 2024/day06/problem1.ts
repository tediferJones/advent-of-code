type Position = { row: number, col: number }
type Direction = '^' | 'v' | '<' | '>'

const directions: { [key in Direction]: Position } = {
  '^': { row: -1, col: 0 },
  'v': { row: 1, col: 0 },
  '<': { row: 0, col: -1 },
  '>': { row: 0, col: 1 },
}

const directionChange: { [key in Direction]: Direction } = {
  '^': '>',
  '>': 'v',
  'v': '<',
  '<': '^',
}

function charAtPos(data: string[][], pos: Position) {
  return data?.[pos.row]?.[pos.col]
}

function stepsToNextObsticle(data: string[][], pos: Position) {
  const char = charAtPos(data, pos) as Direction;
  const dir = directions[char];
  const nextPos = { row: pos.row + dir.row, col: pos.col + dir.col }

  const nextChar = charAtPos(data, nextPos)
  if (!nextChar) {
    data[pos.row][pos.col] = 'X'
    return data.reduce((total, row) => {
      return total + row.reduce((miniTotal, cell) => cell === 'X' ? miniTotal + 1 : miniTotal, 0)
    }, 0)
  }

  if (nextChar === '#') {
    data[pos.row][pos.col] = directionChange[char]
    return stepsToNextObsticle(data, pos)
  }

  data[pos.row][pos.col] = 'X'
  data[nextPos.row][nextPos.col] = char
  return stepsToNextObsticle(data, nextPos)
}

function part1(data: string[][]) {
  let pos;
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (Object.keys(directionChange).includes(data[i][j])) {
        pos = { row: i, col: j }
      }
    }
  };
  return stepsToNextObsticle(data, pos!);
}

const data = (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(''))

const answerPart1 = part1(data)
console.log(answerPart1, [ 41, 5331 ].includes(answerPart1))

// ANSWER PART 1: 5331
