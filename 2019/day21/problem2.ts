import runIntCode from '../day13/intCode';

function strToAscii(str: string) {
  return str.split('').map(char => char.charCodeAt(0));
}

function asciiToGrid(ascii: number[]) {
  return ascii.reduce((grid, num) => {
    if (num === 10) {
      grid.push([]);
    } else {
      grid[grid.length - 1].push(String.fromCharCode(num));
    }
    return grid;
  }, [[]] as string[][]);
}

function playGame(program: number[], instructions: string) {
  const result = runIntCode(program, 0, strToAscii(instructions));
  const answer = result.diagnostics[result.diagnostics.length - 1];

  if (answer > 256) return answer;
  const grid = asciiToGrid(result.diagnostics);
  grid.forEach(row => console.log(row.join('')));
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);

const part1Instructions = 'NOT A J\nNOT B T\nAND D T\nOR T J\nNOT C T\nAND D T\nOR T J\nWALK\n';
const part1 = playGame(program, part1Instructions);
console.log(part1, [ 19358870 ].includes(part1));

// Stolen from: https://www.reddit.com/r/adventofcode/comments/edll5a/comment/fr1r0lt/
const part2Instructions = 'NOT B J\nNOT C T\nOR T J\nAND D J\nAND H J\nNOT A T\nOR T J\nRUN\n';
const part2 = playGame(program, part2Instructions);
console.log(part2, [ 1143356492 ].includes(part2));
