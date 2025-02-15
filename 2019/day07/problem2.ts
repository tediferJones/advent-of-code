import { runIntCode } from '../intCode';
import type { ProgramState } from '../intCode';

function getAllSeq(array: number[]): number[][] {
  if (array.length === 0) return [[]];
  return array.flatMap((currentElement, index) =>
    getAllSeq([...array.slice(0, index), ...array.slice(index + 1)]).map(
      (subPermutation) => [currentElement, ...subPermutation]
    )
  );
}

function getCombos(min: number, max: number) {
  return getAllSeq([ ...Array(max - min + 1).keys() ].map(i => i + min));
}

function thrusterSignal(program: number[], seq: number[]) {
  return seq.reduce((result, phase) => {
    return runIntCode({ program, input: [ phase, result ] }).diagnostics[0];
  }, 0);
}

function solvePart1(program: number[], seqMin: number, seqMax: number) {
  return getCombos(seqMin, seqMax).reduce((best, seq) => {
    const test = thrusterSignal(program, seq);
    return test > best ? test : best;
  }, -Infinity);
}

function setupFeedbackLoop(program: number[], seq: number[]) {
  let prev: number;
  return seq.map(num => {
    const result = runIntCode({
      program,
      input: [ num, prev || 0 ],
      halt: true,
    });
    prev = result.diagnostics[result.diagnostics.length - 1];
    return result;
  });
}

function feedbackLoop(vms: Required<ProgramState>[], i = 0) {
  if (vms.every(vm => vm.done)) {
    const last = vms[vms.length - 1];
    return last.diagnostics[last.diagnostics.length - 1];
  }
  const index = i % vms.length;
  const prevIndex = index - 1 < 0 ? vms.length - 1 : index - 1;
  const prevOutput = vms[prevIndex].diagnostics.slice(-1);
  vms[index] = runIntCode({
    ...vms[index],
    input: prevOutput,
    halt: true,
  });
  return feedbackLoop(vms, i + 1);
}

function solvePart2(program: number[], seqMin: number, seqMax: number) {
  return getCombos(seqMin, seqMax).reduce((highest, seq) => {
    const thrusterValue = feedbackLoop(setupFeedbackLoop(program, seq));
    return thrusterValue > highest ? thrusterValue : highest;
  }, -Infinity);
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);

const part1 = solvePart1(program, 0, 4);
console.log(part1, [ 43210, 54321, 65210, 13848 ].includes(part1));

const part2 = solvePart2(program, 5, 9);
console.log(part2, [ 139629729, 18216, 12932154 ].includes(part2));
