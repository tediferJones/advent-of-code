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

function playGame(program: number[]) {
  const instructions = 'NOT A J\nNOT B T\nAND D T\nOR T J\nNOT C T\nAND D T\nOR T J\nWALK\n';

  const result = runIntCode(program, 0, strToAscii(instructions));
  const answer = result.diagnostics[result.diagnostics.length - 1];

  if (answer > 256) return answer;
  const grid = asciiToGrid(part1.diagnostics);
  grid.forEach(row => console.log(row.join('')));
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);

const part1 = playGame(program);
console.log(part1, [ 19358870 ].includes(part1));
