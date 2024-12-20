const cache: { [key: string]: number } = {};
function patternIsValid(pattern: string, towels: string[]): number {
  if (cache[pattern] !== undefined) return cache[pattern];
  if (pattern.length === 0) return 1;
  return towels.filter(towel => pattern.slice(0, towel.length) === towel)
    .reduce((total, towel) => {
      const slicedPattern = pattern.slice(towel.length);
      const result = patternIsValid(slicedPattern, towels);
      return total + (cache[slicedPattern] = result);
    }, 0);
}

const startTime = Bun.nanoseconds();
const [ towelData, patternData ] = (
  (await Bun.file(process.argv[2]).text()).split(/\n\n/)
);

const towels = towelData.split(', ');
const patterns = patternData.split(/\n/).filter(Boolean);

const { part1, part2 } = patterns.reduce((answer, pattern) => {
  const result = patternIsValid(pattern, towels);
  answer.part1 += Number(!!result);
  answer.part2 += result;
  return answer;
}, { part1: 0, part2: 0 });

console.log(part1, [ 6, 336 ].includes(part1));
console.log(part2, [ 16, 758890600222015 ].includes(part2));
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9}`);
