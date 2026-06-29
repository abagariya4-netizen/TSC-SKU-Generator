import { buildSku } from './lib/skuBuilder';
import { Category, SubCategory, Product, Model, Colour, Size } from './types';

// Mock DB data based on seed script
const categories: Category[] = [
  { id: '1', name: 'Mattress', code: 'M', type: 'dimension' },
  { id: '2', name: 'Bed', code: 'B', type: 'dimension' },
  { id: '3', name: 'Chair', code: 'C', type: 'colour' },
  { id: '4', name: 'Recliner Sofa', code: 'RS', type: 'colour' },
  { id: '5', name: 'Elite Sofa', code: 'ES', type: 'colour' },
  { id: '6', name: 'Desk', code: 'D', type: 'colour' },
  { id: '7', name: 'Foot Massager', code: 'FM', type: 'colour' },
  { id: '8', name: 'Accessories', code: 'A', type: 'accessory' }
];

const subCategories: SubCategory[] = [
  { id: '1', name: 'Pillow', code: 'P' },
  { id: '2', name: 'Cushion', code: 'C' },
  { id: '3', name: 'Wedge', code: 'W' }
];

const models: Model[] = [
  { id: '1', name: 'Ortho Pro', code: 'OP' },
  { id: '2', name: 'Ortho Pro Max', code: 'OPM' }
];

const products: Product[] = [
  { id: '1', category: 'Mattress', sub: null, name: 'Orthogrid', code: 'OG' },
  { id: '2', category: 'Mattress', sub: null, name: 'Ortho', code: 'OR' },
  { id: '3', category: 'Mattress', sub: null, name: 'Luxe', code: 'LX' },
  { id: '4', category: 'Chair', sub: null, name: 'Swill', code: 'SW' },
  { id: '5', category: 'Chair', sub: null, name: 'Stylux', code: 'ST' },
  { id: '6', category: 'Chair', sub: null, name: 'Onyx', code: 'ON' },
  { id: '7', category: 'Recliner Sofa', sub: null, name: 'Luxe Motorised', code: 'LM' },
  { id: '8', category: 'Recliner Sofa', sub: null, name: 'Nebula', code: 'NB' },
  { id: '9', category: 'Elite Sofa', sub: null, name: 'Emilio', code: 'EM' },
  { id: '10', category: 'Desk', sub: null, name: 'AeroPlus', code: 'AP' },
  { id: '11', category: 'Foot Massager', sub: null, name: 'WaveX', code: 'WX' },
  { id: '12', category: 'Accessories', sub: 'Pillow', name: 'Cervical', code: 'CV' },
  { id: '13', category: 'Accessories', sub: 'Cushion', name: 'Seat & Back', code: 'SB' },
  { id: '14', category: 'Accessories', sub: 'Wedge', name: 'Bed Wedge', code: 'BW' }
];

const colours: Colour[] = [
  { id: '1', name: 'Black', code: 'BL' },
  { id: '2', name: 'Grey', code: 'GY' },
  { id: '3', name: 'Tan', code: 'TN' },
  { id: '4', name: 'White & Black', code: 'WB' },
  { id: '5', name: 'Blue', code: 'BU' },
  { id: '6', name: 'Magenta', code: 'MG' } // We will test error separately
];

const sizes: Size[] = [
  { id: '1', name: 'King', code: 'K' },
  { id: '2', name: 'Queen', code: 'Q' },
  { id: '3', name: 'Custom', code: 'C' }
];

const tests = [
  { input: { category: 'Mattress', product: 'Orthogrid', var1: 'King(78*72)', var2: '8' }, expected: 'TSCMOGK78728' },
  { input: { category: 'Mattress', product: 'Orthogrid', var1: 'King(Custom)', var2: '8' }, expected: 'TSCMOGKC8' },
  { input: { category: 'Mattress', product: 'Ortho', var1: 'Queen(78*60)', var2: '6' }, expected: 'TSCMORQ78606' },
  { input: { category: 'Mattress', product: 'Luxe', var1: 'Custom(75*66)', var2: '10' }, expected: 'TSCMLXC10' },
  { input: { category: 'Mattress', product: 'Luxe', var1: '75*60', var2: '8' }, expected: 'TSCMLXC8' },
  { input: { category: 'Chair', product: 'Swill', var1: 'Black' }, expected: 'TSCCSWBL' },
  { input: { category: 'Chair', product: 'Stylux', var1: 'Grey' }, expected: 'TSCCSTGY' },
  { input: { category: 'Chair', product: 'Onyx', var1: '', var2: '' }, expected: 'TSCCON01', nextSerial: '01' },
  { input: { category: 'Chair', product: 'Onyx', var1: '', var2: '' }, expected: 'TSCCON02', nextSerial: '02' },
  { input: { category: 'Recliner Sofa', product: 'Luxe Motorised', var1: 'Tan' }, expected: 'TSCRSLMTN' },
  { input: { category: 'Recliner Sofa', product: 'Nebula', var1: '', var2: '' }, expected: 'TSCRSNB01', nextSerial: '01' },
  { input: { category: 'Elite Sofa', product: 'Emilio', var1: 'Black' }, expected: 'TSCESEMBL' },
  { input: { category: 'Desk', product: 'AeroPlus', var1: 'White & Black' }, expected: 'TSCDAPWB' },
  { input: { category: 'Foot Massager', product: 'WaveX', var1: 'Blue' }, expected: 'TSCFMWXBU' },
  { input: { category: 'Accessories', subcategory: 'Pillow', product: 'Cervical', var1: '5', var2: 'pack 2' }, expected: 'TSCPCV5P2' },
  { input: { category: 'Accessories', subcategory: 'Pillow', product: 'Cervical', var1: '6', var2: 'pack 1' }, expected: 'TSCPCV6P1' },
  { input: { category: 'Accessories', subcategory: 'Cushion', product: 'Seat & Back', var1: 'Ortho Pro' }, expected: 'TSCCSBOP' },
  { input: { category: 'Accessories', subcategory: 'Cushion', product: 'Seat & Back', var1: 'Ortho Pro Max' }, expected: 'TSCCSBOPM' },
  { input: { category: 'Accessories', subcategory: 'Wedge', product: 'Bed Wedge', var1: 'Black' }, expected: 'TSCWBWBL' },
  { input: { category: 'Accessories', subcategory: 'Wedge', product: 'Bed Wedge', var1: 'Grey' }, expected: 'TSCWBWGY' },
  { input: { category: 'Mattress', product: 'Ghost Product', var1: 'King(78*72)', var2: '8' }, expected: 'ERROR: Unknown product: Ghost Product' },
  { input: { category: 'Chair', product: 'Swill', var1: 'Magenta' }, expected: 'ERROR: Unknown colour: Magenta' } // Testing what happens if not in DB
];

// Let's remove Magenta from colours to trigger the error intentionally as per requirements.
const coloursForTest = colours.filter(c => c.name !== 'Magenta');

let passed = 0;
for (const t of tests) {
  const result = buildSku(t.input, categories, subCategories, products, models, coloursForTest, sizes, t.nextSerial || '01');
  const actual = result.error ? `ERROR: ${result.error}` : result.sku;
  if (actual === t.expected) {
    passed++;
  } else {
    console.error(`FAILED:`, t.input);
    console.error(`  Expected: ${t.expected}`);
    console.error(`  Actual:   ${actual}`);
  }
}
console.log(`\nTests passed: ${passed}/${tests.length}`);
