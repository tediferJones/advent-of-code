import { runIntCode } from '../intCode';

const program = (await Bun.file(process.argv[2]).text()).split(',').map(Number);

const part1 = runIntCode({ program, input: [ 1 ] }).diagnostics[0];
console.log(part1, [ 3533056970 ].includes(part1));

const part2 = runIntCode({ program, input: [ 2 ] }).diagnostics[0];
console.log(part2, [ 72852 ].includes(part2));
