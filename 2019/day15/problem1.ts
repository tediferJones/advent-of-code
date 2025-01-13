import runIntCode from '../day13/intCode'

type Position = { row: number, col: number }
type ProgramState = ReturnType<typeof runIntCode> & {
  steps: number,
  pos: Position
}

const dirs = [ 1, 2, 3, 4 ]

const posChange: Record<number, Position> = {
  1: { row: -1, col:  0 },
  2: { row:  1, col:  0 },
  3: { row:  0, col: -1 },
  4: { row:  0, col:  1 },
}

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function posToStr(pos: Position) {
  return `${pos.row},${pos.col}`
}

function shortestPath(program: number[]) {
  const queue: ProgramState[] = [{
    program,
    index: 0,
    diagnostics: [],
    relativeBase: 0,
    input: [],
    steps: 0,
    pos: { row: 0, col: 0 },
  }];
  const seen = new Set<string>();
  while (queue.length) {
    let found = 0;
    const { program, index, relativeBase, steps, pos } = queue.shift()!;
    dirs.forEach(dir => {
      const newPos = translatePos(pos, posChange[dir])
      const strNewPos = posToStr(newPos)
      if (seen.has(strNewPos)) return
      seen.add(strNewPos)
      const nextStep = runIntCode(program, index, [ dir ], [], true, relativeBase);
      if (nextStep.diagnostics[0] === 0) return
      if (nextStep.diagnostics[0] === 2) return found = steps + 1
      queue.push({
        ...nextStep,
        steps: steps + 1,
        pos: newPos
      })
    })
    if (found) return found
  }
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number)

const part1 = shortestPath(program)!
console.log(part1, [ 252 ].includes(part1))
