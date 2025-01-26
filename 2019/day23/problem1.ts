import { runOnce } from './intCode'

type State = {
  program: number[],
  index: number,
  input: number[],
  diagnostics: never[],
  halt: undefined,
  relativeBase: number,
}

function solvePart1(states: State[], answer = 0) {
  states.some((state, i) => {
    if (state.diagnostics.length === 3) {
      const [ target, input1, input2 ] = state.diagnostics.slice(-3)
      console.log('SENDING', target, input1, input2)
      if (target === 255) return answer = input2
      states[target].input.push(input1)
      states[target].input.push(input2)
      state.diagnostics = []
    }
    if (state.input.length === 0) state.input.push(-1)

    // @ts-ignore
    states[i] = runOnce(
      state.program,
      state.index,
      state.input,
      state.diagnostics,
      state.halt,
      state.relativeBase,
    )
  })
  if (answer) return answer
  return solvePart1(states, answer)
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number)

const states = Array(50).fill(0).map((_, i) => {
  return {
    program,
    index: 0,
    input: [ i ],
    diagnostics: [],
    halt: undefined,
    relativeBase: 0,
  }
})

const part1 = solvePart1(states)
console.log(part1, [ 24602 ].includes(part1))
