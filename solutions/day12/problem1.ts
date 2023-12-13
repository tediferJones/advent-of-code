function getUnknownIndices(row: string[]) {
  return row
    .map((spring, i) => spring === '?' ? i : -1)
    .filter((spring) => spring > -1)
}
// console.log(getUnknownIndices('???.###'.split('')))

function removeUsed(row: string[], finalPattern: number[]) {
  // Springs is an array of chars
  // If known bad starts with one
}

function checkAround(str: string[], i: num) {

}

function isValid(
  row: string[], 
  finalPattern: number[], 
  strIndex: number = 0, 
  badIndex: number = 0,
  counter: number = 0
) {
  // Check if the groups are correct
  // console.log('checking', strIndex)
  // console.log('string', row)
  if (counter === finalPattern[badIndex]) {
    // console.log('FINISHED SEQUENCE', ' at string index ', strIndex)
    counter = 0;
    badIndex++
  }
  // console.log('final pos', badIndex)
  if (badIndex === finalPattern.length) {
    // console.log('THIS IS VALID: ', row, finalPattern)
    return true
  }
  if (badIndex === Infinity) {
    return false;
  }
  if (strIndex < row.length && badIndex < finalPattern.length) {
    // if (row[strIndex] === '#') {
    // console.log('checking char', row[strIndex])
    if (row[strIndex] === '#' && (() => {
      const [prev, next] = [row[strIndex - 1], row[strIndex + 1]];
      // console.log('CHECKING SURROUNDING CHARACTERS')
      // console.log(prev, next)
      // console.log(counter + 1, ' of ', finalPattern[badIndex])
      if (0 < counter && counter + 1 < finalPattern[badIndex]) {
        // console.log('mid')
        // return next === '#' && prev === '#'
        if (next === '#' && prev === '#') {
          return true
        } else {
          return badIndex = Infinity;
        }
      }
      if (counter === 0) {
        // console.log('start',
        //   (prev === undefined || prev === '.'),
        //   (finalPattern[badIndex] > 1 ? next === '#' : true)
        // )
        // return (prev === undefined || prev === '.') && 
        //   (finalPattern[badIndex] > 1 ? next === '#' : true)
        if (
          (prev === undefined || prev === '.') && 
            (finalPattern[badIndex] > 1 ? next === '#' : true)
        ) {
          return true
        } else {
          return badIndex = Infinity
        }
      }
      if (counter + 1 === finalPattern[badIndex]) {
        // console.log('end')
        // return (next === undefined || next === '.') && 
        //   (finalPattern[badIndex] > 1 ? prev === '#' : true)
        if (
          (next === undefined || next === '.') && 
            (finalPattern[badIndex] > 1 ? prev === '#' : true)
        ) {
          return true
        } else {
          return  badIndex = Infinity
        }
      }
      // console.log('FALSE')
      return false
    })()) {
      counter++
      // return isValid(row, finalPattern, strIndex, badIndex, counter)
    }
    strIndex++
    return isValid(row, finalPattern, strIndex, badIndex, counter)
  }
  return false
}

// idk maybe
function generateCombinations(arr: number[]) {
  let result: number[][] = [];

  function helper(current: any, index: any) {
    if (index === arr.length) {
      result.push(current);
      return;
    }

    helper(current.concat(arr[index]), index + 1);
    helper(current, index + 1);
  }

  helper([], 0);
  return result.filter(arr => arr.length);
}

// Example usage:
// const inputArray = [1, 2, 3];
// const allCombinations = generateCombinations(inputArray);
// console.log(allCombinations);


const string = '#.#.###'.split('');
// const string = '???.###'.split('');
const pattern = '1,1,3'.split(',').map(str => Number(str))
// console.log(string.join(''), pattern)
console.log(
  isValid(string, pattern)
)
// console.log(getUnknownIndices(string))

// If the pattern checker works
// We just need a funtion to generate every possible string combo
// ITS A TRIPLE LEVEL FOR LOOP
// [1,2,3]
//

function recCopy(str: string[], arr: number[], i: number = 0): string[] {
  // console.log('COPYING')
  // console.log(arr, i, str.join(''))
  return i < arr.length - 1 ? 
    recCopy(str.with(arr[i], '#'), arr, ++i) :
    str.with(arr[i], '#')
}
// console.log('REC COPY')
// console.log(recCopy('abcdefg'.split(''), [0,2,3,4,5], 0))

function getAllCombos(row: string[], finalPattern: number[]) {
  const unknowns = getUnknownIndices(row)
  // console.log(row.join(''))
  // console.log('unknown indices', unknowns)
  // console.log('final pattern', finalPattern)
  const combos = generateCombinations(unknowns)
  console.log(row.join(''))
  // console.log(combos)
  let total = 0;
  combos.forEach(combo => {
    // console.log('#################################')
    const copy = recCopy(row, combo).map(char => char === '?' ? '.' : char);
    const validity = isValid(copy, finalPattern)
    // console.log(combo)
    // console.log(copy)
    // console.log(validity)
    if (validity) {
      // console.log('THAT SHIT IS VALID')
      total++
    }
    // return true
  })
  // console.log(total)
  return total
  // const needsChecked = removeUsed(row, finalPattern)
  // const test = isValid(row, finalPattern)
  // console.log(test)
  // Trim away things that already used
  // i.e. first example has 3 at the end, but all 3 are already used


  // JUST RUN EVERY POSSIBLE COMBO
  // Get possible indices, put a # at every position in every combo
  // Check each one, count the ones that are valid
}

// Can we just brute force and run every possible combo?

// SPRINGS
// . = working
// # = broken
// ? = unknown

// Get the total count of every possible combination
(await Bun.file('example.txt').text())
  .split(/\n/)
  .filter(line => line)
  .forEach(line => {
  // .some(line => {
    const [row, finalPattern] = line.split(/\s+/);
    console.log(getAllCombos(row.split(''), finalPattern.split(',').map(str => Number(str))))
    return true
    // console.log(row);
    // console.log(finalPattern)

    // console.log(isValid(row.split(''), finalPattern.split(',').map(str => Number(str))))
    // console.log(isValid('#.#.###'.split(''), finalPattern.split(',').map(str => Number(str))))

    // console.log('match count: ',
    // [...row.matchAll(/[?#]{1}[.?]+[?#]{3}/g)].map(match => {
    // [...row.matchAll(/\.*[?#]{1}[.?]+[?#]{1}[.?]+[?#]{3}/g)].map(match => {
    //     console.log(match)
    //   }).length

    // row.match(/test/)?.map(match => {
    //   console.log(match)
    // })
    // )
    // [...row.matchAll]
    // return getAllCombos(
    //   row.split(''), 
    //   finalPattern.split(',')
    //     .map(str => Number(str))
    // )
  })
