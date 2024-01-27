const extraCards: number[] = [];
const answer = (
  // (await Bun.file('example.txt').text())
  (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .reduce((answer, line) => {
    const [myNums, winningNums] = (
      line.split(/:\s+/)[1]
      .split(/\s+\|\s+/)
      .map(nums => nums.split(/\s+/))
    );
    const pointCount = myNums.reduce((total, myNum) => {
      return total + (winningNums.includes(myNum) ? 1 : 0)
    }, 0);

    // Part 1
    // return answer + (pointCount ? 2 ** (pointCount - 1) : 0);

    // Part 2
    const cardCount = (extraCards.shift() || 0) + 1;
    [...Array(pointCount).keys()].forEach(i => {
      extraCards[i] = (extraCards[i] || 0) + cardCount;
    });
    return answer + cardCount;
  }, 0)
);

console.log(answer);
console.log([13, 23673, 30, 12263631].includes(answer));
