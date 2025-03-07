function checker(springs: string[], expectedResult: string): number {
  if (springs.includes('?')) {
    // check both possibilities, '.' or '#'
    const index = springs.indexOf('?');
    return checker(springs.with(index, '.'), expectedResult) +
      checker(springs.with(index, '#'), expectedResult);
  }

  // If we get to this point the pattern is complete, see if it matches answer
  const result = springs.join('')
    .split(/\.+/)
    .filter(exists => exists)
    .map(str => str.length)
    .join();
  return result === expectedResult ? 1 : 0;
}

const total =
// (await Bun.file('example.txt').text())
(await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .reduce((total, line) => {
    // We want to return the total number of possible combinations
    const [springs, results] = line.split(/\s+/);
    return total + checker(springs.split(''), results);
  }, 0);
console.log(total);
console.log([21, 7402].includes(total));
