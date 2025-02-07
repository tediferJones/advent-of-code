import { runOnce } from '../day23/intCode'

type ProgramState = ReturnType<typeof runOnce>
type GameState = {
  items: string[],
  steps: number,
  state: ProgramState,
  location: string,
  path: string[]
}

function runTillNextCommand(programState: ProgramState): ProgramState {
  if (programState.halted) return programState
  const ascii = programState.diagnostics.slice(-8)
  if (asciiToStr(ascii) === 'Command?') return programState
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

function strToAscii(str: string) {
  return str.split('').map(char => char.charCodeAt(0)).concat(10)
}

function asciiToStr(ascii: number[]) {
  return ascii.map(charCode => String.fromCharCode(charCode)).join('')
}

function splitOutput(str: string) {
  const doorOpts = [ 'north', 'south', 'east', 'west' ]
  const name = str.match(/== (.+) ==/)?.[1]
  const opts = (
    str.split(/\n/)
    .map(line => line.match(/- (.+)/)?.[1])
    .filter(Boolean) as string[]
  )
  const doors = opts.filter(opt => doorOpts.includes(opt!))
  const item = opts.filter(opt => !doorOpts.includes(opt!))[0]
  return { doors, name, item }
}

function autoPlay(queue: GameState[], seen = new Set<string>, answer = 0) {
  if (!queue.length) return
  const current = queue.shift()!
  const message = asciiToStr(current.state.diagnostics)
  const formatMsg = splitOutput(message)
  const posId = JSON.stringify({
    location: current.location,
    items: current.items.toSorted(),
  })
  if (seen.has(posId)) return autoPlay(queue, seen)
  seen.add(posId)
  const item = formatMsg.item
  formatMsg.doors.some(door => {
    if (item) {
      if (item !== 'infinite loop') {
        // @ts-ignore
        const withItem = runTillNextCommand({
          ...current.state,
          input: strToAscii(`take ${item}`),
          diagnostics: [],
        })
        if (!withItem.halted) {
          // @ts-ignore
          const nextStateWithItem = runTillNextCommand({
            ...withItem,
            input: strToAscii(door),
            diagnostics: []
          })
          const name = splitOutput(
            asciiToStr(nextStateWithItem.diagnostics)
          ).name
          if (name) {
            queue.push({
              items: current.items.concat(item),
              steps: current.steps + 1,
              state: nextStateWithItem,
              location: name,
              path: current.path.concat(name)
            })
          }
        }
      }
    }
    // @ts-ignore
    const nextState = runTillNextCommand({
      ...current.state,
      input: strToAscii(door),
      diagnostics: [],
    })
    if (nextState.halted) {
      console.log(asciiToStr(nextState.diagnostics))
      console.log('path', current.path)
      console.log('items', current.items)
      answer = Number(asciiToStr(nextState.diagnostics).match(/(\d+)/)![1])
      return true
    }
    const name = splitOutput(asciiToStr(nextState.diagnostics)).name
    if (!name) return
    queue.push({
      items: current.items,
      steps: current.steps + 1,
      state: nextState,
      location: name, 
      path: current.path.concat(name)
    })
  })
  if (answer) return answer
  return autoPlay(queue, seen)
}

const startTime = Bun.nanoseconds()
const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number)

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
  location: splitOutput(asciiToStr(start.diagnostics)).name!,
  path: [ 'Hull Breach' ],
}
const part1 = autoPlay([ initialState ])!
console.log(part1, [ 16810049 ].includes(part1))
console.log(`${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
