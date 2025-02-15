import { runIntCode } from '../intCode';

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
    return runIntCode({ program, input: [ phase, result ] }).diagnostics[0];
  }, 0);
}

function solvePart1(program: number[], seqSize: number) {
  return getAllSeq([ ...Array(seqSize).keys() ]).reduce((best, seq) => {
    const test = thrusterSignal(program, seq);
    return test > best ? test : best;
  }, -Infinity);
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);
const part1 = solvePart1(program, 5);
console.log(part1, [ 43210, 54321, 65210, 13848 ].includes(part1));
