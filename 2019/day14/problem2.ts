type Chemical = { name: string, quantity: number, children?: Chemical[] }

function buildTree(chemicals: Chemical[], name: string): Chemical | undefined {
  const chem = chemicals.find(chem => chem.name === name);
  if (!chem?.children) return;

  const children = chem.children.map(child => {
    if (child.name === 'ORE') return;
    const result = buildTree(chemicals, child.name)!;
    result.quantity = child.quantity;
    return result;
  }).filter(child => child) as Chemical[];

  return {
    name: chem.name,
    quantity: chem.quantity,
    children: children.length ? children : undefined,
  }
}

function sumOres(
  tree: Chemical, 
  quantity: number,
  leftOvers: Record<string, number> = {}
): number {
  if (leftOvers[tree.name] === undefined) leftOvers[tree.name] = 0;
  const rawQuantity = tree.quantity * quantity;
  const requiredProduction = rawQuantity - leftOvers[tree.name];

  if (requiredProduction <= 0) {
    leftOvers[tree.name] -= rawQuantity;
    return 0;
  }

  const prodGroupSize = chemInfo[tree.name].groupSize;
  const groupsNeeded = Math.ceil(requiredProduction / prodGroupSize);
  const totalMade = prodGroupSize * groupsNeeded;
  leftOvers[tree.name] = (totalMade - requiredProduction);

  if (!tree.children) return chemInfo[tree.name].oreCost! * groupsNeeded;
  return tree.children.reduce((total, child) => {
    return total + sumOres(child, groupsNeeded, leftOvers);
  }, 0);
}

function findHighLow(tree: Chemical, totalOre: number, count = 1) {
  const oreCost = sumOres(tree, 2**count);
  if (oreCost > totalOre) return { high: 2**count, low: 2**(count - 1) };
  return findHighLow(tree, count + 1, totalOre);
}

function binarySearch(
  tree: Chemical,
  totalOre: number,
  low: number,
  high: number
) {
  const mid = Math.floor((low + high) / 2);
  if (high - low === 1) return mid;
  const oreCost = sumOres(tree, mid);
  return binarySearch(
    tree,
    totalOre,
    oreCost < totalOre ? mid : low,
    oreCost < totalOre ? high : mid
  );
}

const data = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .reduce((result, line) => {
    const [ inputs, output ] = line.split(/\s+=>\s+/);
    const [ quantity, name ] = output.split(/\s+/);
    const children = inputs.split(/,\s+/).map(input => {
      const [ quantity, name ] = input.split(/\s+/);
      return { name, quantity: Number(quantity) };
    });
    return result.concat({ name, children, quantity: Number(quantity) });
  }, [] as Chemical[])
);

// This could be attached to each node inside buildTree func
// But I think this slightly easier to understand
const chemInfo = data.reduce((ratios, chem) => {
  ratios[chem.name] = { groupSize: chem.quantity };
  const ore = chem.children?.find(chem => chem.name === 'ORE');
  if (ore) ratios[chem.name].oreCost = ore.quantity;
  return ratios;
}, {} as Record<string, { oreCost?: number, groupSize: number }>);

const chemTree = buildTree(data, 'FUEL')!;
const part1 = sumOres(chemTree, 1);
console.log(part1, [ 31, 165, 13312, 180697, 2210736, 485720 ].includes(part1));

const totalOre = 1000000000000;
const { high, low } = findHighLow(chemTree, totalOre);
const part2 = binarySearch(chemTree, totalOre, low, high);
console.log(part2, [ 82892753, 5586022, 460664, 3848998 ].includes(part2));
