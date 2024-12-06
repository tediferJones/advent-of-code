type PageFormat = { before: number, after: number }

function testPages(pages: number[], format: PageFormat[]) {
  const result = pages.every((page, i) => {
    const bConstraints = format.filter(({ before }) => before === page).map(({ after }) => after)
    const bValid = pages.slice(0, i).every(bPage => !bConstraints.includes(bPage))

    const aConstraints = format.filter(({ after }) => after === page).map(({ before }) => before)
    const aValid = pages.slice(i + 1).every(aPage => !aConstraints.includes(aPage))

    return bValid && aValid
  })
  return result ? pages[Math.floor(pages.length / 2)] : 0
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

const answer = pageGroups.reduce((total, group) => {
  return total + testPages(group, formats)
}, 0)

console.log(answer, [ 143, 5509 ].includes(answer))

// ANSWER PART 1: 5509
