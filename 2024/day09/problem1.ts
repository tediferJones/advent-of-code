function reformat(data: string[]) {
  return data.reduce((result, char, i) => {
    return result.concat(
      Array(Number(char)).fill((i % 2 === 0 ? i / 2 : '.').toString())
    )
  }, [] as string[])
}

function compact(formatted: string[]) {
  const firstEmpty = formatted.findIndex(char => char === '.')
  const lastUsed = formatted.findLastIndex(char => char !== '.')
  if (firstEmpty > lastUsed) return formatted
  
  formatted[firstEmpty] = formatted[lastUsed]
  formatted[lastUsed] = '.'
  return compact(formatted)
}

function checksum(compacted: string[]) {
  return compacted.reduce((checksum, char, i) => {
    if (char === '.') return checksum
    return checksum + (Number(char) * i)
  }, 0)
}

const data = (
  (await Bun.file(process.argv[2]).text())
  .split('')
  .filter(char => char !== '\n')
)

const startTime = Bun.nanoseconds()
// console.log('original', data)
const formatted = reformat(data);
// console.log('formatted', formatted)
const compacted = compact(formatted);
// console.log('compacted', compacted)
const answer = checksum(compacted);
console.log(answer, [ 1928, 6378826667552 ].includes(answer))
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)

// ANSWER PART 1: 6378826667552
