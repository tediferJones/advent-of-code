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
      // console.log('SENDING', target, input1, input2)
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

// need to track last two to check for three in a row
const prevY = [ NaN, NaN ]
function solvePart2(states: State[], nat: number[]) {
  const isIdle = states.every(state => {
    return state.input.length === 0 || state.input.every(num => num === -1)
  })
  if (nat.length && isIdle) {
    // console.log('Is idle, send from NAT', nat)
    if (prevY.every(prev => prev === nat[1])) return nat[1]
    prevY.shift()
    prevY.push(nat[1])
    states[0].input = nat
    nat = []
  }

  states.some((state, i) => {
    if (state.diagnostics.length === 3) {
      const [ target, input1, input2 ] = state.diagnostics.slice(-3)
      if (target === 255) {
        nat = [ input1, input2 ]
      } else {
        states[target].input.push(input1, input2)
      }
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

  return solvePart2(states, nat)
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

const startTime = Bun.nanoseconds()
const part1 = solvePart1(states)
console.log(part1, [ 24602 ].includes(part1))

// its not the packet that is sent two times in a row
// its actually the packet that is sent three time in a row
const part2 = solvePart2(states, [])
console.log(part2, [ 19641 ].includes(part2))
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9}`)
