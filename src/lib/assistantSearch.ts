type SearchProduct = { id: string; name: string; category: string; description?: string | null; is_active: boolean; stock: number };
const stopWords = new Set(['a','an','the','for','of','to','and','i','need','want','please','find','me','some','buy','get','show']);
export const searchTerms = (query: string) => query.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.filter(word => !stopWords.has(word)) ?? [];
export function matchCatalog<T extends SearchProduct>(query: string, products: T[]) {
  const terms = searchTerms(query);
  if (!terms.length) return [];
  return products.filter(p => p.is_active && p.stock > 0).map(product => {
    const name = product.name.toLowerCase();
    const category = product.category.toLowerCase();
    const score = terms.reduce((sum, term) => sum + (name.includes(term) ? 4 : category.includes(term) ? 2 : 0), 0);
    return { product, score };
  }).filter(p => p.score > 0).sort((a,b) => b.score - a.score).slice(0,8).map(p => p.product);
}
export function isDirectSearch(query: string, products: SearchProduct[]) {
  const terms = searchTerms(query);
  return terms.length > 0 && terms.length <= 3 && products.some(p => p.is_active && p.stock > 0 && terms.every(t => p.name.toLowerCase().includes(t)));
}