import runIntCode from '../intCode'

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number)
const part1 = runIntCode(program, 0, 1).diagnostics.slice(-1)[0]
console.log(part1, part1 === 5577461)
