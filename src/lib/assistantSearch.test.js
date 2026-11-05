import { test, expect } from 'bun:test';
import { matchCatalog, isDirectSearch } from './assistantSearch';
const products = [
  {id:'milk',name:'Fresh milk',category:'Dairy',is_active:true,stock:5},
  {id:'hidden',name:'Milk powder',category:'Dairy',is_active:false,stock:10},
  {id:'empty',name:'Milk carton',category:'Dairy',is_active:true,stock:0},
  {id:'tea',name:'Black tea',category:'Drinks',is_active:true,stock:10},
];
test('immediate searches exclude hidden and unavailable products',()=>{expect(matchCatalog('find me milk',products).map(p=>p.id)).toEqual(['milk']);});
test('simple product searches skip AI but planning requests do not',()=>{expect(isDirectSearch('find milk',products)).toBe(true);expect(isDirectSearch('Ingredients for a family breakfast',products)).toBe(false);});
test('unmatched searches never invent a result',()=>{expect(matchCatalog('rice',products)).toEqual([]);expect(isDirectSearch('rice',products)).toBe(false);});