function getNewNum(line: number[]): number[] {
  return !line.some(num => num !== 0) ? [] :
    // [line[line.length - 1]].concat(getNewNum( // Solution 1
    [line[0]].concat(getNewNum( // Solution 2
      // Get next line
      line.map((num, i) => line[i + 1] - num)
        .slice(0, line.length - 1)
    ));
}

console.log(
  // (await Bun.file('./example.txt').text())
  (await Bun.file('./inputs.txt').text())
    .split(/\n/)
    .map(line => !line ? 0 : 
      getNewNum(line.split(/\s+/).map(str => Number(str)))
        // .reduce((total, num) => total + num) // Solution 1
        .reverse() // Solution 2
        .reduce((total, num) => num - total) // Solution 2
    ).reduce((total, num) => total + num)
);

// ANSWER: 1053
