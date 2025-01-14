function fft(input: number[], pattern: number[], maxCount: number, count = 0) {
  // console.log(count)
  if (count === maxCount) return Number(input.slice(0, 8).join(''))
  const result = input.reduce((result, _, i) => {
    const digit = input.reduce((total, num, j) => {
      const patternIndex = Math.floor((j + 1) / (i + 1)) % pattern.length
      return total + ((num * pattern[patternIndex]))
    }, 0)
    return result.concat(Math.abs(digit) % 10)
  }, [] as number[])
  // console.log(count, result.join(''))
  return fft(result, pattern, maxCount, count + 1)
}

function extendInput(input: number[], times: number): number[] {
  return Array(times).fill(input).flat();
} 

// Brought to you by chatGPT
function fftOptimized(input: number[], maxCount: number) {
  for (let count = 0; count < maxCount; count++) {
    // console.log(count)
    const prefixSum = Array(input.length + 1).fill(0);
    for (let i = 0; i < input.length; i++) {
      prefixSum[i + 1] = prefixSum[i] + input[i];
    }

    const result = input.map((_, i) => {
      let sum = 0;
      let step = i + 1;
      for (let j = i; j < input.length; j += 4 * step) {
        // Add the sum of the '1' segment
        sum += prefixSum[Math.min(j + step, input.length)] - prefixSum[j];
        // Subtract the sum of the '-1' segment
        if (j + 2 * step < input.length) {
          sum -= prefixSum[Math.min(j + 3 * step, input.length)] - prefixSum[j + 2 * step];
        }
      }
      return Math.abs(sum) % 10;
    });

    input = result;
  }

  return input
  // return Number(input.slice(0, 8).join(''));
}

// Brought to you by chatGPT
function fftPart2(input: number[], maxCount: number, offset: number): number {
  input = input.slice(offset); // Only process relevant part of the input
  for (let count = 0; count < maxCount; count++) {
    let sum = 0;
    for (let i = input.length - 1; i >= 0; i--) {
      sum = (sum + input[i]) % 10;
      input[i] = sum;
    }
  }
  return Number(input.slice(0, 8).join(''));
}

const startTime = Bun.nanoseconds();
const data = (
  (await Bun.file(process.argv[2]).text())
  .split('')
  .filter(char => char !== '\n')
  .map(Number)
)

const pattern = [ 0, 1, 0, -1 ]
const part1 = fft(data, pattern, 100)
console.log(part1, [ 24176176, 73745418, 52432133, 90744714 ].includes(part1))

// Working, but I have no idea how/why these functions actually work
// fftOptimized() can also solve part2 in a reasonable amount of time
// const part1Arr = fftOptimized(data, 100)
// const part1 = Number(part1Arr.slice(0, 8).join(''))
// console.log(part1, [ 24176176, 73745418, 52432133, 90744714 ].includes(part1))
// const extendedInput = extendInput(data, 10000)
// const sliceIndex = Number(data.slice(0, 7).join(''))
// const part2 = fftPart2(extendedInput, 100, sliceIndex)
// console.log(part2, [ 82994322 ].includes(part2)) // we assume this is the correct answer, but aren't sure

console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
