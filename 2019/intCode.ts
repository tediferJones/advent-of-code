export type ProgramState = {
  program: number[],
  index?: number,
  input?: number[],
  diagnostics?: number[],
  halt?: boolean,
  relativeBase?: number,
  done?: boolean,
}

function handleModes(
  program: number[],
  args: number[],
  modes: number[],
  relativeBase: number,
  forceNotWrite?: true
) {
  // if you pass forceNotWrite arg, final arg will be treated as a normal arg, instead of as a dest
  return args.map((arg, i) => {
    if (!forceNotWrite && i === args.length - 1) {
      // this is the dest arg
      if (modes[i] === 1) throw Error('trying to use immediate mode for dest')
      if (modes[i] === 2) return relativeBase + arg
      return arg
    }
    if (modes[i] === 1) return arg
    if (modes[i] === 2) return program[relativeBase + arg]
    return program[arg]
  })
}

function updateProgram(program: number[], index: number, val: number) {
  let newProgram = program;
  if (index >= program.length) {
    newProgram = program.concat(Array((index - program.length) + 1).fill(0))
  }
  return newProgram.with(index, val)
}

function translateOpCode(opCode: number) {
  const strOpCode = opCode.toString()
  return {
    op: Number(strOpCode.slice(-2)),
    modes: strOpCode.slice(0, -2).split('').toReversed().map(Number),
  }
}

export function runIntCode(programState: ProgramState): Required<ProgramState> {
  const nextState = runOnce(programState)
  if (nextState.done) return nextState
  if (programState.halt === true && nextState.halt === false) return nextState
  return runIntCode(nextState)
}

// execute one instruction at a time, 
// return the new program state after execution
export function runOnce({
  program,
  index = 0,
  input = [],
  diagnostics = [],
  halt = false,
  relativeBase = 0,
  done = false,
}: ProgramState): Required<ProgramState> {
  const { op, modes } = translateOpCode(program[index])
  if (op === 99) { // program has finished running
    return {
      program,
      index,
      input,
      diagnostics,
      halt,
      relativeBase,
      done: true
    }
  } else if (op === 1) { // program[dest] = arg1 + arg2
    const pointerChange = 4
    const parameters = program.slice(index + 1, index + pointerChange)
    const [ arg1, arg2, dest ] = handleModes(program, parameters, modes, relativeBase)
    if (dest < 0) throw Error('negative dest at op 1')
    return {
      program: updateProgram(program, dest, arg1 + arg2),
      index: index + pointerChange,
      input,
      diagnostics,
      halt,
      relativeBase,
      done,
    }
  } else if (op === 2) { // program[dest] = arg1 * arg2
    const pointerChange = 4
    const parameters = program.slice(index + 1, index + pointerChange)
    const [ arg1, arg2, dest ] = handleModes(program, parameters, modes, relativeBase)
    if (dest < 0) throw Error('negative dest at op 2')
    return {
      program: updateProgram(program, dest, arg1 * arg2),
      index: index + pointerChange,
      input,
      diagnostics,
      halt,
      relativeBase,
      done,
    }
  } else if (op === 3) { // program[dest] = output[0], then slice output
    const pointerChange = 2
    const parameters = program.slice(index + 1, index + pointerChange)
    const [ dest ] = handleModes(program, parameters, modes, relativeBase)
    if (dest < 0) throw Error('negative dest at op 3')
    if (!input.length) throw Error('attempting to read input, no input found')
    return {
      program: updateProgram(program, dest, input![0]),
      index: index + pointerChange,
      input: input.slice(1),
      diagnostics,
      halt,
      relativeBase,
      done,
    }
  } else if (op === 4) { // push arg1 into diagnostics
    const pointerChange = 2
    const parameters = program.slice(index + 1, index + pointerChange)
    const [ output ] = handleModes(program, parameters, modes, relativeBase, true)
    // diagnostics.push(output)
    return {
      program,
      index: index + pointerChange,
      input,
      diagnostics: diagnostics.concat(output),
      halt: false,
      relativeBase,
      done,
    }
  } else if (op === 5) { // if arg1 !== 0, jump to arg2, otherwise increment index by pointer change
    const pointerChange = 3
    const parameters = program.slice(index + 1, index + pointerChange)
    const [ arg1, arg2 ] = handleModes(program, parameters, modes, relativeBase, true)
    return {
      program,
      index: (arg1 ? arg2 : index + pointerChange),
      input,
      diagnostics,
      halt,
      relativeBase,
      done,
    }
  } else if (op === 6) { // if arg1 === 0, jump to arg2, otherwise increment index by pointer change
    const pointerChange = 3
    const parameters = program.slice(index + 1, index + pointerChange)
    const [ arg1, arg2 ] = handleModes(program, parameters, modes, relativeBase, true)
    return {
      program,
      index: (!arg1 ? arg2 : index + pointerChange),
      input,
      diagnostics,
      halt,
      relativeBase,
      done,
    }
  } else if (op === 7) { // program[dest] = Number(arg1 < arg2)
    const pointerChange = 4
    const parameters = program.slice(index + 1, index + pointerChange)
    const [ arg1, arg2, dest ] = handleModes(program, parameters, modes, relativeBase)
    if (dest < 0) throw Error('negative dest at op 7')
    return {
      program: updateProgram(program, dest, Number(arg1 < arg2)),
      index: index + pointerChange,
      input,
      diagnostics,
      halt,
      relativeBase,
      done,
    }
  } else if (op === 8) { // program[dest] = Number(arg1 === arg2)
    const pointerChange = 4
    const parameters = program.slice(index + 1, index + pointerChange)
    const [ arg1, arg2, dest ] = handleModes(program, parameters, modes, relativeBase)
    if (dest < 0) throw Error('negative dest at op 8')
    return {
      program: updateProgram(program, dest, Number(arg1 === arg2)),
      index: index + pointerChange,
      input,
      diagnostics,
      halt,
      relativeBase,
      done,
    }
  } else if (op === 9) { // relativeBase = relativeBase + arg1
    const pointerChange = 2
    const parameters = program.slice(index + 1, index + pointerChange)
    const [ arg1 ] = handleModes(program, parameters, modes, relativeBase, true)
    return {
      program,
      index: index + pointerChange,
      input,
      diagnostics,
      halt,
      relativeBase: relativeBase + arg1,
      done,
    }
  }
  throw Error(`operation '${op}' not recognized`)
}
