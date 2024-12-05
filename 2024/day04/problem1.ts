type Coordinate = { row: number, col: number }
type CoordinateFunc = (coor: Coordinate) => Coordinate 

function findXmas(data: string[][], coor: Coordinate, mutCoor: CoordinateFunc, pos: number) {
  if (pos === 4) return true
  const word = 'XMAS'
  const { row, col } = mutCoor(coor)
  // console.log(data?.[row]?.[col], word[pos])
  if (data?.[row]?.[col] === word[pos]) {
    // console.log('recurse')
    return findXmas(data, { row, col }, mutCoor, pos + 1)
  }
  return false
}

function searchAllDirs(data: string[][], coor: Coordinate) {
  // Coor must be the position of an X
  const dirs: { [key: string]: CoordinateFunc } = {
    right: ({ row, col }) => ({ row, col: col + 1 }),
    left: ({ row, col }) => ({ row, col: col - 1 }),
    up: ({ row, col }) => ({ row: row - 1, col }),
    down: ({ row, col }) => ({ row: row + 1, col }),
    upRight: ({ row, col }) => ({ row: row - 1, col: col + 1 }),
    downRight: ({ row, col }) => ({ row: row + 1, col: col + 1 }),
    upLeft: ({ row, col }) => ({ row: row - 1, col: col - 1 }),
    downLeft: ({ row, col }) => ({ row: row + 1, col: col - 1 }),
  }

  return Object.keys(dirs).reduce((count, dir) => {
    // console.log('checking dir', dir)
    const result = findXmas(data, coor, dirs[dir], 1)
    return result ? count + 1 : count
  }, 0)
}

// can we just search for X and then do an all dir search from there?
const data = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''))
)

data.forEach(row => console.log(row))

let count = 0
data.forEach((row, i) => {
  row.forEach((cell, j) => {
    if (cell === 'X') {
      // console.log('checking', i, j)
      // console.log(searchAllDirs(data, { row: i, col: j }))
      count += searchAllDirs(data, { row: i, col: j })
    }
  })
})
console.log('total', count)

// ANSWER PART 1: 2646
