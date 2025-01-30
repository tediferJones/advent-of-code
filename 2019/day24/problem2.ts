type Position = { row: number, col: number }
type RecMap = Record<number, string[][]>

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

function createNewLevel() {
  return Array(5).fill(0).map(() => Array(5).fill('.'))
}

function mapHasBugOnPerimeter(map: string[][]) {
  const top = map[0]
  const bottom = map[map.length - 1]
  const left = map.map(row => row[0])
  const right = map.map(row => row[row.length - 1])
  return Boolean(
    top.concat(bottom)
    .concat(left)
    .concat(right)
    .filter(char => char === '#')
    .length
  )
}

function passTimeRec(recMap: RecMap, maxTime: number, time: number = 0) {
  if (time === maxTime) return recMap
  const newMap = JSON.parse(JSON.stringify(recMap))
  const levels = Object.keys(recMap).map(Number)
  const minLevel = Math.min(...levels)
  const maxLevel = Math.max(...levels)
  if (mapHasBugOnPerimeter(recMap[maxLevel])) {
    recMap[maxLevel + 1] = createNewLevel()
    newMap[maxLevel + 1] = createNewLevel()
  }
  if (mapHasBugOnPerimeter(recMap[minLevel])) {
    recMap[minLevel - 1] = createNewLevel()
    newMap[minLevel - 1] = createNewLevel()
  }
  Object.keys(recMap).forEach(levelStr => {
    const level = Number(levelStr)
    recMap[level].forEach((row, i) => {
      row.forEach((cell, j) => {
        const pos = { row: i, col: j }
        // skip this check, this 'tile' represents the inner grid
        if (pos.row === 2 && pos.col === 2) return

        // check all adj tiles,
        // if adj tile is out of bounds, check outer map (level - 1)
        //  - total of 4 possibilities
        // if adj tile is { row: 2, col: 2 }, check inner map (level + 1)
        //  - total of 8 possibilites

        const adjCells = directions.reduce((cells, dir) => {
          const adjPos = translatePos(pos, dir)
          if (adjPos.row === 2 && adjPos.col === 2) {
            // check inner map
            if (!recMap[level + 1]) return cells
            if (pos.row === 1) {
              return cells.concat(recMap[level + 1][0])
            } else if (pos.row === 3) {
              return cells.concat(recMap[level + 1][4])
            } else if (pos.col === 1) {
              return cells.concat(recMap[level + 1].map(row => row[0]))
            } else if (pos.col === 3) {
              return cells.concat(recMap[level + 1].map(row => row[4]))
            }
            throw Error('failed to handle inner map')
          }

          const adjChar = charAtPos(recMap[level], adjPos)
          if (!adjChar) {
            if (!recMap[level - 1]) return cells
            // check outer map
            if (adjPos.row === -1) {
              return cells.concat(recMap[level - 1][1][2])
            } else if (adjPos.row === 5) {
              return cells.concat(recMap[level - 1][3][2])
            } else if (adjPos.col === -1) {
              return cells.concat(recMap[level - 1][2][1])
            } else if (adjPos.col === 5) {
              return cells.concat(recMap[level - 1][2][3])
            }
            throw Error('failed to handle outer map')
          }
          // if we make it here, its just a normal compare
          return cells.concat(adjChar)
        }, [] as string[])

        const bugCount = adjCells.filter(cell => cell === '#').length
        if (cell === '#') {
          const resultChar = (bugCount === 1 ? '#' : '.')
          newMap[level][pos.row][pos.col] = resultChar
        } else if (cell === '.') {
          const resultChar = (0 < bugCount && bugCount < 3 ? '#' : '.')
          newMap[level][pos.row][pos.col] = resultChar
        } else {
          throw Error('cant handle char')
        }
      })
    })
  })
  return passTimeRec(newMap, maxTime, time + 1)
}

function countRecMap(recMap: RecMap) {
  return Object.keys(recMap).reduce((total, levelStr) => {
    return total + (
      recMap[Number(levelStr)]
      .flat()
      .filter(char => char === '#')
      .length
    )
  }, 0)
}

function printMap(map: string[][]) {
  map.forEach(row => console.log(row.join('')))
  console.log()
}

function printRecMap(recMap: RecMap) {
  Object.keys(recMap).toSorted((a, b) => Number(a) - Number(b)).forEach(levelStr => {
    console.log(levelStr)
    printMap(recMap[Number(levelStr)])
  })
}

const map = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(''))
)

const part1 = calcBiodiversity(findRepeatMap(map))
console.log(part1, [ 2129920, 18371095 ].includes(part1))

const maxTime = process.argv[2].includes('example') ? 10 : 200
const newRecMap = passTimeRec({ 0: map }, maxTime)
const part2 = countRecMap(newRecMap)
console.log(part2, [ 99, 2075 ].includes(part2))
