const data = await Bun.file(process.argv[2]).text();

const answer = (
  [ ...data.matchAll(/mul\((\d+),(\d+)\)/g) ].reduce((total, match) => {
    return total + (Number(match[1]) * Number(match[2]))
  }, 0)
)

console.log(answer, [ 161, 160672468 ].includes(answer))

// ANSWER PART 1: 160672468
