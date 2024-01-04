const nums: { [key: string]: string } = {
  'one': '1',
  'two': '2',
  'three': '3',
  'four': '4',
  'five': '5',
  'six': '6',
  'seven': '7',
  'eight': '8',
  'nine': '9',
};

const testDataV2 = (await Bun.file('inputs.txt').text()).split(/\n/).filter(line => line)
// const testDataV2 = (await Bun.file('example.txt').text()).split(/\n/).filter(line => line)
// const testDataV2 = (await Bun.file('example2.txt').text()).split(/\n/).filter(line => line)

let total = 0;
for (const chars of testDataV2) {
  let firstDigit, lastDigit;
  for (let i = 0; i < chars.length; i++) {
    for (const key in nums) {
      // If char matches first char from key, check if rest of the word exists
      if (chars[i] === key[0]) {
        if (chars.slice(i, i + key.length) === key) {
          firstDigit = nums[key];
          break;
        }
      }
    }
    if (firstDigit) break;

    if (chars[i] >= '0' && chars[i] <= '9') {
      firstDigit = chars[i]
      break;
    }
  }
  for (let i = 1; i <= chars.length; i++) {
    const realIndex = chars.length - i;
    for (const key in nums) {
      // if char matches last char, check for the rest of the word
      if (chars[realIndex] === key[key.length - 1]) {
        const stringContent = chars.slice(realIndex - key.length + 1, realIndex + 1);
        if (stringContent === key) {
          lastDigit = nums[key];
          break;
        }
      }
    }
    if (lastDigit) break;
    if (chars[chars.length - i] >= '0' && chars[chars.length - i] <= '9') {
      lastDigit = chars[chars.length - i]
      break;
    }
  }
  if (!firstDigit || !lastDigit) throw Error('Cant find digit')
  total += Number(firstDigit + lastDigit);
}

console.log(total)
console.log([54087].includes(total))
