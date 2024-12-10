function reformat(data: string[]) {
  return data.reduce((result, char, i) => {
    return result.concat(
      Array(Number(char)).fill((i % 2 === 0 ? i / 2 : '.').toString())
    )
  }, [] as string[])
}

function compactPart1(formatted: string[]) {
  const firstEmpty = formatted.findIndex(char => char === '.')
  const lastUsed = formatted.findLastIndex(char => char !== '.')
  if (firstEmpty > lastUsed) return formatted
  
  formatted[firstEmpty] = formatted[lastUsed]
  formatted[lastUsed] = '.'
  return compactPart1(formatted)
}

function checksum(compacted: string[]) {
  return compacted.reduce((checksum, char, i) => {
    return char === '.' ? checksum : checksum + Number(char) * i
  }, 0)
}

function findFitIndex(
  formatted: string[],
  length: number,
  maxIndex: number,
  start = formatted.findIndex(char => char === '.')
) {
  if (start >= maxIndex) return
  const slice = formatted.slice(start, start + length)
  if (slice.every(char => char === '.')) return start
  return findFitIndex(
    formatted,
    length,
    maxIndex,
    start + slice.findIndex(char => char !== '.') + 1
  )
}

function compactPart2(formatted: string[], skipId = new Set<string>()) {
  const lastUsed = formatted.findLastIndex(char => char !== '.' && !skipId.has(char))
  if (lastUsed === -1) return formatted
  const id = formatted[lastUsed]
  const startOfUsed = formatted.findIndex(char => char === id)
  const usedLength = lastUsed - startOfUsed + 1
  const firstEmpty = findFitIndex(formatted, usedLength, startOfUsed)
  skipId.add(id)
  if (firstEmpty) {
    // file can be moved
    [ ...Array(usedLength).keys() ].forEach(i => {
      formatted[firstEmpty + i] = id
      formatted[lastUsed - i] = '.'
    });
  }
  // file cannot be moved
  return compactPart2(formatted, skipId)
}

const data = (
  (await Bun.file(process.argv[2]).text())
  .split('')
  .filter(char => char !== '\n')
)

const startTime = Bun.nanoseconds()
const part1Answer = checksum(compactPart1(reformat(data)))
const part2Answer = checksum(compactPart2(reformat(data)))
console.log(part1Answer, [ 1928, 60, 6378826667552 ].includes(part1Answer))
console.log(part2Answer, [ 2858, 132, 6413328569890 ].includes(part2Answer))
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)

// ANSWER PART 1: 6378826667552
// ANSWER PART 2: 6413328569890
