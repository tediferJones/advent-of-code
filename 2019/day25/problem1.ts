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

function splitOutputV2(str: string) {
  const doorOpts = [ 'north', 'south', 'east', 'west' ]
  const name = str.match(/== (.+) ==/)?.[1]
  if (!name) throw Error('cant find name')
  const opts = str.split(/\n/).map(line => line.match(/- (.+)/)?.[1]).filter(Boolean)
  const doors = opts.filter(opt => doorOpts.includes(opt!))
  const items = opts.filter(opt => !doorOpts.includes(opt!))
  console.log({ doors, items, name })
  uniqNames.add(name)
  uniqItems.add(items[0]!)
  if (items.length > 1) throw Error('found multiple items')
  return { doors, items, name }
}

function autoPlay(state: ProgramState, commands: string[] = []) {
  const result = runTillNextCommand(state)
  const output = asciiToStr(result.diagnostics)
  const opts = splitOutput(output)
  // opts.Doors.
}

const uniqNames = new Set<string>()
const uniqItems = new Set<string>()
function shortestPath(queue: { state: ProgramStateV2, commands: string[] }[]) {
  // if (queue.length > 16) return
  console.log(queue.length)
  console.log(uniqNames)
  console.log(uniqItems)
  if (!queue.length) return
  const { state, commands } = queue.shift()!
  const result = runTillNextCommand(state)
  const output = asciiToStr(result.diagnostics)
  // console.log(output)
  if (output.includes('password') || output.includes('Password')) throw Error('found password')
  const opts = splitOutput(output)
  console.log(opts)
  console.log(splitOutputV2(output))
  // return
  // console.log(opts.Doors, output)
  opts.Doors?.forEach(door => {
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
