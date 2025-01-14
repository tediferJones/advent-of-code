function getPattern(pattern: number[], i: number) {
  return pattern.reduce((result, num) => {
    return result.concat(Array(i + 1).fill(num))
  }, [] as number[])
}

function fft(input: number[], pattern: number[], maxCount: number, count = 0) {
  if (count === maxCount) return Number(input.slice(0, 8).join(''))
  const result = input.reduce((result, num, i) => {
    const extPattern = getPattern(pattern, i)
    const digit = input.reduce((total, num, j) => {
      return total + (num * extPattern[(j + 1) % extPattern.length])
    }, 0)
    return result.concat(Math.abs(digit) % 10)
  }, [] as number[])
  return fft(result, pattern, maxCount, count + 1)
}

const data = (
  (await Bun.file(process.argv[2]).text())
  .split('')
  .filter(char => char !== '\n')
  .map(Number)
)

const pattern = [ 0, 1, 0, -1 ]
const part1 = fft(data, pattern, 100)
console.log(part1, [ 24176176, 73745418, 52432133 ].includes(part1))
