const nums: { [key: string]: string } = {
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
};

// Part 1
const matcher = new RegExp(
  Object.values(nums)
    .reduce((regex, val) => regex + val + '|', '')
    .slice(0, -1)
);

// Part 2
const matcherV2 = new RegExp(
  Object.values(nums)
    .concat(Object.keys(nums))
    .reduce((regex, val) => regex + val + '|', '')
    .slice(0, -1)
);
const reverseMatcherV2 = new RegExp(
  Object.values(nums)
    .concat(Object.keys(nums))
    .reduce((regex, val) => regex + val.split('').toReversed().join('') + '|', '')
    .slice(0, -1)
);
const reverseKeys = Object.keys(nums).map(str => str.split('').toReversed().join(''));

const answer = (
  // (await Bun.file('example.txt').text())
  // (await Bun.file('example2.txt').text())
  (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .reduce((total, line) => {
    // Part 1
    // const first = line.match(matcher);
    // const last = (
    //   line.split('')
    //   .toReversed()
    //   .join('')
    //   .match(matcher)
    // );
    
    // Part 2
    const first = (
      line.match(matcherV2)
      ?.map(match => Object.keys(nums).includes(match) ? nums[match] : match)
    )
    const last = (
      line.split('')
      .toReversed()
      .join('')
      .match(reverseMatcherV2)
      ?.map(match => {
        return reverseKeys.includes(match) ?
          nums[match.split('').toReversed().join('')] :
          match
      })
    )

    if (!(first && last)) throw Error('Failed to find both numbers')
    return total + Number(first[0] + last[0])
  }, 0)
);

console.log(answer);
console.log([142, 54708, 281, 54087].includes(answer));
