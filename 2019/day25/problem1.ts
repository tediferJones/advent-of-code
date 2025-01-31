import runIntCode from '../day23/intCode'
import { runOnce } from '../day23/intCode'

type ProgramState = ReturnType<typeof runOnce>
type ProgramStateV2 = {
  program: number[],
  index: number,
  input: number[],
  diagnostics: number[],
  halt?: true,
  relativeBase: number
}

function runTillNextCommand(programState: ProgramState) {
  const lastOutput = programState.diagnostics[programState.diagnostics.length - 1]
  if (lastOutput === 63) return programState
  return runTillNextCommand(
    runOnce(
      programState.program,
      programState.index,
      programState.input,
      programState.diagnostics,
      programState.halt,
      programState.relativeBase,
    )
  )
}

function runStateOnce(programState: ProgramState) {
  return runOnce(
    programState.program,
    programState.index,
    programState.input,
    programState.diagnostics,
    programState.halt,
    programState.relativeBase,
  )
}

function strToAscii(str: string) {
  return str.split('').map(char => char.charCodeAt(0)).concat(10)
}

function asciiToStr(ascii: number[]) {
  return ascii.map(charCode => String.fromCharCode(charCode)).join('')
}

function playGame(state: ProgramState, commands: string[]) {
  const result = runTillNextCommand(state)
  console.log(asciiToStr(result.diagnostics))
  if (!commands.length) return
  result.input = strToAscii(commands[0])
  result.diagnostics = []
  return playGame(result, commands.slice(1))
}

const harvester: Record<string, Function> = {
  'Doors': (str: string) => {
    return str.split(/\n/).map(door => door.match(/- (\w+)/)?.[1]).filter(Boolean)
  },
  'Items': (str: string) => {
    return str.split(/\n/).map(door => door.match(/- (\w+)/)?.[1]).filter(Boolean)
  }
}

function splitOutput(str: string) {
  return str.split(/\n\n/)
    .slice(2)
    .filter(str => str !== 'Command?')
    .reduce((obj, output) => {
    const key = Object.keys(harvester).find(key => output.includes(key))
    if (!key) return obj
    // console.log('FOUND', key)
    obj[key] = harvester[key](output)
    return obj
  }, {} as Record<string, string[]>)
}

function autoPlay(state: ProgramState, commands: string[] = []) {
  const result = runTillNextCommand(state)
  const output = asciiToStr(result.diagnostics)
  const opts = splitOutput(output)
  // opts.Doors.
}

function shortestPath(queue: { state: ProgramStateV2, commands: string[] }[]) {
  // if (queue.length > 4) return
  console.log(queue.length)
  if (!queue.length) return
  const { state, commands } = queue.shift()!
  const result = runTillNextCommand(state)
  const output = asciiToStr(result.diagnostics)
  // console.log(output)
  if (output.includes('password') || output.includes('Password')) throw Error('found password')
  const opts = splitOutput(output)
  // console.log(opts.Doors, output)
  opts.Doors?.forEach(door => {
    // console.log(door)
    queue.push({
      // @ts-ignore
      state: {
        ...result,
        diagnostics: [] as number[],
        input: strToAscii(door)
      },
      commands: commands.concat(door)
    })
  })
  return shortestPath(queue)
}

// can you even write out what the fuck you are trying to do
// path through every available door
// if current location has items then we need to account for every possibility
//  - each door with and without item
//  - if multiple items in one location, then add every unique combo of items
//    - order of item pick up should not matter

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number)
// console.log(program)

const state = {
  program,
  index: 0,
  input: [],
  diagnostics: [],
  halt: undefined,
  relativeBase: 0
}
// playGame(state, [
//   'south',
//   'take fuel cell',
//   'north',
//   'west',
//   'take mouse',
//   'east',
//   'north',
//   'west',
//   'south',
//   'take planetoid',
//   'east',
//   'take mutex',
//   'south',
//   'take whirled peas',
// ])

// autoPlay(state)
shortestPath([{ state, commands: [] }])
