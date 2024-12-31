const part1 = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .reduce((total, line) => {
    const mass = Number(line)
    return total + (Math.floor(mass / 3) - 2)
  }, 0)
)

console.log(part1, [ 34241, 3278434 ].includes(part1))
