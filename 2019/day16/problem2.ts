function arrToNum(arr: number[], start: number, end: number) {
  return Number(arr.slice(start, end).join(''))
}

function extendInput(input: number[], times: number): number[] {
  return Array(times).fill(input).flat()
} 

function accumWithStep(input: number[], step: number, total = 0, isPositive = true) {
  if (!input.length) return Math.abs(total) % 10
  const seqTotal = input.slice(0, step).reduce((total, num) => total + num, 0)
  return accumWithStep(
    input.slice(step * 2),
    step,
    total + seqTotal * (isPositive ? 1 : -1),
    !isPositive
  )
}

function fft(input: number[], maxCount: number, count = 0) {
  if (count === maxCount) return arrToNum(input, 0, 8)
  return fft(
    input.reduce((newDigits, _, i) => {
      return newDigits.concat(accumWithStep(input.slice(i), i + 1))
    }, [] as number[]),
    maxCount,
    count + 1
  )
}

// After halfway all frequencies will be 1,
// so we can just accumulate the numbers in the list
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

const part1 = fft(data, 100)
console.log(part1, [ 24176176, 73745418, 52432133, 90744714 ].includes(part1))

const extended = extendInput(data, 10000)
const offset = arrToNum(extended, 0, 7)
const part2 = fftPart2(extended.slice(offset), 100)
console.log(part2, [ 84462026, 78725270, 53553731, 82994322 ].includes(part2))

console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
