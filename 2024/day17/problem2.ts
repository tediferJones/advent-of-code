type State = {
  [key: string]: bigint
  A: bigint,
  B: bigint,
  C: bigint,
  instructionCount: bigint
}

function getComboOperand(state: State, instruction: bigint) {
  if (instruction < 4n) return instruction
  if (instruction === 7n) throw Error('shouldnt happen')
  if (instruction === 4n) return state.A
  if (instruction === 5n) return state.B
  if (instruction === 6n) return state.C
  throw Error('something is wrong')
}

const opCodes: ((state: State, instruction: number, output: bigint[]) => void)[] = [
  (state, instruction) => { // 0
    state.A = state.A >> getComboOperand(state, BigInt(instruction))
    state.instructionCount += 2n
  },
  (state, instruction) => { // 1
    state.B = state.B ^ BigInt(instruction)
    state.instructionCount += 2n
  },
  (state, instruction) => { // 2
    state.B = getComboOperand(state, BigInt(instruction)) % 8n
    state.instructionCount += 2n
  },
  (state, instruction) => { // 3
    if (state.A === 0n) {
      state.instructionCount += 2n
      return
    }
    state.instructionCount = BigInt(instruction)
  },
  (state, instruction) => { // 4
    state.B = state.B ^ state.C
    state.instructionCount += 2n
  },
  (state, instruction, output) => { // 5
    output.push(getComboOperand(state, BigInt(instruction)) % 8n)
    state.instructionCount += 2n
  },
  (state, instruction) => { // 6
    state.B = state.A >> getComboOperand(state, BigInt(instruction))
    state.instructionCount += 2n
  },
  (state, instruction) => { // 7
    state.C = state.A >> getComboOperand(state, BigInt(instruction))
    state.instructionCount += 2n
  },
]

function run(state: State, instructions: number[], output: bigint[]) {
  while (true) {
    const i = Number(state.instructionCount)
    if (i >= instructions.length) break;
    const opCode = instructions[i]
    const operand = instructions[i + 1]
    // console.log(i, opCode, operand, state)
    opCodes[opCode](state, operand, output)
  }
  return output.join(',')
}

function findQuine(ins: number[], lastIndex: number, a: number): any {
  // Practically copied from u/Aspen138, but at least this actually makes sense
  // https://www.reddit.com/r/adventofcode/comments/1hg38ah/comment/m2kxbd7/
  for (let candidate = 0; candidate < 8; candidate++) {
    const test_input = a * 8 + candidate; // still dont understand how out of these 8 candidates one is guaranteed to be right, but sure whatever
    const insSlice = ins.slice(lastIndex);
    const output = run({ A: BigInt(test_input), B: 0n, C: 0n, instructionCount: 0n }, ins, [])
    if (output === insSlice.join(',')) {
      if (lastIndex === 0) return test_input
      const result = findQuine(ins, lastIndex - 1, test_input)
      if (result) return result
    }
  }
}

const [ registers, program ] = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n\n/)
)

const initialState = [ ...registers.matchAll(/Register\s+(\w):\s+(\d+)/g) ].reduce((state, data) => {
  const [ _, register, number ] = data
  state[register] = BigInt(number)
  return state
}, {} as State)
initialState.instructionCount = 0n

const instructions = program.match(/Program:\s+(.+)\n/)![1].split(',').map(Number)

const part1 = run(initialState, instructions, [])
console.log(part1, [ '4,6,3,5,6,3,5,2,1,0', '7,3,1,3,6,3,6,0,2' ].includes(part1))

const part2 = findQuine(instructions, instructions.length - 1, 0)
console.log(part2, [ 117440, 105843716614554 ].includes(part2))
