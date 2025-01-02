type PwdValidator = (pwd: string[]) => boolean

const keyFactsPart1: PwdValidator[] = [
  (pwd) => pwd.slice(1).some((digit, i) => digit === pwd[i]),
  (pwd) => pwd.toSorted().join('') === pwd.join(''),
]

const keyFactsPart2: PwdValidator[] = [
  (pwd) => pwd.reduce((digitCounts, digit) => {
    const num = Number(digit);
    digitCounts[num] = (digitCounts[num] + 1) || 1;
    return digitCounts;
  }, [] as number[]).includes(2),
  (pwd) => pwd.toSorted().join('') === pwd.join(''),
];

function testPassword(
  current: number,
  max: number,
  validators: Function[],
  count = 0
) {
  if (current > max) return count;
  const digits = current.toString().split('');
  const isValid = validators.every(func => func(digits));
  return testPassword(current + 1, max, validators, count + Number(isValid));
}

const [ _, min, max ] = (
  (await Bun.file(process.argv[2]).text())
  .match(/(\d+)-(\d+)/)!
  .map(Number)
);

const part1 = testPassword(min, max, keyFactsPart1);
console.log(part1, [ 2150 ].includes(part1));

const part2 = testPassword(min, max, keyFactsPart2);
console.log(part2, [ 1462 ].includes(part2));
