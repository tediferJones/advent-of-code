type Position = { row: number, col: number }

const directions = [
  { row: -1, col:  0 },
  { row:  1, col:  0 },
  { row:  0, col:  1 },
  { row:  0, col: -1 },
]

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function getPoints(map: string[][], char: string, pos: Position): Position[] {
  return directions.reduce((positions, dir) => {
    const newPos = translatePos(pos, dir)
    const newPosStr = `${newPos.row},${newPos.col}`
    if (!usedPos.has(newPosStr) && map?.[newPos.row]?.[newPos.col] === char) {
      usedPos.add(newPosStr)
      return positions.concat(newPos, getPoints(map, char, newPos))
    }
    return positions
  }, [] as Position[])
}

function scanPlot(map: string[][], pos: Position) {
  const char = map[pos.row][pos.col];
  const posStr = `${pos.row},${pos.col}`
  if (usedPos.has(posStr)) return 0

  usedPos.add(`${pos.row},${pos.col}`)
  let positions = getPoints(map, char, pos).concat(pos)
  const area = positions.length
  const perimeter = getPerimeter(map, positions, char)
  return area * perimeter
}

function getPerimeter(map: string[][], positions: Position[], char: string) {
  return positions.reduce((perimeter, pos) => {
    const temp = directions.reduce((mini, dir) => {
      const newPos = translatePos(pos, dir)
      if (map?.[newPos.row]?.[newPos.col] === char) {
        return mini
      }
      return mini + 1
    }, 0)
    return perimeter + temp
  }, 0)
}

const usedPos = new Set<string>();
const map = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(''))
)

const answerPart1 = map.reduce((total, row, i, map) => {
  return total + row.reduce((miniTotal, cell, j) => {
    return miniTotal + scanPlot(map, { row: i, col: j })
  }, 0)
}, 0)
console.log(answerPart1, [ 1930, 1533644 ].includes(answerPart1))

// ANSWER PART 1: 1533644
