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

function trimDots(springs: string[]) {
  // Remove dots at beginning and end
  // If there are repeated series of dots, remove them
  while (springs[0] === '.') {
    springs.splice(0, 1)
  }
  while (springs[springs.length - 1] === '.') {
    springs.splice(springs.length - 1)
  }
  for (let i = 0; i < springs.length; i++) {
    while (springs[i] === '.' && springs[i + 1] === '.') {
      springs.splice(i, 1)
    }
  }
  return springs
}
// console.log(trimDots('....#.....#.....?.........'.split('')))

function checkerV2(springs: string[], groups: number[], cache = {}): number {
  // console.log('########')
  const char = springs[0];
  // console.log('BEFORE NEW GROUPS')
  // console.log(springs, groups)
  // if (groups.length === 0) return 0
  const newGroups = groups[0] === 0 ? groups.slice(1) : groups.with(0, groups[0] - 1);
  // console.log(springs, groups, newGroups)
  // if (groups.length === 1 && groups[0] === 0 && !springs.includes('#?')) {
  // if (newGroups.length === 1 && newGroups[0] === 0 && !springs.includes('#?')) {
  //   console.log('success')
  //   return 1
  // }
  // let newGroups = groups.with(0, groups[0] - 1)
  // if (newGroups[0] === 0 && '.?'.includes(springs[1])) {
  //   // console.log('TRIMMING GROUPS')
  //   newGroups = newGroups.slice(1)
  // }
  if (newGroups[0] === 0 && !'?.'.includes(springs[1])) {
    // console.log('failed')
    return 0
  }
  if (char === '?') {
    // console.log('CHECKING BOTH')
    return checkerV2(springs.slice(1), groups, cache) +
      checkerV2(springs.slice(1), newGroups, cache)
  }
  if (char === '#') {
    // console.log('FOUND HASH, use new groups')
    return checkerV2(springs.slice(1), newGroups, cache)
  }
  if (char === '.') {
    // console.log('FOUND DOT, use old groups')
    return checkerV2(springs.slice(1), groups, cache)
  }
  // console.log('MEETS NO CONDITIONS')
  // console.log('failed')
  return 1
}
// console.log(checkerV2(trimDots('.??..??...?##.'.split('')), '1,1,3'.split(',').map(str => Number(str))))

// function checkerV3(springs: string[], groups: number[], cache = {}): number {
function checkerV3(
  springs: string[],
  groups: number[],
  cache = {},
  pattern = '',
): number {
  // if (springs.length === 0 && groups.length === 1 && groups[0] === 0) {
  //   console.log('success', springs, groups)
  //   return 1
  // }
  const char = springs[0]
  // const newGroups = groups[0] === 0 ? groups.slice(1) : groups.with(0, groups[0] - 1);
  console.log(springs, groups, char)
  // console.log(char)
  // if (groups[0] === 0 && char !== '.') {
  if (groups[0] === 0 && char === '#') {
    console.log('failed, grouping not seperated')
    return 0
  }
  // if (groups[0] < 0) {
  //   return 0
  // }
  if (char === '?') {
    // First branch will be treated as a dot
    // Second branch will be treated as a hash
    // console.log('BRANCHING')

    // const newGroupsForDot = groups[0] === 0 ? groups.slice(1) : groups
    // const first = checkerV3(springs.slice(1), newGroupsForDot, cache)

    // BEST SO FAR
    const newGroups = groups[0] === 0 ? groups.slice(1) : groups.with(0, groups[0] - 1)
    // console.log(groups)
    const newGroupsForDot = groups[0] === 1 ? groups.slice(1) : groups.with(0, groups[0] - 1)
    // const hash = checkerV3(springs.slice(1), newGroupsForDot, cache, pattern.concat('.'))
    console.log('groups if it is a hash', groups, newGroupsForDot)
    const dot = checkerV3(springs.slice(1), groups, cache, pattern.concat('.'))
    const hash = checkerV3(springs.slice(1), newGroups, cache, pattern.concat('#'))
    return hash + dot

    // return first + second
    // return checkerV3(springs.slice(1), groups, cache) +
      // checkerV3(springs.slice(1), newGroups, cache)


    // TESTING
    // console.log('branching')
    // let [dot, hash] = [0, 0]
    // // if it can be a hash, assign hash
    // if (groups[0] === 0) {
    //   console.log('treat it as a dot', pattern)
    //   dot = checkerV3(springs.slice(1), groups, cache, pattern.concat('.'))
    // }
    // if (groups[0] > 0) {
    //   console.log('treat it as a hash', pattern)
    //   hash = checkerV3(springs.slice(1), newGroups, cache, pattern.concat('#'))
    // }
    // return dot + hash
  }
  if (char === '#') {
    // if (groups[0] === 1 && springs[1] === '#') {
    //   console.log('also failed on hash')
    //   return 0
    // }
    // return checkerV3(springs.slice(1), newGroups, cache);
    // console.log(groups)
    return checkerV3(springs.slice(1), groups.with(0, groups[0] - 1), cache, pattern.concat(char));
  }
  if (char === '.') {
    // if (groups[0] === 0) {
    //   // return checkerV3(springs.slice(1), newGroups, cache);
    //   return checkerV3(springs.slice(1), groups.slice(1), cache);
    // }
    // console.log('failed on dot')
    // return 0
    // const newGroups = groups[0] === 0 ? groups.slice(1) : groups.with(0, groups[0] - 1)
    const newGroups = groups[0] === 0 ? groups.slice(1) : groups
    return checkerV3(springs.slice(1), newGroups, cache, pattern.concat(char));
  }

  // console.log('probably should never make it this far')

  // console.log(springs, groups, char)
  // if (springs.length === 0 && groups.length === 1 && groups[0] === 0) {
  // }
  if (groups[0] > 0) {
    console.log('failed, end of springs but didnt find enough hashes')
    return 0
  }
  console.log('passes all tests')
  console.log(pattern)
  return 1
}

const total = (
  (await Bun.file('example.txt').text())
  // (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  // .reduce((total, line) => {
  .every((line, i) => {
    // We want to return the total number of possible combinations
    const [springs, groups] = line.split(/\s+/)
    // return total + checker(springs.split(''), results); // Part 1
    // console.log(springs)
    // console.log(trimDots(springs.split('')), groups.split(',').map(str => Number(str)))
    // return 0
    if (i < 1) return true
    console.log(springs)
    const test = checkerV3(trimDots(springs.split('')), groups.split(',').map(str => Number(str)))
    // console.log(test)
    // console.log(trimDots(springs.split('')).join(''))
    // console.log(checkerV2(springs.split(''), groups.split(',').map(str => Number(str)));
    console.log('result', test)
    return 0
    return total + test

    // const newSprings = (springs + '?').repeat(5).slice(0, -1)
    // const newResults = (results + ',').repeat(5).slice(0, -1)
    // console.log(total)
    // console.log(springs, results)
    // const startTime = Date.now();
    // const combos = checker(newSprings.split(''), newResults)
    // const endTime = Date.now();
    // console.log(`Time for this string is ${(endTime - startTime) / 1000} seconds`)
    // return total + combos; // Part 2
  }, 0)
)
console.log(total)
console.log([21, 7402, 525152].includes(total))
