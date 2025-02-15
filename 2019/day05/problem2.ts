import { runIntCode } from '../intCode';

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);

const part1 = runIntCode({ program, input: [ 1 ] }).diagnostics.slice(-1)[0];
console.log(part1, [ 5577461 ].includes(part1));

const part2 = runIntCode({ program, input: [ 5 ] }).diagnostics[0];
console.log(part2, [ 7161591 ].includes(part2));
