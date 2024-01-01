// const lines = (await Bun.file('example.txt').text())
const lines = (await Bun.file('inputs.txt').text())
.split(/\n/)
.filter(line => line)
.reduce((arr, line) => {
  const [name, data] = line.split(/:\s+/);
  const dataArr = data.split(/\s+/).map(str => Number(str));
  // return arr.concat([dataArr]) // Part 1
  return arr.concat([[Number(dataArr.join(''))]]) // Part 2
}, [] as number[][]);

const answer = lines[0].map((_, i) => [lines[0][i], lines[1][i]])
.reduce((total, pair) => {
  const [time, distance] = pair;
  return total *= [...Array(time).keys()]
    .reduce((total, holdTime) => {
      return holdTime * (time - holdTime) > distance ?
        total + 1 : total;
    })
}, 1);

console.log('Answer: ' + answer);
console.log([71503, 30077773, 288, 4811940].includes(answer));
