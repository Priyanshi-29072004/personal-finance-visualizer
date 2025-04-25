import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CATEGORY_COLORS } from '../../constants/categories';
import { format } from 'date-fns';

export default function Dashboard({ transactions }) {
  // Calculate summary data
  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  const categoryData = transactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += transaction.amount;
    return acc;
  }, {});

  const pieChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));

  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = format(new Date(transaction.date), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += transaction.amount;
    return acc;
  }, {});

  const chartData = Object.entries(monthlyData).map(([month, amount]) => ({
    month,
    amount
  }));

  // Get most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Categories</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{Object.keys(categoryData).length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Transactions</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{transactions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Average Transaction</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            ${transactions.length ? (totalExpenses / transactions.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Expenses Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Monthly Expenses</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <a href="/transactions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All →
          </a>
        </div>
        <div className="space-y-2">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(transaction.date), 'MMM dd, yyyy')} • {transaction.category}
                </p>
              </div>
              <p className="font-medium">${transaction.amount.toFixed(2)}</p>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <p className="text-gray-500 text-center py-4">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
} 