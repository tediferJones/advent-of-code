import runIntCode from './intCode'

function makeBoard(rows: number, cols: number) {
  return Array(rows).fill(0).map(() => Array(cols).fill(0))
}

function findPos(board: number[][], char: number) {
  const row = board.findIndex(row => row.includes(char))
  if (row < 0) return
  const col = board[row].findIndex(cell => cell === char)
  return `${row},${col}`
}

function countTileType(board: number[][], type: number) {
  return board.reduce((total, row) => {
    return total + row.reduce((rowTotal, cell) => {
      return rowTotal + Number(cell === type)
    }, 0)
  }, 0)
}

function printBoard(board: number[][], score: number) {
  const chars = [ ' ', '█', '#', '-', 'O' ]
  console.clear()
  board.forEach(row => console.log(row.map(cell => chars[cell]).join('')))
  console.log('SCORE:', score)
  const start = new Date().getTime();
  while (new Date().getTime() - start < 25) {}
}

function playGame(
  board: number[][],
  program: number[],
  index: number,
  relativeBase: number,
  inputs: number[],
  prevBallPos: string,
  score= 0,
) {
  const colInfo = runIntCode(program, index, inputs, [], true, relativeBase)
  if (colInfo.halted) return score
  const rowInfo = runIntCode(colInfo.program, colInfo.index, colInfo.input, [], true, colInfo.relativeBase)
  if (rowInfo.halted) return score
  const typeInfo = runIntCode(rowInfo.program, rowInfo.index, rowInfo.input, [], true, rowInfo.relativeBase)
  if (typeInfo.halted) return score
  const [ col, row, type ] = [ colInfo, rowInfo, typeInfo ].map(info => info.diagnostics[0])

  if (col === -1 && row === 0) {
    score = type
  } else {
    board[row][col] = type
  }

  const ballPos = findPos(board, 4)
  if (ballPos && ballPos !== prevBallPos) {
    prevBallPos = ballPos
    const paddlePos = findPos(board, 3)
    printBoard(board, score)
    if (paddlePos) {
      const ballCol = ballPos.split(',').map(Number)[1]
      const paddleCol = paddlePos.split(',').map(Number)[1]
      if (ballCol > paddleCol) {
        typeInfo.input!.push(1)
      } else if (ballCol < paddleCol) {
        typeInfo.input!.push(-1)
      } else {
        typeInfo.input!.push(0)
      }
    }
  }
  return playGame(
    board,
    typeInfo.program,
    typeInfo.index!,
    typeInfo.relativeBase!,
    typeInfo.input!,
    prevBallPos,
    score
  )
}

const program = (await Bun.file(process.argv[2]).text()).split(',').map(Number)

const board = makeBoard(26, 41)
playGame(board, program, 0, 0, [], '', 0)
const part1 = countTileType(board, 2)

const part2 = playGame(board, program.with(0, 2), 0, 0, [], findPos(board, 4)!, 0)

console.log(part1, [ 432 ].includes(part1))
console.log(part2, [ 22225 ].includes(part2))
