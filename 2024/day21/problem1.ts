type Position = { row: number, col: number }

class Keypad {
  keypad: string[][]
  position: Position
  startPos: Position

  constructor() {
    this.keypad = [
      [ '7', '8', '9' ],
      [ '4', '5', '6' ],
      [ '1', '2', '3' ],
      [ '', '0', 'A' ]
    ]
    this.startPos = { row: 3, col: 2 }
    this.position = this.startPos
  }

  moveTo(num: string): string {
    return num.split('').reduce((dirs, num) => {
      const row = this.keypad.findIndex(row => row.includes(num))
      const col = this.keypad[row].findIndex(cell => cell === num)
      const rowDiff = this.position.row - row
      const colDiff = this.position.col - col
      this.position = { row, col }
      let keypresses = ''
      if (rowDiff > 0) {
        keypresses += '^'.repeat(rowDiff)
      }
      if (rowDiff < 0) {
        keypresses += 'v'.repeat(Math.abs(rowDiff))
      }
      if (colDiff > 0) {
        keypresses += '<'.repeat(colDiff)
      }
      if (colDiff < 0) {
        keypresses += '>'.repeat(Math.abs(colDiff))
      }
      return dirs + keypresses + 'A' // + (!idk ? this.moveTo('A', true) : '')
    }, '')
  }
}

class Dirpad {
  dirpad: string[][]
  position: Position
  child: Dirpad | Keypad
  illegalPos = { row: 0, col: 0 }

  constructor(child: Dirpad | Keypad) {
    this.dirpad = [
      [ '', '^', 'A' ],
      [ '<', 'v', '>' ]
    ]
    this.position = { row: 0, col: 2 }
    this.child = child
  }

  moveTo(dirs: string): string {
    return dirs.split('').reduce((next, dir) => {
      const row = this.dirpad.findIndex(row => row.includes(dir))
      const col = this.dirpad[row].findIndex(cell => cell === dir)
      const rowDiff = this.position.row - row
      const colDiff = this.position.col - col
      this.position = { row, col }
      let keypresses = ''
      if (colDiff > 0) {
        keypresses += '<'.repeat(colDiff)
      }
      if (colDiff < 0) {
        keypresses += '>'.repeat(Math.abs(colDiff))
      }
      if (rowDiff > 0) {
        keypresses += '^'.repeat(rowDiff)
      }
      if (rowDiff < 0) {
        keypresses += 'v'.repeat(Math.abs(rowDiff))
      }
      return next + keypresses + 'A'
    }, '')
  }
}

function getComplexity(number: string) {
  const keypad = new Keypad();
  const dirpad1 = new Dirpad(keypad);
  const dirpad2 = new Dirpad(dirpad1);
  const step1 = keypad.moveTo(number)
  console.log(step1)
  const step2 = dirpad1.moveTo(step1)
  console.log(step2)
  const step3 = dirpad2.moveTo(step2)
  console.log(step3)
  const num = Number(number.match(/(\d+)A/)![1])
  console.log(step3.length, num)
  return num * step3.length
}
// getComplexity("029A")

const answer = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .reduce((total, number) => {
    const result = getComplexity(number)
    return total + result
  }, 0)
)
console.log(answer)
