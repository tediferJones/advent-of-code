type Position = { row: number, col: number }
type Path = Position & { visited: Position[] }

function generateBoard(size: number) {
  return Array(size + 1).fill(0).map(row => {
    return Array(size + 1).fill('.')
  })
}

function modifyBoard(board: string[][], positions: Position[], char: string) {
  positions.forEach(pos => board[pos.row][pos.col] = char)
}

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function posToStr(pos: Position) {
  return `${pos.row},${pos.col}`
}

function charAtPos(board: string[][], pos: Position) {
  return board?.[pos.row]?.[pos.col]
}

function shortestPath(board: string[][], queue: Path[]) {
  const seen = new Set<string>()
  while (queue.length) {
    const current = queue.shift()!
    if (current.row === boardSize && current.col === boardSize) return current.visited;
    seen.add(posToStr(current));
    [
      { row:  1, col:  0 },
      { row:  0, col:  1 },
      { row: -1, col:  0 },
      { row:  0, col: -1 },
    ].forEach(dir => {
        const newPos = translatePos(current, dir)
        if (seen.has(posToStr(newPos))) return
        if (charAtPos(board, newPos) !== '.') return
        seen.add(posToStr(newPos));
        queue.push({
          ...newPos,
          visited: current.visited.concat(newPos)
        })
      })
  }
}

function ppm(board: string[][]) {
  board.forEach(row => console.log(row.join('')))
  console.log('~'.repeat(board[0].length))
}

const boardSize = process.argv[2] === 'example.txt' ? 6 : 70
const byteCount = process.argv[2] === 'example.txt' ? 12 : 1024

const bytes = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => {
    const [ col, row ] = line.split(',').map(Number)
    return { row, col }
  })
)

const board = generateBoard(boardSize);

modifyBoard(board, bytes.slice(0, byteCount), '#')
ppm(board)
const path = shortestPath(board, [{
  row: 0,
  col: 0,
  visited: [],
}])!
modifyBoard(board, path, '@')
ppm(board)
console.log(path.length, [ 22, 246 ].includes(path.length))
