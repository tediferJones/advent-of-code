type Data = { left: number[], right: number[] };

const data = (
  // (await Bun.file('example.txt').text())
  (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .reduce((result, line) => {
    const [ _, left, right ] = line.match(/(\d+)\s+(\d+)/)!.map(str => Number(str))
    result.left.push(left)
    result.right.push(right)
    return result
  }, { left: [], right: [] } as Data)
)

data.left.sort()
data.right.sort()

const answer = data.left.reduce((total, num, i) => {
  return total + Math.abs(num - data.right[i])
}, 0)

console.log(answer)

// ANSWER PART 1: 2344935
