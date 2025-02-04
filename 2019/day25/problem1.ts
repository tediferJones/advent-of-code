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

function runTillNextCommand(programState: ProgramState): ProgramState {
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
  console.log('GO', commands[0])
  if (!commands.length) return
  result.input = strToAscii(commands[0])
  result.diagnostics = []
  // if (JSON.stringify(result) === JSON.stringify(state)) throw Error('same state')
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
  // console.log(str)
  // console.log(str)
  // if (!name) throw Error('cant find name')
  const opts = str.split(/\n/).map(line => line.match(/- (.+)/)?.[1]).filter(Boolean) as string[]
  const doors = opts.filter(opt => doorOpts.includes(opt!))
  const items = opts.filter(opt => !doorOpts.includes(opt!))
  // console.log({ doors, items, name })
  if (name) uniqNames.add(name)
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
  console.log('STATE', commands)
  const result = runTillNextCommand(state)
  const output = asciiToStr(result.diagnostics)
  // console.log(output)
  if (output.includes('password') || output.includes('Password')) throw Error('found password')
  // const opts = splitOutput(output)
  // console.log(opts)
  console.log('output', splitOutputV2(output))
  // return
  // console.log(opts.Doors, output)
  // opts.Doors?.forEach(door => {
  //   queue.push({
  //     // @ts-ignore
  //     state: {
  //       ...result,
  //       diagnostics: [] as number[],
  //       input: strToAscii(door)
  //     },
  //     commands: commands.concat(door)
  //   })
  // })
  
  const fixedOutput = splitOutputV2(output)
  if (fixedOutput.name) {
    fixedOutput.doors.forEach(door => {
      if (fixedOutput.items) {
        console.log('adding item')
        fixedOutput.items.forEach(item => {
          console.log(item)
          if (item === 'infinite loop') return
          // @ts-ignore
          const withItem = runTillNextCommand({
            ...result,
            diagnostics: [] as number[],
            input: strToAscii(`take ${item}`)
          })
          queue.push({
            // @ts-ignore
            state: {
              ...withItem,
              diagnostics: [] as number[],
              input: strToAscii(door as string)
            },
            commands: commands.concat(item as string, door as string)
          })
        })
      }
      queue.push({
        // @ts-ignore
        state: {
          ...result,
          diagnostics: [] as number[],
          input: strToAscii(door as string)
        },
        commands: commands.concat(door as string)
      })
    })

  }
  return shortestPath(queue)
}

type GameState = {
  items: string[],
  steps: number,
  state: ProgramState,
  location: string,
}
const msgs = new Set<string>()
function autoPlayV2(queue: GameState[], seen = new Set<string>) {
  if (!queue.length) {
    console.log(msgs)
    throw Error('failed to find password')
  }
  const current = queue.shift()!
  console.log(current.steps, current.location, current.items)
  console.log(queue.length)
  const message = asciiToStr(current.state.diagnostics)
  msgs.add(message)
  // console.log(msgs)
  if (message.includes('see that item here')) throw Error('item not here')
  if (message.includes('password') || message.includes('Password') || message.includes('airlock') || message.includes('Airlock')) {
    throw Error('found')
  }
  const formatMsg = splitOutputV2(message)
  if (!formatMsg.name) return autoPlayV2(queue, seen)
  const posId = {
    location: current.location,
    items: current.items.toSorted(),
  }
  if (seen.has(JSON.stringify(posId))) return autoPlayV2(queue, seen)
  seen.add(JSON.stringify(posId))
  // console.log(formatMsg)
  formatMsg.doors.forEach(door => {
    formatMsg.items.forEach(item => {
      if (current.items.includes(item)) return
      if (item === 'infinite loop') return
      // @ts-ignore
      const withItem = runTillNextCommand({
        ...current.state,
        input: strToAscii(`take ${item}`),
        diagnostics: [],
      })
      // @ts-ignore
      const nextStateWithItem = runTillNextCommand({
        ...withItem,
        input: strToAscii(door),
        diagnostics: []
      })
      if (!formatMsg.name) throw Error('no name')
      const name = splitOutputV2(asciiToStr(nextStateWithItem.diagnostics)).name
      if (!name) return
      queue.push({
        items: current.items.concat(item),
        steps: current.steps + 1,
        state: nextStateWithItem,
        location: formatMsg.name
      })
    })

    // @ts-ignore
    const nextState = runTillNextCommand({
      ...current.state,
      input: strToAscii(door),
      diagnostics: [],
    })
    const name = splitOutputV2(asciiToStr(nextState.diagnostics)).name
    if (!name) throw Error('no name')
    queue.push({
      items: current.items,
      steps: current.steps + 1,
      state: nextState,
      location: name, 
    })
  })
  return autoPlayV2(queue, seen)
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

const start = runTillNextCommand(state)
const initialState = {
  state: start,
  items: [],
  steps: 0,
  location: splitOutputV2(asciiToStr(start.diagnostics)).name!
}
autoPlayV2([ initialState ])

// runTillNextCommand({
//   ...initialState.state,
//   input: 'north'
// })

// playGame(state, [
//   'south',
//   'south',
//   'take fuel cell',
//   'take fuel cell',
//   'inv'
// ])

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

// playGame(state, [ 'north', 'west', 'south', 'east', 'west', 'north', 'east', 'south' ])

// all locations
// Set(16) {
//   "Hull Breach", X
//   "Hallway", X
//   "Engineering",
//   "Holodeck",
//   "Storage",
//   "Sick Bay", X
//   "Science Lab",
//   "Passages",
//   "Kitchen", X
//   "Arcade",
//   "Observatory",
//   "Stables",
//   "Navigation",
//   "Warp Drive Maintenance",
//   "Gift Wrapping Center",
//   "Hot Chocolate Fountain",
// }

// all messages
// Set(27) {
//   "\n\n\n== Hull Breach ==\nYou got in through a hole in the floor here. To keep your ship from also freezing, the hole has been sealed.\n\nDoors here lead:\n- north\n- south\n- west\n\nCommand?",
//   "\n\n\n\n== Hallway ==\nThis area has been optimized for something; you're just not quite sure what.\n\nDoors here lead:\n- north\n- south\n- west\n\nCommand?",
//   "\n\n\n\n== Engineering ==\nYou see a whiteboard with plans for Springdroid v2.\n\nDoors here lead:\n- north\n\nItems here:\n- fuel cell\n\nCommand?",
//   "\n\n\n\n== Holodeck ==\nSomeone seems to have left it on the Giant Grid setting.\n\nDoors here lead:\n- north\n- east\n- west\n \nItems here:\n- mouse\n\nCommand?",
//   "\n\n\n\n== Storage ==\nThe boxes just contain more boxes.  Recursively.\n\nDoors here lead:\n- south\n\nCommand?",
//   "\n\n\n\n== Hull Breach ==\nYou got in through a hole in the floor here. To keep your ship from also freezing, the hole has been sealed.\n\nDoors here lead:\n- north\n- south\n- west\n\nCommand?",
//   "\n\n\n\n== Sick Bay ==\nSupports both Red-Nosed Reindeer medicine and regular reindeer medicine.\n\nDoors here lead:\n- east\n- south\n\nCommand?",
//   "\n\n\n\n== Science Lab ==\nYou see evidence here of prototype polymer design work.\n\nDoors here lead:\n- east\n- south\n\nItems here:\n- photons\n\nCommand?",
//   "\n\n\n\n== Passages ==\nThey're a little twisty and starting to look all alike.\n\nDoors here lead:\n- east\n- south\n- west\n\ nItems here:\n- infinite loop\n\nCommand?",
//   "\n\n\n\n== Kitchen ==\nEverything's freeze-dried.\n\nDoors here lead:\n- north\n- east\n- west\n\nItems here:\n- planetoid\n\nCommand?",
//   "\n\n\n\n== Engineering ==\nYou see a whiteboard with plans for Springdroid v2.\n\nDoors here lead:\n- north\n\nCommand?",
//   "\n\n\n\n== Arcade ==\nNone of the cabinets seem to have power.\n\nDoors here lead:\n- west\n\nItems here:\n- klein bottle\n\nCommand?",
//   "\n\n\n\n== Holodeck ==\nSomeone seems to have left it on the Giant Grid setting.\n\nDoors here lead:\n- north\n- east\n- west\n \nCommand?",
//   "\n\n\n\n== Observatory ==\nThere are a few telescopes; they're all bolted down, though.\n\nDoors here lead:\n- north\n\nItems here:\n- dark matter\n\nCommand?",
//   "\n\n\n\n== Stables ==\nReindeer-sized. They're all empty.\n\nDoors here lead:\n- east\n\nItems here:\n- escape pod\n\nCommand?",
//   "\n\n\n\n== Navigation ==\nStatus: Stranded. Please supply measurements from fifty stars to recalibrate.\n\nDoors here lead:\n- east\n- south\n- west\n\nItems here:\n- mutex\n\nCommand?",
//   "\n\n\n\n== Warp Drive Maintenance ==\nIt appears to be working normally.\n\nDoors here lead:\n- east\n\nItems here:\n- antenna\n\nCommand?",
//   "\n\n\n\n== Kitchen ==\nEverything's freeze-dried.\n\nDoors here lead:\n- north\n- east\n- west\n\nCommand?",
//   "\n\n\n\n== Gift Wrapping Center ==\nHow else do you wrap presents on the go?",
//   "\n\n\n\n== Hot Chocolate Fountain ==\nSomehow, it's still working.\n\nDoors here lead:\n- north\n- south\n- west\n\nItems here: \n- whirled peas\n\nCommand?",
//   "\n\n\n\n== Arcade ==\nNone of the cabinets seem to have power.\n\nDoors here lead:\n- west\n\nCommand?",
//   "\n\n\n\n== Observatory ==\nThere are a few telescopes; they're all bolted down, though.\n\nDoors here lead:\n- north\n\nCommand?",
//   "\n\n\n\n== Corridor ==\nThe metal walls and the metal floor are slightly different colors. Or are they?",
//   "\n\n\n\n== Crew Quarters ==\nThe beds are all too small for you.\n\nDoors here lead:\n- east\n\nItems here:\n- molten lava\n\nCommand?",
//   "\n\n\n\n== Warp Drive Maintenance ==\nIt appears to be working normally.\n\nDoors here lead:\n- east\n\nCommand?",
//   "\n\n\n\n== Science Lab ==\nYou see evidence here of prototype polymer design work.\n\nDoors here lead:\n- east\n- south\n\nCommand?",
//   "\n\n\n\n== Hot Chocolate Fountain ==\nSomehow, it's still working.\n\nDoors here lead:\n- north\n- south\n- west\n\nCommand?",
// }
// autoPlay(state)
// shortestPath([{ state, commands: [] }])
