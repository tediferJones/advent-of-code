type Position = { row: number, col: number }
type Label = { row: number, col: number, count: number }

const directions = [
  { row: -1, col:  0 },
  { row:  0, col:  1 },
  { row:  1, col:  0 },
  { row:  0, col: -1 },
]

function findChar(map: string[][], char: string) {
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

function labelPos(map: string[][], pos: Position, idk: Label[], count = 0) {
  const [ nextDir ] = directions.filter(dir => {
    const newPos = translatePos(pos, dir)
    const newChar = charAtPos(map, newPos)
    return newChar !== '#'
  })
  map[pos.row][pos.col] = '#'
  idk.push({ row: pos.row, col: pos.col, count })
  if (nextDir) {
    return labelPos(map, translatePos(pos, nextDir), idk, count + 1)
  } else {
    return idk
  }
}

function printMaze(map: string[][]) {
  map.forEach(row => console.log(row.join('')))
}

function showPath(map: string[][], path: Position[]) {
  const copy = JSON.parse(JSON.stringify(map))
  path.forEach(pos => {
    const currentChar = charAtPos(map, pos)
    copy[pos.row][pos.col] = currentChar === '#' ? '!' : '@'
  })
  printMaze(copy)
  console.log('\n')
}

function cheatCount(labeled: Label[], timeSave: number) {
  const cheats = [
    { row: -2, col:  0 },
    { row: -1, col:  1 },
    { row:  0, col:  2 },
    { row:  1, col:  1 },
    { row:  2, col:  0 },
    { row:  1, col: -1 },
    { row:  0, col: -2 },
    { row: -1, col: -1 },
  ]
  return labeled.reduce((count, label) => {
    return count + cheats.reduce((miniCount, cheat) => {
      const newPos = translatePos(label, cheat)
      const val = labeled.find(label => label.row === newPos.row && label.col === newPos.col)
      if (!val) return miniCount
      if (label.count - val.count <= 2) return miniCount
      if (label.count - val.count > timeSave) return miniCount + 1
      return miniCount
    }, 0)
  }, 0)
}

const map = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(''))
)

printMaze(map)
const startPos = findChar(map, 'S')

const labeled = labelPos(map, startPos, [])
const count = cheatCount(labeled, 0)
console.log(count, [ 44, 1511 ].includes(count))
