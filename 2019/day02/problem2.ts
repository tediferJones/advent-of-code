const ops: Record<number, ((a: number, b: number) => number)> = {
  1: (a, b) => a + b,
  2: (a, b) => a * b,
}

function run(program: number[], count = 0) {
  const [ op, i1, i2, dest ] = program.slice(count * 4, (count * 4) + 4);
  if (op === 99) return program;
  const result = ops[op](program[i1], program[i2]);
  return run(program.with(dest, result), count + 1);
}

function findOutput(program: number[], output: number, noun = 0, verb = 0) {
  if (noun === 99 && verb === 99) return;
  const testOutput = run(program.with(1, noun).with(2, verb))[0];
  if (testOutput === output) return 100 * noun + verb;
  return findOutput(
    program,
    output,
    verb === 99 ? noun + 1 : noun,
    verb === 99 ? 0 : verb + 1
  );
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);

const part1 = run(program.with(1, 12).with(2, 2))[0];
console.log(part1, [ 3058646 ].includes(part1));

const part2 = findOutput(program, 19690720)!;
console.log(part2, [ 8976 ].includes(part2));
