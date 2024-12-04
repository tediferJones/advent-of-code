const part1 = /mul\((\d+),(\d+)\)/g;
const part2 = /mul\((\d+),(\d+)\)|do\(\)|don't\(\)/g;

const { answer } = (
  [ ...(await Bun.file(process.argv[2]).text()).matchAll(part2) ]
  .reduce((state, match) => {
    if ([ "do()", "don't()" ].includes(match[0])) {
      state.isEnabled = match[0] === 'do()';
      return state;
    }
    const [ num1, num2 ] = match.slice(1).map(str => Number(str));
    state.answer += state.isEnabled ? num1 * num2 : 0;
    return state;
  }, { answer: 0, isEnabled: true })
);

console.log(answer, [ 161, 160672468, 48, 84893551 ].includes(answer));

// ANSWER PART 1: 160672468
// ANSWER PART 2: 84893551
