function part1(levels: number[]) {
  const isIncreasing = (levels[0] - levels[1]) < 0;
  return levels.slice(1).every((level, i) => {
    const rawDiff = levels[i] - level;
    if (isIncreasing ? rawDiff < 0 : rawDiff > 0) {
      const absDiff = Math.abs(rawDiff);
      return 1 <= absDiff && absDiff <= 3;
    }
  })
}

function part2(levels: number[]) {
  return part1(levels) || levels.some((_, i) => part1(levels.toSpliced(i, 1)))
}

const startTime = Bun.nanoseconds();
const answer = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(line => line)
  .reduce((safeCount, line) => {
    const levels = line.split(/\s+/).map(str => Number(str))
    return part1(levels) ? safeCount + 1 : safeCount
    // return part2(levels) ? safeCount + 1 : safeCount
  }, 0)
)

console.log(
  answer, [ 2, 213, 4, 285 ].includes(answer),
  `TIME: ${(Bun.nanoseconds() - startTime) / 10**9}`
)

// ANSWER PART 1: 213
// ANSWER PART 2: 285
