const keyFacts: ((pwd: string) => boolean)[] = [
  (pwd) => pwd.split('').slice(1).some((digit, i) => digit === pwd[i]),
  (pwd) => pwd.split('').toSorted().join('') === pwd,
];

function testPassword(current: number, max: number, count = 0) {
  if (current > max) return count;
  const isValid = keyFacts.every(func => func(current.toString())) ;
  return testPassword(current + 1, max, isValid ? count + 1 : count);
}

const [ _, min, max ] = (
  (await Bun.file(process.argv[2]).text())
  .match(/(\d+)-(\d+)/)!
  .map(Number)
);

const part1 = testPassword(min, max);
console.log(part1, [ 2150 ].includes(part1));
