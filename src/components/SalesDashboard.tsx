import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  IndianRupee, 
  TrendingUp, 
  ShoppingBag, 
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { User, Language } from '../types';
import { useTranslation } from '../translations';

import { 
  TOTAL_REVENUE, 
  TOTAL_PROFIT, 
  MONTHLY_DATA, 
  YEARLY_DATA, 
  SALES_HISTORY,
  REVENUE_BY_TIMEFRAME,
  PLATFORM_MARGIN
} from '../constants/financial';

export const SalesDashboard = ({ user, onBack }: { user: User, onBack: () => void }) => {
  const t = useTranslation(user.language || Language.ENGLISH);
  const [timeframe, setTimeframe] = React.useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const totalRevenue = REVENUE_BY_TIMEFRAME[timeframe];
  const totalProfit = totalRevenue - (PLATFORM_MARGIN * (totalRevenue / TOTAL_REVENUE));
  const itemsSold = Math.round(SALES_HISTORY.length * (totalRevenue / TOTAL_REVENUE));

  return (
    <div className="p-6 space-y-8 pb-32">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Sales Dashboard</h2>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Financial Performance</p>
              <span className="w-1 h-1 rounded-full bg-[var(--glass-border)]" />
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="text-[10px] font-mono bg-transparent border-none text-cyan-400 focus:ring-0 cursor-pointer outline-none uppercase tracking-widest"
              >
                <option value="weekly" className="bg-[var(--nav-bg)]">Weekly</option>
                <option value="monthly" className="bg-[var(--nav-bg)]">Monthly</option>
                <option value="yearly" className="bg-[var(--nav-bg)]">Yearly</option>
              </select>
            </div>
          </div>
        </div>
        <button className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-400">
          <Download size={20} />
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 space-y-3 border-cyan-500/20 bg-cyan-500/5"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
              <IndianRupee size={20} />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-mono">
              <ArrowUpRight size={12} />
              <span>+12.5%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Total Revenue</p>
            <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5 space-y-3 border-emerald-500/20 bg-emerald-500/5"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <TrendingUp size={20} />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-mono">
              <ArrowUpRight size={12} />
              <span>+15.2%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Total Profit</p>
            <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">₹{totalProfit.toLocaleString()}</p>
            <p className="text-[8px] font-mono text-[var(--text-muted)] mt-1 uppercase tracking-wider">Profit after platform and logistics fees</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5 space-y-3 border-purple-500/20 bg-purple-500/5"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
              <ShoppingBag size={20} />
            </div>
            <div className="flex items-center gap-1 text-rose-400 text-[10px] font-mono">
              <ArrowDownRight size={12} />
              <span>-2.1%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Items Sold</p>
            <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{itemsSold}</p>
          </div>
        </motion.div>
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Monthly Earnings</h3>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)]">
              <Calendar size={12} />
              <span>Last 6 Months</span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--nav-bg)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#06b6d4" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  fill="transparent" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Yearly Growth</h3>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)]">
              <TrendingUp size={12} />
              <span>5 Year Trend</span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={YEARLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--glass-bg)' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--nav-bg)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Payment History</h3>
          <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <Filter size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--glass-bg)] text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Buyer</th>
                <th className="px-6 py-4 font-medium text-right">Price</th>
                <th className="px-6 py-4 font-medium text-right">Fee</th>
                <th className="px-6 py-4 font-medium text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {SALES_HISTORY.map((sale, i) => (
                <tr key={i} className="hover:bg-[var(--glass-bg)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-[var(--text-primary)]">{sale.date}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{sale.time}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-[var(--text-primary)]">{sale.item}</td>
                  <td className="px-6 py-4 text-xs text-[var(--text-secondary)]">{sale.buyer}</td>
                  <td className="px-6 py-4 text-xs font-mono text-right text-[var(--text-primary)]">₹{sale.price}</td>
                  <td className="px-6 py-4 text-xs font-mono text-right text-rose-400">-₹{sale.fee}</td>
                  <td className="px-6 py-4 text-xs font-mono text-right text-emerald-400 font-bold">₹{sale.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
