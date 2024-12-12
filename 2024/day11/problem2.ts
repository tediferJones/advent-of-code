const cache: { [key: string]: number } = {};

function blinkDfs(stone: number, maxCount: number, count = 0): number {
  const key = `${stone},${maxCount - count}`;
  if (cache[key]) return cache[key];
  if (count === maxCount) return 1;
  if (stone === 0) return cache[key] = blinkDfs(1, maxCount, count + 1);
  const str = stone.toString();
  if (str.length % 2 === 0) {
    const middle = str.length / 2;
    return cache[key] = (
      blinkDfs(Number(str.slice(0, middle)), maxCount, count + 1) +
      blinkDfs(Number(str.slice(middle)), maxCount, count + 1)
    );
  }
  return cache[key] = blinkDfs(stone * 2024, maxCount, count + 1);
}

const startTime = Bun.nanoseconds();
const stones = (
  (await Bun.file(process.argv[2]).text())
  .split(/\s+/)
  .filter(Boolean)
  .map(Number)
);

const answerPart1 = stones.reduce((total, stone) => total + blinkDfs(stone, 25, 0), 0);
const answerPart2 = stones.reduce((total, stone) => total + blinkDfs(stone, 75, 0), 0);
console.log(answerPart1, [ 55312, 199753 ].includes(answerPart1));
console.log(answerPart2, [ 239413123020116 ].includes(answerPart2));
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`);
