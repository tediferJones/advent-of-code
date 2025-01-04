import runIntCode from '../intCode'

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

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number)
const part1 = testCombos(program, 5).val
console.log(part1, [ 43210, 54321, 65210, 13848 ].includes(part1))
