function arrToNum(arr: number[], start: number, end: number) {
  return Number(arr.slice(start, end).join(''))
}

function extendInput(input: number[], times: number): number[] {
  return Array(times).fill(input).flat()
} 

function fft(input: number[], pattern: number[], maxCount: number, count = 0) {
  if (count === maxCount) return arrToNum(input, 0, 8)
  const result = input.reduce((result, _, i) => {
    const digit = input.reduce((total, num, j) => {
      const patternIndex = Math.floor((j + 1) / (i + 1)) % pattern.length
      return total + (num * pattern[patternIndex])
    }, 0)
    return result.concat(Math.abs(digit) % 10)
  }, [] as number[])
  return fft(result, pattern, maxCount, count + 1)
}

// After halfway all freqs will be 1,
// so we can just add the numbers in the list
// and subtract each num as we process it
function fftPart2(input: number[], maxCount: number, count = 0) {
  if (count === maxCount) return arrToNum(input, 0, 8)
  let total = accum(input)
  const newInput = input.map(num => {
    const newNum = total % 10
    total -= num
    return newNum
  })
  return fftPart2(newInput, maxCount, count + 1)
}

// this is faster than calling input.reduce, dont ask why
function accum(input: number[], i = 0, answer = 0) {
  if (i === input.length) return answer
  return accum(input, i + 1, answer + input[i])
}

const startTime = Bun.nanoseconds()
const data = (
  (await Bun.file(process.argv[2]).text())
  .split('')
  .filter(char => char !== '\n')
  .map(Number)
)

const pattern = [ 0, 1, 0, -1 ]
const part1 = fft(data, pattern, 100)
console.log(part1, [ 24176176, 73745418, 52432133, 90744714 ].includes(part1))

const extended = extendInput(data, 10000)
const offset = arrToNum(extended, 0, 7)
const part2 = fftPart2(extended.slice(offset), 100)
console.log(part2, [ 84462026, 78725270, 53553731, 82994322 ].includes(part2))

console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
