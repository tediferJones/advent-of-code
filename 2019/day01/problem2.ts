function calcFuel(num: number, recursive?: true): number {
  const fuel = Math.floor(num / 3) - 2;
  if (fuel < 1) return 0;
  return recursive ? fuel + calcFuel(fuel, true) : fuel;
}

const { part1, part2 } = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .reduce((total, line) => {
    const mass = Number(line);
    total.part1 += calcFuel(mass);
    total.part2 += calcFuel(mass, true);
    return total;
  }, { part1: 0, part2: 0 })
);

console.log(part1, [ 34241, 3278434 ].includes(part1));
console.log(part2, [ 51316, 4914785 ].includes(part2));
