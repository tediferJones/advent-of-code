function handleModes(program: number[], args: number[], modes: number[]) {
  return args.map((arg, i) => {
    if (modes[i] === 1) return arg
    return program[arg]
  })
}

export default function runIntCode(
  program: number[],
  index = 0,
  input?: number[],
  diagnostics: number[] = [],
  halt?: boolean
) {
  const op = Number(program[index].toString().slice(-2))
  const modes = program[index].toString().slice(0, -2).split('').toReversed().map(Number)
  if (op === 99) {
    return { program, diagnostics, halted: true }
  } else if (op === 1) {
    const pointerChange = 4
    const args = [ program[index + 1], program[index + 2] ]
    const dest = program[index + 3]
    const [ temp1, temp2 ] = handleModes(program, args, modes)
    return runIntCode(
      program.with(dest, temp1 + temp2),
      index + pointerChange,
      input,
      diagnostics,
      halt,
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
      diagnostics,
      halt
    )
  } else if (op === 3) {
    // should probably use handleModes here, 
    // but on the other hand, destinations are always in position mode
    // and since there is only one arg which is the destination, we're good???
    const pointerChange = 2
    const args = [ program[index + 1] ]
    return runIntCode(
      program.with(args[0], input![0]),
      index + pointerChange,
      input?.slice(1),
      diagnostics,
      halt
    )
  } else if (op === 4) {
    const pointerChange = 2
    const args = [ program[index + 1] ]
    const output = handleModes(program, args, modes)[0]
    diagnostics.push(output)
    if (halt) {
      return {
        program: JSON.parse(JSON.stringify(program)),
        // index,
        index: index + pointerChange,
        diagnostics: JSON.parse(JSON.stringify(diagnostics))
      }
    }
    return runIntCode(program, index + pointerChange, input, diagnostics, halt)
  } else if (op === 5) {
    const pointerChange = 3
    const args = [ program[index + 1], program[index + 2] ]
    const [ arg1, arg2 ] = handleModes(program, args, modes)
    if (arg1) {
      return runIntCode(program, arg2, input, diagnostics, halt)
    }
    return runIntCode(program, index + pointerChange, input, diagnostics, halt)
  } else if (op === 6) {
    const pointerChange = 3
    const args = [ program[index + 1], program[index + 2] ]
    const [ arg1, arg2 ] = handleModes(program, args, modes)
    if (!arg1) {
      return runIntCode(program, arg2, input, diagnostics, halt)
    }
    return runIntCode(program, index + pointerChange, input, diagnostics, halt)
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
      halt
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
      halt
    )
  }
  console.log(op)
  throw Error('something went wrong')
}

type BestCombo = { seq: number[], val: number }

function getAllSeq(array: number[]): number[][] {
  if (array.length === 0) return [[]];
  return array.flatMap((currentElement, index) =>
    getAllSeq([...array.slice(0, index), ...array.slice(index + 1)]).map(
      (subPermutation) => [currentElement, ...subPermutation]
    )
  );
}

function thrusterSignal(program: number[], seq: number[]) {
  return seq.reduce((result, phase) => {
    return runIntCode(program, 0, [ phase, result ]).diagnostics[0]
  }, 0)
}

function testCombos(program: number[], seqSize: number) {
  const allSeq = getAllSeq([ ...Array(seqSize).keys() ])
  return allSeq.reduce((best, seq) => {
    const test = thrusterSignal(program, seq)
    if (test > best.val) {
      best.val = test;
      best.seq = seq;
    }
    return best
  }, { seq: [], val: -Infinity } as BestCombo)
}

// ask stupid questions get stupid answers
function feedbackLoop(program: number[], vms: any[], answer?: number, setup?: true) {
  if (answer !== undefined) return answer

  if (setup) {
    let prev: number;
    vms = vms.map(num => {
      const result = runIntCode(program, 0, [ num, prev || 0 ], [], true)
      prev = result.diagnostics[result.diagnostics.length - 1]
      return result
    })
    return feedbackLoop(program, vms, answer)
  }

  vms = vms.map((output, i) => {
    const prevIndex = i - 1 < 0 ? vms.length - 1 : i - 1
    const prev = vms[prevIndex]
    const result = runIntCode(
      output.program,
      output.index,
      [ prev.diagnostics[prev.diagnostics.length - 1] ],
      output.diagnostics,
      true
    )
    if (i === 4 && result.halted) {
      answer = result.diagnostics[result.diagnostics.length - 1]
    }
    return result
  })
  return feedbackLoop(program, vms, answer)
}

function solvePart2(program: number[], seqMin: number, seqMax: number) {
  const allSeq = getAllSeq([ ...Array(seqMax - seqMin + 1).keys() ].map(i => i + seqMin));
  return allSeq.reduce((highest, seq) => {
    const thrusterValue = feedbackLoop(program, seq, undefined, true);
    return thrusterValue > highest ? thrusterValue : highest;
  }, -Infinity);
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number)

const part1 = testCombos(program, 5).val
console.log(part1, [ 43210, 54321, 65210, 13848 ].includes(part1))

const part2 = solvePart2(program, 5, 9)
console.log(part2, [ 139629729, 18216, 12932154 ].includes(part2))
