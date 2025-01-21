import runIntCode from "../day13/intCode"

type Position = { row: number, col: number }

function getAllPos(min: number, max: number) {
  const nums = [ ...Array(max).keys() ]
  return nums.map(row => {
    return nums.map(col => {
      return { row: row + min, col: col + min }
    })
  }).flat()
}

function testPos(program: number[], pos: Position) {
  const result = runIntCode(program, 0, [ pos.col, pos.row ])
  return result.diagnostics[0]
}

function solvePart1(program: number[]) {
  return getAllPos(0, 50).reduce((count, pos) => {
    return count + testPos(program, pos)
  }, 0)
}

const startTime = Bun.nanoseconds()
const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number)

const part1 = solvePart1(program)
console.log(part1)

console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
