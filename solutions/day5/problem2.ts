const fileContent = await Bun.file('./inputs.txt').text()
// const fileContent = await Bun.file('./example.txt').text()
const groups = fileContent.split('\n\n')
// console.log(groups)
const firstLine = groups.shift();
if (!firstLine) throw Error('FUCK IDK')
const oldSeeds = firstLine.slice(firstLine?.indexOf(":") + 1)
  .trim().split(/\s/).map(str => Number(str))
// const seeds: number[] = [];
let absoluteMin = Infinity;
for (let i = 0; i < oldSeeds.length - 1; i += 2) {
  let [start, step] = oldSeeds.slice(i, i + 2)
  // console.log('GENERATE SEED RANGE', i)
  console.log(`GENERATE SEED RANGE ${i}/20`)
  // const seeds: number[] = []
  // const seeds = Array.from(Array(step).keys()).map(num => num + start)
  // let counter = start;
  // for (let j = 0; start + j < start + step; j++) {
  // let ratio = 1000;

  // LOW MEMORY VERSION
  for (let j = 0; j < step; j++) {
    // seeds.push(start + j)
    // getLocations([start + j])
    // console.log('checking', j)
    const minFromSet = getLocations([start + j])
    if (minFromSet < absoluteMin) {
      absoluteMin = minFromSet
      console.log('NEW MIN', absoluteMin)
    }
  }

  // NOT BAD, but uses lots of memory
  // It would be better if we didnt have to generate the entire array
  // Try to only generate fractions of the array at a time
  // and try not to use map, it will double the size of the array because it's a shallow copy
  // const seeds = Array.from(Array(step).keys())// .map(num => num + start)
  // seeds.forEach((num, i) => seeds[i] = num + start)
  // console.log('PROCESSING')
  // // const seeds: number[] = [];
  // const denom = 1000;
  // for (let d = 0; d < denom; d++) {
  //   if (d % 50 == 0) console.log((d*100/denom) + '%')
  //   // console.log(`CHECKING ${d}/${denom}`)
  //   // seeds.slice(d/denom, (d+1)/denom)
  //   const startIndex = Math.floor(seeds.length * d/denom)
  //   const endIndex = Math.floor(seeds.length * (d+1)/denom)

  //   const minFromSet = getLocations(seeds.slice(startIndex, endIndex))

  //   // TESTING
  //   // const startNum = start + d/denom*step
  //   // const seeds = Array.from(Array(step).keys()).map(num => num + start)

  //   if (minFromSet < absoluteMin) {
  //     absoluteMin = minFromSet
  //     console.log('NEW MIN', absoluteMin)
  //   }
  // }

  // console.log(start, step)
  // console.log(step < 4294967295)
  //
  // const minFromSet = getLocations(seeds)
  // if (minFromSet < absoluteMin) {
  //   absoluteMin = minFromSet
  // }
  // console.log('FINSIHED SEED RANGE', absoluteMin, minFromSet)
  console.log('FINSIHED SEED RANGE')
}
// console.log(seeds)
// console.log(seeds.length)
// console.log(groups)
console.log('BIG ANSWER: ', absoluteMin)


// IF YOU UN-FUCKED SOME OF THIS YOU MIGHT HAVE A CHANCE
// We're running O^3 code an absurd number of times
function getLocations(seeds: number[]) {
  // console.log(seeds)
  for (const group of groups) {
    // console.log('STARTING TO PROCESS A GROUP')
    // console.log(group)
    const [title, maps] = group.split(/:\n/)
    // console.log(maps)
    const transfers = maps.split('\n').filter(line => line)
    // console.log(transfers)
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
    // console.log(seeds)
    // break;
  }

  let min = Infinity;
  for (let i = 0; i < seeds.length; i++) {
    if (seeds[i] < min) min = seeds[i]
  }
  // console.log('ANSWER?: ', min)
  return min
}

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
