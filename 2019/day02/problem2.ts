import { runIntCode } from '../intCode';

function solvePart1(program: number[]) {
  return runIntCode({ program: program.with(1, 12).with(2, 2) }).program[0];
}

function solvePart2(program: number[], output: number, noun = 0, verb = 0) {
  if (noun === 99 && verb === 99) return;
  const newProgram = program.with(1, noun).with(2, verb);
  const testOutput = runIntCode({ program: newProgram }).program[0];
  if (testOutput === output) return 100 * noun + verb;
  return solvePart2(
    program,
    output,
    verb === 99 ? noun + 1 : noun,
    verb === 99 ? 0 : verb + 1,
  );
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);

const part1 = solvePart1(program);
console.log(part1, [ 3058646 ].includes(part1));

const part2 = solvePart2(program, 19690720)!;
console.log(part2, [ 8976 ].includes(part2));
