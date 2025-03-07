interface Cache {
  [key: string]: {
    [key: string]: number,
  },
}

function trimDots(springs: string) {
  let start = true;
  return springs
    .split('')
    .map((char, i, arr) => {
      if (start && char !== '.') start = false
      return start || !springs.match(/[?#]/) ||
        char === '.' && arr[i + 1] === '.' ? '' : char;
    }).filter(char => char)
}

function checker(
  springs: string[],
  groups: number[],
  cache: Cache = {},
  // The args below are for debugging
  pattern = '',
  depthCount = 0,
): number {
  // console.log(springs[0], depthCount, pattern, springs.join(''), groups)
  // Basic Explanation:
  //
  // The value of groups[0] will decide what the current char can be
  // If it is greater than 0, it must be a hash
  // If it is 0, it must be a dot
  // If it is -1, we can do either
  //    i.e. previous group was successfully completed,
  //    including the dot required for seperating groups 

  const [springKey, groupKey] = [springs.join(''), groups.join()];
  if (springKey in cache && groupKey in cache[springKey]) {
    return cache[springKey][groupKey];
  }

  if (groups.length === 1 && groups[0] < 1) {
    return springs.includes('#') ? 0 : 1;
  }

  let [dot, hash] = [0, 0];
  if ('#?'.includes(springs[0]) && groups[0] !== 0) {
    const hashGroups = groups[0] < 0 ? groups.slice(1) : groups;
    hash = checker(
      springs.slice(1),
      hashGroups.with(0, hashGroups[0] - 1),
      cache,
      pattern.concat('#'),
      depthCount + 1
    );
  }
  if ('.?'.includes(springs[0]) && groups[0] < 1) {
    dot = checker(
      springs.slice(1),
      groups[0] === 0 ? groups.with(0, groups[0] - 1) : groups,
      cache,
      pattern.concat('.'),
      depthCount + 1
    );
  }
  
  const comboCount = dot + hash;
  springKey in cache ? cache[springKey][groupKey] = comboCount
    : cache[springKey] = { [groupKey]: comboCount };
  return comboCount;
}

const startTime = Bun.nanoseconds();
const total = (
  // (await Bun.file('example.txt').text())
  (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .reduce((total, line, i) => {
    const [springs, groups] = line.split(/\s+/);
    return total + checker(
      // Part 1
      // trimDots(springs),
      // [ -1 ].concat(groups.split(',').map(str => Number(str)))

      // Part 2
      trimDots(
        (springs + '?')
          .repeat(5)
          .slice(0, -1)
      ),
      [ -1 ].concat(
        (groups + ',')
          .repeat(5)
          .slice(0, -1)
          .split(',')
          .map(str => Number(str))
      )
    );
  }, 0)
);
console.log(total);
console.log([21, 7402, 525152, 3384337640277].includes(total));
const endTime = Bun.nanoseconds();
console.log(`Run Time: ${(endTime - startTime) / 10**9} seconds`)

