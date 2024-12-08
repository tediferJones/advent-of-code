const operations: { [key: string]: (a: number, b: number) => number } = {
  '+': (a, b) => a + b,
  '*': (a, b) => a * b,
}

function opDfs(result: number, operands: number[]): boolean {
  return Object.keys(operations).some(opKey => {
    if (operands.length === 1) return result === operands[0]
    return opDfs(
      result,
      [ operations[opKey](operands[0], operands[1]) ].concat(operands.slice(2))
    )
  })
}

const part1Answer = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .reduce((total, line) => {
    const [ _, resultStr, operandStr ] = line.match(/(\d+): (.+)/)!
    const result = Number(resultStr)
    const operands = operandStr.split(/ /).map(Number)
    const isValid = opDfs(result, operands)
    // console.log(isValid)
    return isValid ? total + result : total
  }, 0)
)

console.log(part1Answer, [ 3749, 850435817339 ].includes(part1Answer))

// ANSWER PART 1: 850435817339
