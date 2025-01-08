import runIntCode from './intCode'

type Position = { row: number, col: number }
type Directions = 'up' | 'down' | 'left' | 'right'

const rotations: { [ key in Directions ]: Directions[] } = {
  up: [ 'left', 'right' ],
  down: [ 'right', 'left' ],
  left: [ 'down', 'up' ],
  right: [ 'up', 'down' ],
}

const charToColor: { [key: string]: number } = {
  '.': 0,
  '#': 1,
}

const colorToChar = [ '.', '#' ]

const moves: { [key in Directions]: Position } = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 }
}

function getPanel(size: number) {
  return Array(size).fill(0).map(row => {
    return Array(size).fill('.')
  })
} 

function paint(panel: string[][], pos: Position, program: number[]) {
  let dir: Directions = 'up'
  let newProgram: number[] = program;
  let newIndex: number = 0
  const visited = new Set<string>()
  while (true) {
    const color = charToColor[panel[pos.row][pos.col]]
    // console.log(pos.row, pos.col, color)
    if (color === undefined) throw Error('probably out of bounds')
    // this tells us what color to paint current panel
    const firstRun = runIntCode(newProgram, newIndex, [ color ], [], true)
    if (firstRun.halted) break
    newProgram = firstRun.program;
    newIndex = firstRun.index!;
    panel[pos.row][pos.col] = colorToChar[firstRun.diagnostics[0]]
    visited.add(`${pos.row},${pos.col}`)
    // console.log(firstRun.diagnostics)
    // printPanel(panel)
    const secondRun = runIntCode(newProgram, newIndex, [ color ], [], true)
    newProgram = secondRun.program;
    newIndex = secondRun.index!;
    dir = rotations[dir][secondRun.diagnostics[0]]
    // console.log('move', dir)
    const move = moves[dir]
    pos = { row: pos.row + move.row, col: pos.col + move.col }
    // console.log('new pos', pos)
    if (secondRun.halted) break
  }
  printPanel(panel)
  console.log('VISITED', visited.size, visited.size === 2268)
}

function printPanel(panel: string[][]) {
  panel.forEach(row => console.log(row.join('')))
  console.log('~~~~~~~~')
}

const program = (await Bun.file(process.argv[2]).text()).split(',').map(Number)
// console.log(program)

const size = 125
const panel = getPanel(size)
const pos = { row: Math.floor(size / 2), col: Math.floor(size / 2) }
paint(panel, pos, program)

// this is one step
// const temp = runIntCode(program, 0, [ 0 ], [], true)
// console.log(temp.diagnostics[0])
// const temp2 = runIntCode(temp.program, temp.index, [ 0 ])
// console.log(temp2.diagnostics[0])
