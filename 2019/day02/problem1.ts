const ops: Record<number, ((a: number, b: number) => number)> = {
  1: (a, b) => a + b,
  2: (a, b) => a * b,
}

function run(program: number[], count = 0) {
  const [ op, i1, i2, dest ] = program.slice(count * 4, (count * 4) + 4);
  if (op === 99) return program;
  program[dest] = ops[op](program[i1], program[i2]);
  return run(program, count + 1);
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);
if (process.argv[2] !== 'example.txt') {
  program[1] = 12;
  program[2] = 2;
}

const part1 = run(program)[0];
console.log(part1, [ 3058646 ].includes(part1));
