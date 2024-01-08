function checker(springs: string[], expectedResult: string): number {
  if (springs.includes('?')) {
    // OPTIMIZATION
    // Get every hash count up to first '?'
    // If ANY hash count EXCEPT THE LAST ONE, does not match from start of expectedResult
    // Then we can safely return 0
    // If we are looking for 1,1,3, and current pattern is 2,1 it will always be wrong
    // Similarily, if we are looking for 2,1,3 and and we have 1,1 this will also always be wrong

    // check both possibilities, '.' or '#'
    const index = springs.indexOf('?');
    return checker(springs.with(index, '.'), expectedResult) +
      checker(springs.with(index, '#'), expectedResult)
  }

  // If we get to this point the pattern is complete, see if it matches answer
  const result = springs.join('')
    .split(/\.+/)
    .filter(exists => exists)
    .map(str => str.length)
    .join()
  return result === expectedResult ? 1 : 0;
}

const total =
(await Bun.file('example.txt').text())
// (await Bun.file('inputs.txt').text())
.split(/\n/)
.filter(line => line)
.reduce((total, line) => {
  // We want to return the total number of possible combinations
  const [springs, results] = line.split(/\s+/)
  // UNFOLD
  // springs = springs * 5, seperated by ?
  // results = results * 5
  // EXAMPLE
  // .# 1 = .#?.#?.#?.#?.# 1,1,1,1,1
  const newSprings = (springs + '?').repeat(5).slice(0, -1)
  const newResults = (results + ',').repeat(5).slice(0, -1)
  // console.log(newSprings, newResults)
  // return total + checker(springs.split(''), results); // Part 1
  console.log(total)
  console.log(springs, results)
  return total + checker(newSprings.split(''), newResults); // Part 2
}, 0)
console.log(total)
console.log([21, 7402].includes(total))
