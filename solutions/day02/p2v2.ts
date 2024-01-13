// Part 1
const constraints: { [key: string]: number } = {
  red: 12,
  green: 13,
  blue: 14,
}

const answer = (
  // (await Bun.file('example.txt').text())
  (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .reduce((total, line) => {
    const [game, gameData] = line.split(/: /);

    // Part 2
    const mins: { [key: string]: number } = {
      red: -Infinity,
      green: -Infinity,
      blue: -Infinity,
    }

    const result = gameData.split(/; /).every(check => {
      const cubes = check.split(/, /);

      // Part 1
      // return cubes.every(cube => {
      //   const [count, color] = cube.split(/\s+/);
      //   return Number(count) <= constraints[color];
      // });

      // Part 2
      cubes.forEach(cube => {
        const [count, color] = cube.split(/\s+/);
        const num = Number(count);
        if (num > mins[color]) mins[color] = num;
      })
      return true;
    });
    // Part 1
    // return total + (result ? Number(game.split(/\s+/)[1]) : 0);

    // Part 2
    return total + Object.values(mins)
      .reduce((total, num) => total * num, 1);
  }, 0)
);
console.log(answer);
console.log([8, 2679, 2286, 77607].includes(answer));
