type Data = { left: number[], right: number[] };

const data = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(line => line)
  .reduce((result, line) => {
    const [ _, left, right ] = line.match(/(\d+)\s+(\d+)/)!.map(str => Number(str));
    result.left.push(left);
    result.right.push(right);
    return result;
  }, { left: [], right: [] } as Data)
);

function part1(data: Data) {
  const [ left, right ] = [ data.left.toSorted(), data.right.toSorted() ];
  return left.reduce((total, num, i) => total + Math.abs(num - right[i]), 0);
}

function part2(data: Data) {
  const counts = data.right.reduce((counts, right) => {
    counts[right] ? counts[right] += 1 : counts[right] = 1;
    return counts
  }, {} as { [key: string]: number });
  return data.left.reduce((total, left) => total + left * (counts[left] || 0), 0);
}

const answerPart1 = part1(data);
console.log(answerPart1, [ 11, 2344935 ].includes(answerPart1));
const answerPart2 = part2(data);
console.log(answerPart2, [ 31, 27647262 ].includes(answerPart2));

// ANSWER PART 1: 2344935
// ANSWER PART 2: 27647262
