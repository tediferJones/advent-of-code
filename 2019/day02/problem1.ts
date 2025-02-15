import { runIntCode } from '../intCode';

function solvePart1(program: number[]) {
  return runIntCode({ program: program.with(1, 12).with(2, 2) }).program[0];
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);

const part1 = solvePart1(program);
console.log(part1, [ 3058646 ].includes(part1));
