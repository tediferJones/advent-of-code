type OpFunc = (a: number, b: number) => number;

const part1Funcs: OpFunc[] = [ (a, b) => a + b, (a, b) => a * b ];
const part2Funcs = part1Funcs.concat((a, b) => Number(a.toString() + b.toString()));

function operationDfs(result: number, operands: number[], funcs: OpFunc[]): boolean {
  return funcs.some(func => {
    if (operands[0] > result || operands.length === 1) return result === operands[0];
    const temp = func(operands[0], operands[1]);
    return operationDfs(result, [ temp ].concat(operands.slice(2)), funcs);
  });
}

const startTime = Bun.nanoseconds();
const answer = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .reduce(({ part1, part2 }, line) => {
    const [ result, ...operands ] = line.match(/\d+/g)!.map(Number);
    if (operationDfs(result, operands, part1Funcs)) part1 += result;
    if (operationDfs(result, operands, part2Funcs)) part2 += result;
    return { part1, part2 };
  }, { part1: 0, part2: 0 })
);

console.log(answer.part1, [ 3749, 850435817339 ].includes(answer.part1));
console.log(answer.part2, [ 11387, 104824810233437 ].includes(answer.part2));
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`);

// ANSWER PART 1: 850435817339
// ANSWER PART 2: 104824810233437
