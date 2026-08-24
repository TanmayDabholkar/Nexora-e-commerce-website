const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const dataDirectory = path.join(__dirname, 'data');
fs.mkdirSync(dataDirectory, { recursive: true });
const productsDb = new DatabaseSync(path.join(dataDirectory, 'products.db'));
productsDb.exec(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('women', 'men', 'accessories')),
  colour TEXT NOT NULL, price INTEGER NOT NULL CHECK(price BETWEEN 3000 AND 4000),
  image_url TEXT NOT NULL, alt_text TEXT NOT NULL, badge TEXT
)`);
productsDb.exec('CREATE UNIQUE INDEX IF NOT EXISTS products_name_unique ON products(name)');

// Keep this seed repeatable: new pieces are added when the app starts, without
// duplicating the products already stored in a local database.
const add = productsDb.prepare('INSERT OR IGNORE INTO products (name, category, colour, price, image_url, alt_text, badge) VALUES (?, ?, ?, ?, ?, ?, ?)');
const catalogue = [
    ['Mira Cotton Shirt','women','Cloud White',3299,'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=900&q=85','Woman wearing a white cotton shirt','New'],
    ['Elara Ribbed Top','women','Cocoa',3099,'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85','Woman wearing a brown top',null],
    ['Sora Linen Trousers','women','Sand',3899,'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85','Woman in tailored beige trousers','New'],
    ['Aster Midi Skirt','women','Olive',3499,'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=900&q=85','Woman wearing an olive skirt',null],
    ['Arlo Oxford Shirt','men','Sky Blue',3399,'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85','Man wearing a blue Oxford shirt','New'],
    ['Nolan Knit Polo','men','Stone',3799,'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=85','Man wearing a knit polo',null],
    ['Kai Tapered Chinos','men','Ink',3999,'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85','Man in dark tapered chinos',null],
    ['Rowan Everyday Tee','men','Sage',3099,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85','Green everyday t-shirt','New'],
    ['Form Canvas Tote','accessories','Natural',3199,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85','Natural canvas tote bag',null],
    ['Mara Leather Belt','accessories','Chestnut',3599,'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=85','Brown leather belt',null],
    ['Vela Silk Scarf','accessories','Terracotta',3299,'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=85','Terracotta silk scarf','Limited'],
  ['Noma Cap','accessories','Black',3099,'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=85','Black cotton cap',null],
  ['Isla Merino Cardigan','women','Oatmeal',3999,'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=85','Woman wearing an oatmeal cardigan','New'],
  ['Cleo Wrap Dress','women','Mulberry',3899,'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85','Woman wearing a mulberry wrap dress',null],
  ['June Poplin Blouse','women','Soft Blue',3299,'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85','Woman wearing a soft blue blouse',null],
  ['Noa Relaxed Blazer','women','Charcoal',3999,'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=900&q=85','Woman wearing a charcoal blazer','Limited'],
  ['Theo Overshirt','men','Rust',3899,'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=85','Man wearing a rust overshirt','New'],
  ['Milo Merino Crew','men','Bordeaux',3699,'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=900&q=85','Man wearing a burgundy crewneck',null],
  ['Ezra Straight Denim','men','Indigo',3999,'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85','Indigo straight-leg denim',null],
  ['Finn Utility Jacket','men','Moss',3999,'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85','Man wearing a moss utility jacket','Limited'],
  ['Ari Ribbed Beanie','accessories','Camel',3099,'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=900&q=85','Camel ribbed knit beanie','New'],
  ['Sol Sunglasses','accessories','Tortoise',3799,'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85','Tortoiseshell sunglasses',null],
  ['Lune Card Holder','accessories','Espresso',3399,'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85','Espresso leather card holder',null],
  ['Onda Weekender','accessories','Slate',3999,'https://images.unsplash.com/photo-1553531889-56ff0a9e7d98?auto=format&fit=crop&w=900&q=85','Slate canvas weekender bag','New']
];
productsDb.exec('BEGIN'); try { catalogue.forEach(product => add.run(...product)); productsDb.exec('COMMIT'); } catch (error) { productsDb.exec('ROLLBACK'); throw error; }
module.exports = { getAllProducts: () => productsDb.prepare('SELECT * FROM products ORDER BY id').all() };
