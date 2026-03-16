export const PLATFORM_MARGIN = 6500;
export const TOTAL_REVENUE = 42850;
export const TOTAL_PROFIT = TOTAL_REVENUE - PLATFORM_MARGIN;

export const REVENUE_BY_TIMEFRAME = {
  weekly: 12450,
  monthly: 42850,
  yearly: 310000
};

export const PREVIOUS_ACTIVE_LISTINGS = 12; // Mock previous count for percentage calculation

export const MONTHLY_DATA = [
  { month: 'Jan', revenue: 3200 },
  { month: 'Feb', revenue: 3850 },
  { month: 'Mar', revenue: 4700 },
  { month: 'Apr', revenue: 5200 },
  { month: 'May', revenue: 5950 },
  { month: 'Jun', revenue: 6400 },
  { month: 'Jul', revenue: 6800 },
  { month: 'Aug', revenue: 6750 }, // Adjusted to sum to 42850
].map(item => ({
  ...item,
  profit: Math.round(item.revenue * (TOTAL_PROFIT / TOTAL_REVENUE))
}));

export const YEARLY_DATA = [
  { year: '2021', revenue: 28000, profit: 24000 },
  { year: '2022', revenue: 35000, profit: 30000 },
  { year: '2023', revenue: 38000, profit: 32500 },
  { year: '2024', revenue: TOTAL_REVENUE, profit: TOTAL_PROFIT },
];

export const SALES_HISTORY = [
  { date: '2024-08-14', time: '06:10 PM', item: 'Brass Diya Set', buyer: 'Meera Iyer', price: 8000 },
  { date: '2024-08-12', time: '01:30 PM', item: 'Embroidered Cushion', buyer: 'Amit Das', price: 5000 },
  { date: '2024-08-10', time: '09:20 AM', item: 'Beaded Necklace', buyer: 'Sonia Verma', price: 4500 },
  { date: '2024-08-08', time: '04:45 PM', item: 'Wooden Elephant', buyer: 'Vikram Mehta', price: 7200 },
  { date: '2024-08-05', time: '11:00 AM', item: 'Silk Saree', buyer: 'Anjali Gupta', price: 10500 },
  { date: '2024-08-02', time: '02:15 PM', item: 'Terracotta Pot', buyer: 'Priya Singh', price: 4850 },
  { date: '2024-08-01', time: '10:30 AM', item: 'Bamboo Basket', buyer: 'Rahul Sharma', price: 2800 },
].map(sale => {
  const margin = Math.round(sale.price * (PLATFORM_MARGIN / TOTAL_REVENUE));
  return {
    ...sale,
    fee: margin,
    profit: sale.price - margin
  };
});
