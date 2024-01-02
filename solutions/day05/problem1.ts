const fileContent = await Bun.file('./inputs.txt').text()
// const fileContent = await Bun.file('./example.txt').text()
const groups = fileContent.split('\n\n')
// console.log(groups)
const firstLine = groups.shift();
if (!firstLine) throw Error('FUCK IDK')
const seeds = firstLine.slice(firstLine?.indexOf(":") + 1)
  .trim().split(/\s/).map(str => Number(str))
console.log(seeds)
console.log(seeds.length)
// console.log(groups)


for (const group of groups) {
  // console.log(group)
  const [title, maps] = group.split(/:\n/)
  // console.log(maps)
  const transfers = maps.split('\n').filter(line => line)
  console.log(transfers)
  // const [destination, source, range] = transfers.split(/\s/)
  const obj = transfers.map(map => {
    const [destination, source, range] = map.split(/\s/).map(str => Number(str))
    return {
      destination, source, range
    }
  })
  // console.log(obj)
  const newSeeds = [];
  for (const mapObj of obj) {
    for (let i = 0; i < seeds.length; i++) {
      const seed = seeds[i]
      if (seed >= mapObj.source && seed < mapObj.source + mapObj.range) {
        // console.log('INCREMENT')
        const step = seed - mapObj.source;
        // newSeeds[i] = seeds[i] + step
        newSeeds[i] = mapObj.destination + step
      }
    }
  }
  // console.log(newSeeds)
  for (let i = 0; i < seeds.length; i++) {
    if (newSeeds[i]) {
      seeds[i] = newSeeds[i]
    }
  }
  console.log(seeds)
  // break;
}

let min = Infinity;
for (let i = 0; i < seeds.length; i++) {
  if (seeds[i] < min) min = seeds[i]
}
console.log('ANSWER?: ', min)

// Split into an array of lines, and remove blank lines
// const data = fileContent.split('\n').filter((line: string) => line)
// console.log(fileContent)

// const result = [...fileContent.matchAll(/(.+)\n\n/g)].map(match => {
//   console.log(match)
// })
// console.log('RESULT: ', result)

// console.log(data)
// for (const line of data) {
//   let seeds = [];
//   if (line.includes('seeds:')) {
//     let [idk, temp] = line.split(': ')
//     const arr = temp.split(/\s/).map(num => Number(num))
//     console.log(arr)
//     seeds = arr
//     continue;
//   }
// 
//   if (line.includes(':')) {
//     // console.log('BAD LINE')
//     continue;
//   }
//   console.log(line)
// }

// console.log(data)
// Do we want to use regex for this? Probably

// Each line a map indicates [destination, source, range]
// lets say we are going from seed to soil
// if the soil map doesnt have a range for a seed, then the soil number is the same as the seed number
//
// We want to find the lowest location number that correspond to a given seed
// We essentially only have to track the initial seeds
// and modify each seed depending on the map rules

// EXAMPLE DATA
// seeds: 79 14 55 13
// 
// seed-to-soil map:
// 50 98 2
// 52 50 48
// 
// soil-to-fertilizer map:
// 0 15 37
// 37 52 2
// 39 0 15
// 
// fertilizer-to-water map:
// 49 53 8
// 0 11 42
// 42 0 7
// 57 7 4
// 
// water-to-light map:
// 88 18 7
// 18 25 70
// 
// light-to-temperature map:
// 45 77 23
// 81 45 19
// 68 64 13
// 
// temperature-to-humidity map:
// 0 69 1
// 1 0 69
// 
// humidity-to-location map:
// 60 56 37
// 56 93 4
