function handleModes(program: number[], args: number[], modes: number[], relativeBase: number) {
  return args.map((arg, i) => {
    if (modes[i] === 1) return arg
    if (modes[i] === 2) return program[relativeBase + arg]
    return program[arg]
  })
}

// this should also handle destinations
function handleModesV2(program: number[], args: number[], modes: number[], relativeBase: number) {
  return args.map((arg, i) => {
    if (i === args.length - 1) {
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

export default function runIntCode(
  program: number[],
  index = 0,
  input?: number[],
  diagnostics: number[] = [],
  halt?: boolean,
  relativeBase: number = 0,
) {
  const op = Number(program[index].toString().slice(-2))
  const modes = program[index].toString().slice(0, -2).split('').toReversed().map(Number)
  // if (modes.includes(2)) console.log('used mode 2', program[index])
  if (op === 99) {
    return { program, diagnostics, halted: true }
  } else if (op === 1) {
    const pointerChange = 4
    const args = [ program[index + 1], program[index + 2] ]
    // const dest = program[index + 3]
    // const [ temp1, temp2 ] = handleModes(program, args, modes, relativeBase)
    const [ temp1, temp2, dest ] = handleModesV2(program, args.concat(program[index + 3]), modes, relativeBase)
    if (dest < 0) throw Error('negative dest at op 1')
    // if (program[index] === 21101) {
    //   console.log('opCode', 21101)
    //   console.log('dest', dest, modes)
    //   throw Error('probably negative dest')
    // }
    return runIntCode(
      program.with(dest, temp1 + temp2),
      index + pointerChange,
      input,
      diagnostics,
      halt,
      relativeBase,
    )
  } else if (op === 2) {
    const pointerChange = 4
    const args = [ program[index + 1], program[index + 2] ]
    // const dest = program[index + 3]
    // const [ temp1, temp2 ] = handleModes(program, args, modes, relativeBase)
    const [ temp1, temp2, dest ] = handleModesV2(program, args.concat(program[index + 3]), modes, relativeBase)
    if (dest < 0) throw Error('negative dest at op 2')
    return runIntCode(
      program.with(dest, temp1 * temp2),
      index + pointerChange,
      input,
      diagnostics,
      halt,
      relativeBase,
    )
  } else if (op === 3) {
    // should probably use handleModes here, 
    // but on the other hand, destinations are always in position mode
    // and since there is only one arg which is the destination, we're good???
    console.log('op3 modes', modes)
    const pointerChange = 2
    const args = [ program[index + 1] ]
    // const [ temp1 ] = handleModes(program, args, modes, relativeBase)
    // let idk = args[0]
    // if (modes.includes(1)) throw Error('mode 1 detected at op 3')
    // if (modes.includes(2)) {
    //   if (modes.length > 1) {
    //     throw Error('not sure how to handle this')
    //   }
    //   // idk = relativeBase + temp1
    //   // console.log('mode fixer 9000', idk)
    //   // console.log('all opts', { temp1, raw: args[0], fixer: idk })
    //   // console.log('relative base', relativeBase)
    //   idk = relativeBase + args[0]
    // }
    // if (idk < 0) throw Error('negative dest at op 3')
    const [ dest ] = handleModesV2(program, args, modes, relativeBase)
    return runIntCode(
      // program.with(args[0], input![0]),
      // program.with(temp1, input![0]),
      // program.with(idk, input![0]),
      program.with(dest, input![0]),
      index + pointerChange,
      input?.slice(1),
      diagnostics,
      halt,
      relativeBase,
    )
  } else if (op === 4) {
    const pointerChange = 2
    const args = [ program[index + 1] ]
    const [ output ] = handleModes(program, args, modes, relativeBase)
    diagnostics.push(output)
    if (halt) {
      return {
        program: JSON.parse(JSON.stringify(program)),
        index: index + pointerChange,
        diagnostics: JSON.parse(JSON.stringify(diagnostics))
      }
    }
    return runIntCode(program, index + pointerChange, input, diagnostics, halt, relativeBase)
  } else if (op === 5) {
    const pointerChange = 3
    const args = [ program[index + 1], program[index + 2] ]
    const [ arg1, arg2 ] = handleModes(program, args, modes, relativeBase)
    if (arg1) {
      return runIntCode(program, arg2, input, diagnostics, halt, relativeBase)
    }
    return runIntCode(program, index + pointerChange, input, diagnostics, halt, relativeBase)
  } else if (op === 6) {
    const pointerChange = 3
    const args = [ program[index + 1], program[index + 2] ]
    const [ arg1, arg2 ] = handleModes(program, args, modes, relativeBase)
    if (!arg1) {
      return runIntCode(program, arg2, input, diagnostics, halt, relativeBase)
    }
    return runIntCode(program, index + pointerChange, input, diagnostics, halt, relativeBase)
  } else if (op === 7) {
    const pointerChange = 4
    const args = [ program[index + 1], program[index + 2] ]
    // const [ arg1, arg2 ] = handleModes(program, args, modes, relativeBase)
    // const dest = program[index + 3]
    const [ arg1, arg2, dest ] = handleModesV2(program, args.concat(program[index + 3]), modes, relativeBase)
    if (dest < 0) {
      console.log(modes, dest)
      console.log(relativeBase)
      console.log(program[relativeBase + dest])
      throw Error('negative dest at op 7')
    }
    return runIntCode(
      program.with(dest, Number(arg1 < arg2)),
      index + pointerChange,
      input,
      diagnostics,
      halt,
      relativeBase,
    )
  } else if (op === 8) {
    const pointerChange = 4
    const args = [ program[index + 1], program[index + 2] ]
    // const [ arg1, arg2 ] = handleModes(program, args, modes, relativeBase)
    // const dest = program[index + 3]
    const [ arg1, arg2, dest ] = handleModesV2(program, args.concat(program[index + 3]), modes, relativeBase)
    if (dest < 0) throw Error('negative dest at op 8')
    return runIntCode(
      program.with(dest, Number(arg1 === arg2)),
      index + pointerChange,
      input,
      diagnostics,
      halt,
      relativeBase,
    )
  } else if (op === 9) {
    const pointerChange = 2
    // console.log('op code 9 modes', modes)
    const args = [ program[index + 1] ]
    const [ arg1 ] = handleModes(program, args, modes, relativeBase)
    // console.log('changing relative base', arg1, program[index + 1])
    return runIntCode(
      program,
      index + pointerChange,
      input,
      diagnostics,
      halt,
      relativeBase + arg1
      // relativeBase + program[index + 1]
    )
  }
  console.log(op)
  throw Error('something went wrong')
}

function printProgram(program: number[]) {
  program.forEach((instruction, i) => console.log(i, instruction))
}

const program = (await Bun.file(process.argv[2]).text()).split(',').map(Number)
// console.log(program)
const part1 = runIntCode(program.concat(Array(100).fill(0)), 0, [ 1 ]).diagnostics[0]
// const part1 = runIntCode(program.concat(Array(100).fill(0)), 0, [ 1 ], [], true)
console.log(part1, [ 3533056970 ].includes(part1))
// printProgram(part1.program)

