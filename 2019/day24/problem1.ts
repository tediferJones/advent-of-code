type Position = { row: number, col: number }

const directions = [
  { row:  0, col:  1 },
  { row:  1, col:  0 },
  { row:  0, col: -1 },
  { row: -1, col:  0 },
]

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function charAtPos(map: string[][], pos: Position): string | undefined {
  return map?.[pos.row]?.[pos.col]
}

function passTime(map: string[][]) {
  return map.map((row, i) => {
    return row.map((cell, j) => {
      const pos = { row: i, col: j }
      const adjBugCount = directions.map(dir => {
        const adjPos = translatePos(pos, dir)
        return charAtPos(map, adjPos) === '#'
      }).filter(Boolean).length

      if (cell === '#') {
        return adjBugCount === 1 ? '#' : '.'
      }
      if (cell === '.') {
        return 0 < adjBugCount && adjBugCount < 3 ? '#' : '.'
      }
      throw Error(`Char '${cell}' cannot be processed`)
    })
  })
}

function findRepeatMap(map: string[][], cache = new Set<string>) {
  const mapStr = JSON.stringify(map)
  if (cache.has(mapStr)) return map
  return findRepeatMap(passTime(map), cache.add(mapStr))
}

function calcBiodiversity(map: string[][]) {
  return map.flat().reduce((rating, cell, i) => {
    return cell === '#' ? rating + 2**i : rating
  }, 0)
}

function printMap(map: string[][]) {
  map.forEach(row => console.log(row.join('')))
  console.log()
}

const map = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(''))
)

const part1 = calcBiodiversity(findRepeatMap(map))
console.log(part1, [ 2129920, 18371095 ].includes(part1))
