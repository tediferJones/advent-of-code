type Chemical = { name: string, quantity: number, children?: Chemical[] }

function buildTree(chemicals: Chemical[], name: string): Chemical | undefined {
  const found = chemicals.find(chem => chem.name === name)
  if (!found?.children) return

  const children = found.children.map(child => {
    if (child.name === 'ORE') {
      return
      // return child
    }
    const result = buildTree(chemicals, child.name)!
    result.quantity = child.quantity
    return  result
  }).filter(child => child) as Chemical[]

  return {
    name: found.name,
    quantity: found.quantity,
    children: children.length ? children : undefined,
  }
}

function sumOres(
  tree: Chemical, 
  quantity: number,
  leftOvers: Record<string, number> = {}
): number {
  if (!tree.children) {
    const requiredProduction = tree.quantity * quantity
    const { input, output } = ratioLookup[tree.name]
    if (leftOvers[tree.name] >= requiredProduction) {
      leftOvers[tree.name] -= requiredProduction
      console.log('used leftovers', leftOvers)
      return 0
    }

    const groupsNeeded = Math.ceil((requiredProduction - (leftOvers[tree.name] || 0)) / output)
    const totalMade = output * groupsNeeded
    if (!leftOvers[tree.name]) leftOvers[tree.name] = 0
    leftOvers[tree.name] += (totalMade - requiredProduction)

    console.log(tree.name, 'adding', input * groupsNeeded, input, groupsNeeded)
    console.log({ input, output, groupsNeeded, requiredProduction, totalMade, quantity })

    return input * groupsNeeded
  }
  return tree.children.reduce((total, child) => {
    // console.log(tree)
    return total + sumOres(child, tree.quantity, leftOvers)
    // NOT TESTED, but pretty sure we will need to track quantity of multiple depths
    // if 5a + 3b = 1 fuel
    // and 3c + 2d = 1a
    // and 15 ore = 1c, we actually need (5 * 3 * 15) ore just to make enough C to make enough A
    // return total + sumOres(child, quantity * tree.quantity, leftOvers)
  }, 0)
}

const data = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .reduce((result, line) => {
    const [ inputs, output ] = line.split(/\s+=>\s+/)
    const [ quantity, name ] = output.split(/\s+/)
    return result.concat({
      name,
      quantity: Number(quantity),
      children: inputs.split(/,\s+/).map(input => {
        const [ quantity, name ] = input.split(/\s+/)
        return { name, quantity: Number(quantity) }
      })
    })
  }, [] as Chemical[])
)


const ratioLookup = data.reduce((ratios, chem) => {
  const found = chem.children?.find(chem => chem.name === 'ORE')
  if (found) {
    ratios[chem.name] = { output: chem.quantity, input: found.quantity }
  }
  return ratios
}, {} as Record<string, { output: number, input: number }>)

// console.log(JSON.stringify(data, undefined, 2))
// console.log('~~~~~~~~')
const chemTree = buildTree(data, 'FUEL')!
// console.log(JSON.stringify(chemTree, undefined, 2))
const part1 = sumOres(chemTree, 1)
console.log(part1, [ 31, 165 ].includes(part1))
