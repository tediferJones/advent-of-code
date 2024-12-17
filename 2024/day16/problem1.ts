type Position = { row: number, col: number }

type History = {
  pos: Position,
  dir: Position,
  cost: number,
}

const directions = [
  { row:  1, col:  0 },
  { row:  0, col:  1 },
  { row: -1, col:  0 },
  { row:  0, col: -1 },
]

function posAtChar(map: string[][], char: string) {
  const row = map.findIndex(row => row.includes(char))
  const col = map[row].findIndex(cell => cell === char)
  return { row, col }
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

function historyId(history: History) {
  return `${history.pos.row},${history.pos.col},${history.dir.row},${history.dir.col}`
}

function isOppositeDir(dir1: Position, dir2: Position) {
  return dir1.row === dir2.row * -1 && dir1.col === dir2.col * -1
}

function isSameDir(dir1: Position, dir2: Position) {
  return dir1.row === dir2.row && dir1.col === dir2.col
}

function solve(map: string[][], queue: History[]) {
  const seen = new Set<string>();
  while (queue.length) {
    const history = queue.shift()!
    seen.add(historyId(history))
    if (charAtPos(map, history.pos) === 'E') return history.cost;
    directions.forEach(dir => {
      const newPos = translatePos(history.pos, dir)
      const newChar = charAtPos(map, newPos)
      if (newChar === '#') return
      if (isOppositeDir(history.dir, dir)) return
      const newHistory = {
        pos: newPos,
        dir,
        cost: history.cost + (isSameDir(history.dir, dir) ? 1 : 1001)
      }
      if (seen.has(historyId(newHistory))) return
      queue.push(newHistory)
    })
    queue.sort((a, b) => a.cost - b.cost)
  }
}

const map = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(''))
)

const answerPart1 = solve(map, [{
  pos: posAtChar(map, 'S'),
  dir: { row:  0, col:  1 },
  cost: 0,
}])!
console.log(answerPart1, [ 7036, 11048, 88468 ].includes(answerPart1))
