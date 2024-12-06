type PageFormat = { before: number, after: number }

function pageOrderIsValid(pages: number[], format: PageFormat[]) {
  const isValid = pages.every((page, i) => {
    const aConstraints = format.reduce((aConst, { before, after }) => {
      return after === page ? aConst.concat(before) : aConst;
    }, [] as number[]);
    return pages.slice(i + 1).every(aPage => !aConstraints.includes(aPage));
  })
  return isValid ? pages[Math.floor(pages.length / 2)] : 0;
}

function part1(pageGroups: number[][], formats: PageFormat[]) {
  return pageGroups.reduce((total, group) => {
    return total + pageOrderIsValid(group, formats);
  }, 0);
}

function fixPages(pageGroup: number[], formats: PageFormat[]) {
  const constraints = pageGroup.reduce((constraints, page) => {
    constraints[page] = formats.reduce((result, { before, after }) => {
      return after === page && pageGroup.includes(before) ? result.concat(before) : result;
    }, [] as number[]);
    return constraints;
  }, {} as { [key: string]: number[] });

  const sorted = (
    Object.keys(constraints)
    .sort((a, b) => constraints[a].length - constraints[b].length)
    .map(Number)
  )

  return sorted[Math.floor(sorted.length / 2)]
}

function part2(pageGroups: number[][], formats: PageFormat[]) {
  return pageGroups.reduce((total, group) => {
    return total + (pageOrderIsValid(group, formats) ? 0 : fixPages(group, formats))
  }, 0)
}

const [ format, pages ] = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n\n/)
  .map(section => section.split(/\n/).filter(Boolean))
)

const formats = format.reduce((formats, line) => {
  const [ _, before, after ] = line.match(/(\d+)\|(\d+)/)!.map(Number)
  return formats.concat({ before, after })
}, [] as PageFormat[])

const pageGroups = pages.reduce((groups, group) => {
  return groups.concat([ group.split(',').map(Number) ])
}, [] as number[][])

const part1Answer = part1(pageGroups, formats)
console.log(part1Answer, [ 143, 5509 ].includes(part1Answer))

const part2Answer = part2(pageGroups, formats)
console.log(part2Answer, [ 123, 4407 ].includes(part2Answer))

// ANSWER PART 1: 5509
// ANSWER PART 2: 4407
