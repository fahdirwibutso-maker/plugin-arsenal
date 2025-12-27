export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

export const products: Product[] = [
  // Fresh Fruits
  { id: 1, name: "Organic Apples", price: 4.99, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop", category: "Fresh Fruits" },
  { id: 2, name: "Bananas", price: 2.49, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop", category: "Fresh Fruits" },
  { id: 3, name: "Fresh Oranges", price: 5.99, image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop", category: "Fresh Fruits" },
  { id: 4, name: "Strawberries", price: 6.99, image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop", category: "Fresh Fruits" },
  { id: 5, name: "Grapes", price: 7.99, image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=400&fit=crop", category: "Fresh Fruits" },
  { id: 6, name: "Watermelon", price: 8.99, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop", category: "Fresh Fruits" },
  
  // Vegetables
  { id: 7, name: "Fresh Tomatoes", price: 3.99, image: "https://images.unsplash.com/photo-1546470427-227c7369a9b0?w=400&h=400&fit=crop", category: "Vegetables" },
  { id: 8, name: "Carrots", price: 2.99, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop", category: "Vegetables" },
  { id: 9, name: "Lettuce", price: 2.49, image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=400&fit=crop", category: "Vegetables" },
  { id: 10, name: "Onions", price: 1.99, image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=400&fit=crop", category: "Vegetables" },
  { id: 11, name: "Potatoes 5kg", price: 6.99, image: "https://images.unsplash.com/photo-1518977676601-b53f82ber46b?w=400&h=400&fit=crop", category: "Vegetables" },
  { id: 12, name: "Bell Peppers", price: 4.99, image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop", category: "Vegetables" },
  
  // Dairy
  { id: 13, name: "Fresh Milk 2L", price: 3.49, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop", category: "Dairy" },
  { id: 14, name: "Cheddar Cheese", price: 6.99, image: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&h=400&fit=crop", category: "Dairy" },
  { id: 15, name: "Greek Yogurt", price: 4.49, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop", category: "Dairy" },
  { id: 16, name: "Butter", price: 5.99, image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop", category: "Dairy" },
  { id: 17, name: "Eggs (12 pack)", price: 4.99, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop", category: "Dairy" },
  { id: 18, name: "Ice Cream", price: 7.99, image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=400&fit=crop", category: "Dairy" },
  
  // Meat & Seafood
  { id: 19, name: "Fresh Chicken", price: 12.99, image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop", category: "Meat" },
  { id: 20, name: "Ground Beef", price: 15.99, image: "https://images.unsplash.com/photo-1602473812169-67348ed554fe?w=400&h=400&fit=crop", category: "Meat" },
  { id: 21, name: "Pork Chops", price: 14.99, image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=400&fit=crop", category: "Meat" },
  { id: 22, name: "Salmon Fillet", price: 18.99, image: "https://images.unsplash.com/photo-1499125562588-29fb8a56b5d5?w=400&h=400&fit=crop", category: "Meat" },
  { id: 23, name: "Shrimp", price: 16.99, image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=400&fit=crop", category: "Meat" },
  
  // Bakery
  { id: 24, name: "Whole Wheat Bread", price: 2.99, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop", category: "Bakery" },
  { id: 25, name: "Croissants", price: 5.99, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop", category: "Bakery" },
  { id: 26, name: "Bagels", price: 4.49, image: "https://images.unsplash.com/photo-1585535079140-aaa1f0067989?w=400&h=400&fit=crop", category: "Bakery" },
  { id: 27, name: "Donuts (6 pack)", price: 6.99, image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop", category: "Bakery" },
  { id: 28, name: "Dinner Rolls", price: 3.99, image: "https://images.unsplash.com/photo-1586765501019-cbe3973ef8fa?w=400&h=400&fit=crop", category: "Bakery" },
  
  // Beverages
  { id: 29, name: "Orange Juice 2L", price: 5.99, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop", category: "Beverages" },
  { id: 30, name: "Coca Cola 2L", price: 3.99, image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=400&fit=crop", category: "Beverages" },
  { id: 31, name: "Pepsi 2L", price: 3.99, image: "https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=400&h=400&fit=crop", category: "Beverages" },
  { id: 32, name: "Sprite 2L", price: 3.99, image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=400&fit=crop", category: "Beverages" },
  { id: 33, name: "Bottled Water (24pk)", price: 7.99, image: "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400&h=400&fit=crop", category: "Beverages" },
  { id: 34, name: "Energy Drink", price: 2.99, image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&h=400&fit=crop", category: "Beverages" },
  { id: 35, name: "Coffee Beans", price: 12.99, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop", category: "Beverages" },
  { id: 36, name: "Tea Bags", price: 4.99, image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop", category: "Beverages" },
  
  // Pantry
  { id: 37, name: "White Rice 5kg", price: 12.99, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop", category: "Pantry" },
  { id: 38, name: "Pasta", price: 1.99, image: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop", category: "Pantry" },
  { id: 39, name: "Olive Oil", price: 9.99, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop", category: "Pantry" },
  { id: 40, name: "Sugar 2kg", price: 4.99, image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop", category: "Pantry" },
  { id: 41, name: "Flour 2kg", price: 3.99, image: "https://images.unsplash.com/photo-1556040220-4096d522378d?w=400&h=400&fit=crop", category: "Pantry" },
  { id: 42, name: "Canned Tomatoes", price: 2.49, image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=400&h=400&fit=crop", category: "Pantry" },
  { id: 43, name: "Peanut Butter", price: 5.99, image: "https://images.unsplash.com/photo-1587232151437-3c9c91b9f9b0?w=400&h=400&fit=crop", category: "Pantry" },
  { id: 44, name: "Honey", price: 8.99, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop", category: "Pantry" },
  
  // Snacks
  { id: 45, name: "Potato Chips", price: 3.99, image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop", category: "Snacks" },
  { id: 46, name: "Chocolate Bar", price: 1.99, image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=400&fit=crop", category: "Snacks" },
  { id: 47, name: "Cookies", price: 4.49, image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop", category: "Snacks" },
  { id: 48, name: "Nuts Mix", price: 6.99, image: "https://images.unsplash.com/photo-1536591375006-77e7f4c18816?w=400&h=400&fit=crop", category: "Snacks" },
  { id: 49, name: "Popcorn", price: 2.99, image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&h=400&fit=crop", category: "Snacks" },
  
  // Frozen Foods
  { id: 50, name: "Frozen Pizza", price: 7.99, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop", category: "Frozen" },
  { id: 51, name: "Frozen Vegetables", price: 4.99, image: "https://images.unsplash.com/photo-1580910051074-3eb694886f0b?w=400&h=400&fit=crop", category: "Frozen" },
  { id: 52, name: "French Fries", price: 3.99, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop", category: "Frozen" },
  { id: 53, name: "Ice Cream Bars", price: 5.99, image: "https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?w=400&h=400&fit=crop", category: "Frozen" },
  
  // Household
  { id: 54, name: "Paper Towels", price: 8.99, image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop", category: "Household" },
  { id: 55, name: "Toilet Paper (12pk)", price: 12.99, image: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400&h=400&fit=crop", category: "Household" },
  { id: 56, name: "Dish Soap", price: 3.99, image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&h=400&fit=crop", category: "Household" },
  { id: 57, name: "Laundry Detergent", price: 14.99, image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop", category: "Household" },
  
  // Personal Care
  { id: 58, name: "Shampoo", price: 6.99, image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop", category: "Personal Care" },
  { id: 59, name: "Toothpaste", price: 4.99, image: "https://images.unsplash.com/photo-1559300079-7a3fc1a8e5b6?w=400&h=400&fit=crop", category: "Personal Care" },
  { id: 60, name: "Body Soap", price: 3.99, image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=400&fit=crop", category: "Personal Care" },
];

export const categories = [
  "All",
  "Fresh Fruits",
  "Vegetables",
  "Dairy",
  "Meat",
  "Bakery",
  "Beverages",
  "Pantry",
  "Snacks",
  "Frozen",
  "Household",
  "Personal Care",
];

export const featuredProductIds = [1, 13, 24, 29, 19, 4, 14, 30];

export const getFeaturedProducts = (): Product[] => {
  return products.filter((p) => featuredProductIds.includes(p.id));
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === "All") return products;
  return products.filter((p) => p.category === category);
};

export const getProductById = (id: number): Product | undefined => {
  return products.find((p) => p.id === id);
};
