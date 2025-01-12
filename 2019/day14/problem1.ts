type Chemical = { name: string, quantity: number, children?: Chemical[] }

function buildTree(chemicals: Chemical[], name: string): Chemical | undefined {
  const found = chemicals.find(chem => chem.name === name)
  if (!found?.children) return

  const children = found.children.map(child => {
    if (child.name === 'ORE') return
    const result = buildTree(chemicals, child.name)!
    result.quantity = child.quantity
    return result
  }).filter(child => child) as Chemical[]

  return {
    name: found.name,
    quantity: found.quantity,
    children: children.length ? children : undefined,
  }
}

function sumOresV2(
  tree: Chemical, 
  quantity: number,
  leftOvers: Record<string, number> = {}
): number {
  if (leftOvers[tree.name] === undefined) leftOvers[tree.name] = 0
  const rawQuantity = tree.quantity * quantity
  const requiredProduction = rawQuantity - leftOvers[tree.name]

  // If we have enough leftovers, use them, no extra ore used so return 0
  if (requiredProduction <= 0) {
    leftOvers[tree.name] -= rawQuantity
    return 0
  }

  const prodGroupSize = otherLookup[tree.name]
  const groupsNeeded = Math.ceil(requiredProduction / prodGroupSize)
  const totalMade = prodGroupSize * groupsNeeded
  leftOvers[tree.name] = (totalMade - requiredProduction)

  if (!tree.children) return ratioLookup[tree.name].input * groupsNeeded
  return tree.children.reduce((total, child) => {
    return total + sumOresV2(child, groupsNeeded, leftOvers)
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

const otherLookup = data.reduce((other, chem) => {
  other[chem.name] = chem.quantity
  return other
}, {} as Record<string, number>)

const chemTree = buildTree(data, 'FUEL')!
const part1 = sumOresV2(chemTree, 1)
console.log(part1, [ 31, 165, 13312, 180697, 2210736, 485720 ].includes(part1))
