type Coordinate = { row: number, col: number }
type Directions = 'right' | 'left' | 'up' | 'down' | 'upRight' | 'downRight' | 'upLeft' | 'downLeft'

const coorFuncs: { [key in Directions]: Coordinate } = {
  right: { row: 0, col: 1 },
  left: { row: 0, col: -1 },
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  upRight: { row: -1, col: 1 },
  downRight: { row: 1, col: 1 },
  upLeft: { row: -1, col: -1 },
  downLeft: { row: 1, col: -1 },
}

const diagonals: Coordinate[][] = [
  [ coorFuncs.upRight, coorFuncs.downLeft ],
  [ coorFuncs.upLeft, coorFuncs.downRight ],
]

function translateCoor(coor: Coordinate, dir: Coordinate) {
  return {
    row: coor.row + dir.row,
    col: coor.col + dir.col,
  }
}

// Given a direction (coorTrans), check if the next char matches the first char of word, if does slice the word and recurse
function findXmas(data: string[][], coor: Coordinate, coorTrans: Coordinate, word: string): boolean {
  if (!word) return true
  const { row, col } = translateCoor(coor, coorTrans)
  return data?.[row]?.[col] === word[0] && findXmas(data, { row, col }, coorTrans, word.slice(1))
}

// if current char is not first char of word, skip it, otherwise check all possible directions for remainder of the word
function searchAllDirs(data: string[][], coor: Coordinate, word: string) {
  if (data[coor.row][coor.col] !== word[0]) return 0
  return Object.keys(coorFuncs).reduce((count, dir) => {
    return count + Number(findXmas(data, coor, coorFuncs[dir as Directions], word.slice(1)))
  }, 0)
}

// Just search for 'X' char and then search all possible directions from that coordinate
function part1(data: string[][], word: string) {
  return data.reduce((total, row, i) => {
    return total + row.reduce((miniTotal, cell, j) => {
      return miniTotal + searchAllDirs(data, { row: i, col: j }, word)
    }, 0)
  }, 0)
}

// Word length must be an odd number
function checkDiagonals(data: string[][], coor: Coordinate, word: string) {
  const middleCharIndex = Math.floor(word.length / 2)
  if (data[coor.row][coor.col] !== word[middleCharIndex]) return false
  const validChars = word.split('').toSpliced(middleCharIndex, 1)
  return diagonals.every(diagonal => {
    const [ char1, char2 ] = diagonal.map(coorTrans => {
      const { row, col } = translateCoor(coor, coorTrans)
      return data?.[row]?.[col]
    })
    return validChars.includes(char1) && validChars.includes(char2) && char1 !== char2
  })
}

// Search for 'A' char and test if both diagonals form the word 'MAS'
function part2(data: string[][], word: string) {
  return data.reduce((total, row, i) => {
    return total + row.reduce((miniTotal, cell, j) => {
      return miniTotal + Number(checkDiagonals(data, { row: i, col: j }, word))
    }, 0)
  }, 0)
}

// Parse input file into a 2D array of individual characters
const data = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''))
)

// data.forEach(row => console.log(row))

const part1Answer = part1(data, 'XMAS')
console.log('part 1', part1Answer, [ 18, 2646 ].includes(part1Answer))
const part2Answer = part2(data, 'MAS')
console.log('part 2', part2Answer, [ 9, 2000 ].includes(part2Answer))

// ANSWER PART 1: 2646
// ANSWER PART 2: 2000
