function getHashGroups(springs: string[]) {
  return springs.join('')
    .split(/\.+/)
    .filter(exists => exists)
    .map(str => str.length)
}
// console.log(getHashGroups('.#..........#......###...'.split('')))

function checker(springs: string[], expectedResult: string): number {
  if (springs.includes('?')) {
    // OPTIMIZATION
    // Get every hash count up to first '?'
    // If ANY hash count EXCEPT THE LAST ONE, does not match from start of expectedResult
    // Then we can safely return 0
    // If we are looking for 1,1,3, and current pattern is 2,1 it will always be wrong
    // Similarily, if we are looking for 2,1,3 and and we have 1,1 this will also always be wrong
    const index = springs.indexOf('?');
    const expectedTest = expectedResult.split(',')
    // const test = springs[index + 1] === '.' ? Infinity : -1

    // Kinda works?
    // const test = '.?'.includes(springs[index + 1]) ? -1 : Infinity
    const tester = '.?'.includes(springs[index + 1])

    // const failed = !getHashGroups(springs.slice(0, index))
    // const failed = !getHashGroups(springs.slice(0, '.?'.includes(springs[index + 1]) ? index + 1 : index))
    const failed = !getHashGroups(springs.slice(0, tester ? index + 1 : index))
      .slice(0, -1).every((count, i) => count === Number(expectedTest[i]))
      // .slice(0, test).every((count, i) => count === Number(expectedTest[i]))
      // .slice(0, tester ? -1 : Infinity).every((count, i) => count === Number(expectedTest[i]))

    if (failed) return 0

    // check both possibilities, '.' or '#'
    return checker(springs.with(index, '.'), expectedResult) +
      checker(springs.with(index, '#'), expectedResult)
  }

  // If we get to this point the pattern is complete, see if it matches answer
  return getHashGroups(springs).join() === expectedResult ? 1 : 0;
}

// There will be times when you dont need to try both branches (i.e. test for '.' and '#')
// But what are the rules that will dictate when a '?' must be '.' or a '#'
// If the previous char is # and that grouping is complete, then it must be a '.'
// If the previous char is # and the grouping is not complete, then it must be a '#'

// Alternatively, try the approach where we make the string and
// expected results shorter and shorter until one or both is empty
// If both are empty, then it should be valid
// If string is empty but expected result is not, its not valid
// If expected result is empty, rest of the string must be '.'
// Then use memoization to track old results
// This allows us to look up answers instead of re-processing the same patterns

const total = (
  (await Bun.file('example.txt').text())
  // (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .reduce((total, line) => {
    // We want to return the total number of possible combinations
    const [springs, results] = line.split(/\s+/)
    // return total + checker(springs.split(''), results); // Part 1

    // UNFOLD
    // springs = springs * 5, seperated by ?
    // results = results * 5
    // EXAMPLE
    // .# 1 = .#?.#?.#?.#?.# 1,1,1,1,1
    const newSprings = (springs + '?').repeat(5).slice(0, -1)
    const newResults = (results + ',').repeat(5).slice(0, -1)
    // console.log(newSprings, newResults)
    console.log(total)
    console.log(springs, results)
    // return 0
    const startTime = Date.now();
    const combos = checker(newSprings.split(''), newResults)
    const endTime = Date.now();
    console.log(`Time for this string is ${(endTime - startTime) / 1000} seconds`)
    return total + combos; // Part 2
  }, 0)
)
console.log(total)
console.log([21, 7402, 525152].includes(total))
