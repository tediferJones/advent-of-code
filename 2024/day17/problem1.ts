type State = {
  [key: string]: number
  A: number,
  B: number,
  C: number,
  instructionCount: number
}

const getRegister: { [key: number]: string } = { 4: 'A', 5: 'B', 6: 'C' }

function getComboOperand(state: State, instruction: number) {
  if (instruction < 4) return instruction
  if (instruction === 7) throw Error('shouldnt happen')
  return state[getRegister[instruction]]
}

const opCodes: ((state: State, instruction: number, output: number[]) => void)[] = [
  (state, instruction) => { // 0
    state.A = Math.trunc(state.A / (2**getComboOperand(state, instruction)))
    state.instructionCount += 2
  },
  (state, instruction) => { // 1
    state.B = state.B ^ instruction
    state.instructionCount += 2
  },
  (state, instruction) => { // 2
    state.B = getComboOperand(state, instruction) % 8
    state.instructionCount += 2
  },
  (state, instruction) => { // 3
    if (state.A === 0) {
      state.instructionCount += 2
      return
    }
    state.instructionCount = instruction
  },
  (state, instruction) => { // 4
    state.B = state.B ^ state.C
    state.instructionCount += 2
  },
  (state, instruction, output) => { // 5
    output.push(getComboOperand(state, instruction) % 8)
    state.instructionCount += 2
  },
  (state, instruction) => { // 6
    state.B = Math.trunc(state.A / (2**getComboOperand(state, instruction)))
    state.instructionCount += 2
  },
  (state, instruction) => { // 7
    state.C = Math.trunc(state.A / (2**getComboOperand(state, instruction)))
    state.instructionCount += 2
  },
]

function run(state: State, instructions: number[]) {
  const output: number[] = []
  while (true) {
    const i = state.instructionCount
    if (i >= instructions.length) break;
    const opCode = instructions[i]
    const operand = instructions[i + 1]
    // console.log(i, opCode, operand, state)
    opCodes[opCode](state, operand, output)
  }
  return output.join(',')
}

const [ registers, program ] = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n\n/)
)

const initialState = [ ...registers.matchAll(/Register\s+(\w):\s+(\d+)/g) ].reduce((state, data) => {
  const [ _, register, number ] = data
  state[register] = Number(number)
  return state
}, {} as State)
initialState.instructionCount = 0

const instructions = program.match(/Program:\s+(.+)\n/)![1].split(',').map(Number)

const part1 = run(initialState, instructions)
console.log(part1, [ '4,6,3,5,6,3,5,2,1,0', '7,3,1,3,6,3,6,0,2' ].includes(part1))
