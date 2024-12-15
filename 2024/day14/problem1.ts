type Position = { x: number, y: number }
type BoardSize = { width: number, height: number }
type Robot = { pos: Position, vel: Position }

function generateBoard(boardSize: BoardSize) {
  return Array(boardSize.height).fill(0).map(row => {
    return Array(boardSize.width).fill(0).map(cell => [])
  }) as Robot[][][]
}

function populateBoard(board: Robot[][][], robots: Robot[]) {
  robots.forEach(robot => {
    board[robot.pos.y][robot.pos.x].push(robot)
  })
  return board
}

function tick(board: Robot[][][], robots: Robot[]) {
  const newBoard = generateBoard(boardSize)
  board.forEach((row, i) => {
    row.forEach((robots, j) => {
      robots.forEach(robot => {
        let newYPos = i + robot.vel.y
        let newXPos = j + robot.vel.x
        if (newYPos < 0) {
          newYPos = boardSize.height + newYPos
        }
        if (newYPos >= boardSize.height) {
          newYPos = newYPos - boardSize.height
        }
        if (newXPos < 0) {
          newXPos = boardSize.width + newXPos
        }
        if (newXPos >= boardSize.width) {
          newXPos = newXPos - boardSize.width
        }
        newBoard[newYPos][newXPos].push(robot)
      })
    })
  })
  return newBoard
}

function tickForCount(board: Robot[][][], robots: Robot[], count: number) {
  Array(count).fill(0).forEach(_ => {
    board = tick(board, robots)
  })
  return board
}

function getQuadrantCount(board: Robot[][][]) {
  const verticleSplit = Math.floor(boardSize.width / 2)
  const horizontalSplit = Math.floor(boardSize.height / 2)

  const top = board.slice(0, horizontalSplit)
  const bottom = board.slice(horizontalSplit + 1)

  const topLeft = top.map(row => row.slice(0, verticleSplit))
  const topRight = top.map(row => row.slice(verticleSplit + 1))
  const bottomLeft = bottom.map(row => row.slice(0, verticleSplit))
  const bottomRight = bottom.map(row => row.slice(verticleSplit + 1))

  return [ topLeft, topRight, bottomLeft, bottomRight ].reduce((safetyFactor, quad) => {
    const robotCount = quad.flat().map(cell => cell.length).reduce((total, cell) => total + cell)
    return safetyFactor * robotCount
  }, 1)
}

function prettyPrint(board: Robot[][][]) {
  board.forEach(row => console.log(row.map(cell => cell.length)))
}

const boardSize = { width: 101, height: 103 }
// const boardSize = { width: 11, height: 7 }
const maxTime = 100
const robots = (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => {
    const [ _, px, py, vx, vy ] = line.match(/p=(-?\d+),(-?\d+)\s+v=(-?\d+),(-?\d+)/)!.map(Number)
    return {
      pos: { x: px, y: py },
      vel: { x: vx, y: vy },
    }
  })
// const robots = [ { pos: { x: 2, y: 4 }, vel: { x: 2, y: -3 } } ]

let board = generateBoard(boardSize)
populateBoard(board, robots)
const newBoard = tickForCount(board, robots, maxTime)
const answer = getQuadrantCount(newBoard)
console.log(answer, [ 12, 228410028 ].includes(answer))

// ANSWER PART 1: 228410028
