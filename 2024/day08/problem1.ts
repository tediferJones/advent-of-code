type Position = { row: number, col: number }

function getAntiNodes(pos1: Position, pos2: Position) {
  const diff: Position = { row: pos1.row - pos2.row, col: pos1.col - pos2.col }
  return [
    { row: pos1.row + diff.row, col: pos1.col + diff.col },
    { row: pos2.row - diff.row, col: pos2.col - diff.col },
  ]
}

function getAllFrequencies(data: string[][], set = new Set<string>()) {
  data.forEach(row => row.forEach(cell => cell !== '.' && set.add(cell)))
  return set
}

function getAllPosForFreq(data: string[][], frequency: string) {
  return data.reduce((arr, row, i) => {
    return arr.concat(row.reduce((miniArr, cell, j) => {
      return cell === frequency ? miniArr.concat({ row: i, col: j }) : miniArr
    }, [] as Position[]))
  }, [] as Position[])
}

function getAllCombos(arr: Position[]) {
  return arr.reduce((combos, pos1, i) => {
    return combos.concat(
      arr.slice(i + 1).map(pos2 => [pos1, pos2])
    )
  }, [] as Position[][])
}

function getInBoundsFunc(data: string[][]) {
  return (pos: Position) => {
    return 0 <= pos.row && pos.row < data.length &&
      0 <= pos.col && pos.col < data[pos.row].length
  }
}

function part1(data: string[][]) {
  const uniquePos = new Set<string>()
  const frequencies = getAllFrequencies(data)
  const isInBounds = getInBoundsFunc(data)
  frequencies.forEach(frequency => {
    const positions = getAllPosForFreq(data, frequency)
    const combos = getAllCombos(positions)
    combos.forEach(combo => {
      const [ pos1, pos2 ] = getAntiNodes(combo[0], combo[1])
      if (isInBounds(pos1)) uniquePos.add(`${pos1.row},${pos1.col}`)
      if (isInBounds(pos2)) uniquePos.add(`${pos2.row},${pos2.col}`)
    })
  })
  return uniquePos.size
}

const data = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(''))
)

const part1Answer = part1(data)
console.log(part1Answer, [ 14, 273 ].includes(part1Answer))

// ANSWER PART 1: 273
