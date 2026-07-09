// Data for the View Item screen — transcribed from the design's data() table.
// Five item categories, each with three swappable styles, each style with its
// own colourways. Prices reuse the bag's parse/format helpers (single source).
export { parsePrice, formatPrice } from '../bag/bagData';

export type ItemColour = { n: string; sw: string };

export type ItemStyle = {
  name: string;
  tag: string;
  material: string;
  size: string;
  price: string;
  /** Placeholder image id. */
  img: string;
  colours: ItemColour[];
};

export type Item = {
  label: string;
  styles: ItemStyle[];
};

export const ITEMS: Item[] = [
  {
    label: 'Sofa',
    styles: [
      { name: 'Linen Sofa', tag: 'Two-seater', material: 'Belgian slub linen', size: 'W 168 · D 88 cm', price: '£1,240', img: 'sofa-linen', colours: [{ n: 'Oat', sw: '#D9C4A8' }, { n: 'Clay', sw: '#C08B6B' }, { n: 'Sage', sw: '#9FB0A0' }] },
      { name: 'Bouclé Sofa', tag: 'Two-seater', material: 'Wool bouclé', size: 'W 172 · D 90 cm', price: '£1,380', img: 'sofa-boucle', colours: [{ n: 'Chalk', sw: '#ECE7DE' }, { n: 'Fog', sw: '#B9BDBA' }] },
      { name: 'Leather Sofa', tag: 'Two-seater', material: 'Aniline leather', size: 'W 170 · D 88 cm', price: '£1,690', img: 'sofa-leather', colours: [{ n: 'Tan', sw: '#B07A4E' }, { n: 'Espresso', sw: '#4A342A' }] },
    ],
  },
  {
    label: 'Lamp',
    styles: [
      { name: 'Arc Floor Lamp', tag: 'Reading light', material: 'Brushed metal stem', size: 'H 172 cm', price: '£320', img: 'lamp-arc', colours: [{ n: 'Brass', sw: '#C6A15B' }, { n: 'Black', sw: '#3B3A36' }, { n: 'Chrome', sw: '#C9CCCE' }] },
      { name: 'Dome Table Lamp', tag: 'Task light', material: 'Steel + opal glass', size: 'H 44 cm', price: '£190', img: 'lamp-dome', colours: [{ n: 'Cream', sw: '#EDE6D6' }, { n: 'Sage', sw: '#9FB0A0' }] },
      { name: 'Paper Lantern', tag: 'Ambient light', material: 'Rice paper shade', size: 'H 120 cm', price: '£95', img: 'lamp-lantern', colours: [{ n: 'White', sw: '#F4F1EA' }, { n: 'Ecru', sw: '#E3D6BF' }] },
    ],
  },
  {
    label: 'Rug',
    styles: [
      { name: 'Wool Rug', tag: 'Hand-loomed', material: 'New Zealand wool', size: '200 × 300 cm', price: '£680', img: 'rug-wool', colours: [{ n: 'Ecru', sw: '#EAD9BE' }, { n: 'Stone', sw: '#B9AE9C' }, { n: 'Ochre', sw: '#C79A4A' }] },
      { name: 'Jute Rug', tag: 'Flat-weave', material: 'Natural jute', size: '200 × 290 cm', price: '£420', img: 'rug-jute', colours: [{ n: 'Natural', sw: '#D8C39A' }, { n: 'Slate', sw: '#8A8A82' }] },
      { name: 'Kilim Rug', tag: 'Woven', material: 'Recycled cotton', size: '190 × 290 cm', price: '£360', img: 'rug-kilim', colours: [{ n: 'Rust', sw: '#B4632F' }, { n: 'Indigo', sw: '#3C4A63' }] },
    ],
  },
  {
    label: 'Table',
    styles: [
      { name: 'Oak Side Table', tag: 'Round', material: 'Solid white oak', size: 'Ø 45 · H 52 cm', price: '£240', img: 'table-oak', colours: [{ n: 'Natural', sw: '#D8BE97' }, { n: 'Walnut', sw: '#6E4A2E' }] },
      { name: 'Marble Plinth', tag: 'Column', material: 'Honed marble', size: 'Ø 35 · H 50 cm', price: '£380', img: 'table-marble', colours: [{ n: 'Bianco', sw: '#ECEAE4' }, { n: 'Nero', sw: '#3A3A3E' }] },
      { name: 'Cane Table', tag: 'Round', material: 'Rattan + oak', size: 'Ø 46 · H 54 cm', price: '£210', img: 'table-cane', colours: [{ n: 'Honey', sw: '#CDA36A' }, { n: 'Black', sw: '#3B3A36' }] },
    ],
  },
  {
    label: 'Vase',
    styles: [
      { name: 'Ceramic Vase', tag: 'Tall', material: 'Matte stoneware', size: 'H 34 cm', price: '£68', img: 'vase-ceramic', colours: [{ n: 'Chalk', sw: '#ECE7DE' }, { n: 'Terracotta', sw: '#B0715A' }] },
      { name: 'Glass Vase', tag: 'Fluted', material: 'Hand-blown glass', size: 'H 28 cm', price: '£54', img: 'vase-glass', colours: [{ n: 'Clear', sw: '#DDE6E6' }, { n: 'Smoke', sw: '#9AA0A0' }] },
      { name: 'Stone Vase', tag: 'Squat', material: 'Travertine', size: 'H 22 cm', price: '£88', img: 'vase-stone', colours: [{ n: 'Ivory', sw: '#E7DEC9' }, { n: 'Umber', sw: '#7A6047' }] },
    ],
  },
];

/** Fixed palette swatches shown under the collage (design's Palette row). */
export const PALETTE: string[] = ['#EFE6D6', '#D9C4A8', '#C08B6B', '#9FB0A0', '#6E4A2E', '#3B3A36'];

/** Panel-1 detail tiles beneath the hero (one tall, two stacked). */
export const OVERVIEW_DETAILS = ['Detail', 'Detail', 'Detail'] as const;
