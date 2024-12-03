let state: null | boolean = null;
const counts: number[] = [];
console.log(
  'ANSWER:',
  (await Bun.file(process.argv[2]).text())
    .split(/\n/)
    .filter(line => line)
    .reduce((safeCount, line) => {
      const levels = line.split(/\s+/).map(str => Number(str));
      const isIncreasing = (levels[0] - levels[1]) < 0;
      const isSafe = levels.every((level, i) => {
        if (!levels[i + 1]) return true;
        const rawDiff = level - levels[i + 1];
        if (isIncreasing ? rawDiff > 0 : rawDiff < 0) return false ;
        const absDiff = Math.abs(rawDiff);
        return 1 <= absDiff && absDiff <= 3;
      })
      console.log(levels, isSafe)
      if (state === isSafe) {
        counts[counts.length - 1]++
      } else {
        state = isSafe
        counts.push(1)
      }
      return isSafe ? safeCount + 1 : safeCount;
    }, 0)
);
console.log(counts)

// ANSWER PART 1: 213
