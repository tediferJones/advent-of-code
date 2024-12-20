const cache: { [key: string]: boolean }  = {}

function patternIsValid(pattern: string, towels: string[]): boolean {
  if (cache[pattern] !== undefined) return cache[pattern]
  if (pattern.length === 0) return true
  return towels
    .filter(towel => pattern.slice(0, towel.length) === towel)
    .some(towel => {
      const slicedPattern = pattern.slice(towel.length)
      const result = patternIsValid(slicedPattern, towels)
      return cache[slicedPattern] = result
    })
}

const startTime = Bun.nanoseconds();
const [ towelData, patternData ] = (await Bun.file(process.argv[2]).text())
  .split(/\n\n/)

const towels = towelData.split(', ')
const patterns = patternData.split(/\n/).filter(Boolean)

const part1 = patterns.reduce((total, pattern) => {
  return total + Number(patternIsValid(pattern, towels))
}, 0)
console.log(part1, [ 6, 336 ].includes(part1))
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9}`)
