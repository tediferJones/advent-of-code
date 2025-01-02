function handleModes(program: number[], args: number[], modes: number[]) {
  return args.map((arg, i) => {
    if (modes[i] === 1) return arg
    return program[arg]
  })
}

export default function runIntCode(program: number[], index = 0, input?: number, diagnostics: number[] = []) {
  const op = Number(program[index].toString().slice(-2))
  const modes = program[index].toString().slice(0, -2).split('').toReversed().map(Number)
  if (op === 99) {
    return { program, diagnostics }
  } else if (op === 1) {
    const pointerChange = 4
    const args = [ program[index + 1], program[index + 2] ]
    const dest = program[index + 3]
    const [ temp1, temp2 ] = handleModes(program, args, modes)
    return runIntCode(
      program.with(dest, temp1 + temp2),
      index + pointerChange,
      input,
      diagnostics
    )
  } else if (op === 2) {
    const pointerChange = 4
    const args = [ program[index + 1], program[index + 2] ]
    const dest = program[index + 3]
    const [ temp1, temp2 ] = handleModes(program, args, modes)
    return runIntCode(
      program.with(dest, temp1 * temp2),
      index + pointerChange,
      input,
      diagnostics
    )
  } else if (op === 3) {
    // should probably use handleModes here, 
    // but on the other hand, destinations are always in position mode
    // and since there is only one arg which is the destination, we're good???
    const pointerChange = 2
    const args = [ program[index + 1] ]
    return runIntCode(
      program.with(args[0], input!),
      index + pointerChange,
      input,
      diagnostics,
    )
  } else if (op === 4) {
    const pointerChange = 2
    const args = [ program[index + 1] ]
    diagnostics.push(handleModes(program, args, modes)[0])
    return runIntCode(program, index + pointerChange, input, diagnostics)
  } else if (op === 5) {
    const pointerChange = 3
    const args = [ program[index + 1], program[index + 2] ]
    const [ arg1, arg2 ] = handleModes(program, args, modes)
    if (arg1) {
      return runIntCode(program, arg2, input, diagnostics)
    }
    return runIntCode(program, index + pointerChange, input, diagnostics)
  } else if (op === 6) {
    const pointerChange = 3
    const args = [ program[index + 1], program[index + 2] ]
    const [ arg1, arg2 ] = handleModes(program, args, modes)
    if (!arg1) {
      return runIntCode(program, arg2, input, diagnostics)
    }
    return runIntCode(program, index + pointerChange, input, diagnostics)
  } else if (op === 7) {
    const pointerChange = 4
    const args = [ program[index + 1], program[index + 2] ]
    const [ arg1, arg2 ] = handleModes(program, args, modes)
    const dest = program[index + 3]
    return runIntCode(
      program.with(dest, Number(arg1 < arg2)),
      index + pointerChange,
      input,
      diagnostics,
    )
  } else if (op === 8) {
    const pointerChange = 4
    const args = [ program[index + 1], program[index + 2] ]
    const [ arg1, arg2 ] = handleModes(program, args, modes)
    const dest = program[index + 3]
    return runIntCode(
      program.with(dest, Number(arg1 === arg2)),
      index + pointerChange,
      input,
      diagnostics,
    )
  }
  console.log(op)
  throw Error('something went wrong')
}
