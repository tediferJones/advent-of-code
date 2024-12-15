type Position = { x: number, y: number }
type BoardSize = { width: number, height: number }
type Robot = { pos: Position, vel: Position }

function generateBoard(boardSize: BoardSize) {
  return Array(boardSize.height).fill(0).map(() => {
    return Array(boardSize.width).fill(0).map(() => [])
  }) as Robot[][][]
}

function populateBoard(board: Robot[][][], robots: Robot[]) {
  return robots.reduce((board, robot) => {
    board[robot.pos.y][robot.pos.x].push(robot)
    return board
  }, board)
}

function getBoard(boardSize: BoardSize, robots: Robot[]) {
  return populateBoard(generateBoard(boardSize), robots)
}

function tick(board: Robot[][][]) {
  const newBoard = generateBoard(boardSize)
  board.forEach((row, i) => {
    row.forEach((robots, j) => {
      robots.forEach(robot => {
        let newYPos = i + robot.vel.y
        let newXPos = j + robot.vel.x
        if (newYPos < 0) newYPos = boardSize.height + newYPos
        if (newYPos >= boardSize.height) newYPos = newYPos - boardSize.height
        if (newXPos < 0) newXPos = boardSize.width + newXPos
        if (newXPos >= boardSize.width) newXPos = newXPos - boardSize.width
        newBoard[newYPos][newXPos].push(robot)
      })
    })
  })
  return newBoard
}

function tickForCount(board: Robot[][][], count: number) {
  return Array(count).fill(0).reduce(board => tick(board), board)
}

function getSafetyFactor(board: Robot[][][]) {
  const verticleSplit = Math.floor(boardSize.width / 2)
  const horizontalSplit = Math.floor(boardSize.height / 2)

  const top = board.slice(0, horizontalSplit)
  const bottom = board.slice(horizontalSplit + 1)

  const topLeft = top.map(row => row.slice(0, verticleSplit))
  const topRight = top.map(row => row.slice(verticleSplit + 1))
  const bottomLeft = bottom.map(row => row.slice(0, verticleSplit))
  const bottomRight = bottom.map(row => row.slice(verticleSplit + 1))

  return [ topLeft, topRight, bottomLeft, bottomRight ]
    .reduce((safetyFactor, quad) => {
      const robotCount = (
        quad.flat()
        .map(cell => cell.length)
        .reduce((total, cell) => total + cell)
      )
      return safetyFactor * robotCount
    }, 1)
}

function findTree(board: Robot[][][]) {
  const fixed = board.map(row => row.map(cell => cell.length > 0 ? 1 : 0))

  // find a horizontal line
  return fixed.some(row => {
    return row.some((_, j) => {
      const length = 8
      const slice = row.slice(j, j + length)
      const result = slice.length === length && slice.every(Boolean)
      if (result) fixed.forEach(row => console.log(row.join('')))
      return result
    })
  })
}

function getCountForTree(board: Robot[][][], count = 0): number {
  if (process.argv[2] !== 'inputs.txt') return 0
  return (findTree(board)) ? count : getCountForTree(tick(board), count + 1)
}

const boardOpts: { [key: string]: BoardSize } = {
  'example.txt': { width: 11, height: 7 },
  'inputs.txt': { width: 101, height: 103 },
}

const startTime = Bun.nanoseconds()
const boardSize = boardOpts[process.argv[2]]
const robots = (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => {
    const [ px, py, vx, vy ] = line.match(/(-?\d+)/g)!.map(Number)
    return {
      pos: { x: px, y: py },
      vel: { x: vx, y: vy },
    }
  })
// const robots = [ { pos: { x: 2, y: 4 }, vel: { x: 2, y: -3 } } ]

const answerPart1 = getSafetyFactor(
  tickForCount(getBoard(boardSize, robots), 100)
)
const answerPart2 = getCountForTree(getBoard(boardSize, robots))

console.log(answerPart1, [ 12, 228410028 ].includes(answerPart1))
console.log(answerPart2, [ 8258 ].includes(answerPart2))
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)

// ANSWER PART 1: 228410028
// ANSWER PART 2: 8258
