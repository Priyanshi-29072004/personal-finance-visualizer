'use client'

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CATEGORIES } from '../../constants/categories';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Other'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [budgetsResponse, transactionsResponse] = await Promise.all([
        fetch('/api/budgets'),
        fetch('/api/transactions')
      ]);

      const budgetsData = await budgetsResponse.json();
      const transactionsData = await transactionsResponse.json();

      setBudgets(budgetsData);
      setTransactions(transactionsData);
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || !formData.category) {
      setError('All fields are required');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create budget');
      }

      const newBudget = await response.json();
      setBudgets([...budgets, newBudget]);
      setFormData({
        amount: '',
        category: 'Other'
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = async (budget) => {
    setEditingBudget(budget);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    if (!editingBudget.amount) {
      setError('Amount is required');
      return;
    }

    const amount = parseFloat(editingBudget.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    try {
      const response = await fetch(`/api/budgets/${editingBudget._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update budget');
      }

      const updatedBudget = await response.json();
      setBudgets(budgets.map(b => 
        b._id === updatedBudget._id ? updatedBudget : b
      ));
      setEditingBudget(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      setBudgets(budgets.filter(b => b._id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  // Calculate budget vs actual spending
  const budgetComparison = CATEGORIES.map(category => {
    const budget = budgets.find(b => b.category === category);
    const actual = transactions
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      category,
      budget: budget?.amount || 0,
      actual,
      remaining: (budget?.amount || 0) - actual,
      budgetId: budget?._id
    };
  });

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Budget Management</h1>
      </div>

      {/* Add Budget Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Set Monthly Budget</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Budget Amount
            </label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter amount"
              step="0.01"
            />
          </div>

          <div className="md:col-span-2">
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
            >
              Set Budget
            </button>
          </div>
        </form>
      </div>

      {/* Budget vs Actual Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Budget vs Actual Spending</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" name="Budget" fill="#4F46E5" />
              <Bar dataKey="actual" name="Actual" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Details Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Budget Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgetComparison.map((item) => (
                <tr key={item.category} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.budget.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.actual.toFixed(2)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    item.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${item.remaining.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {item.budgetId && (
                      <>
                        <button
                          onClick={() => handleEdit(budgets.find(b => b._id === item.budgetId))}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.budgetId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Edit Budget</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editingBudget.category}
                  disabled
                  className="w-full p-2 border rounded bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={editingBudget.amount}
                  onChange={(e) => setEditingBudget({ ...editingBudget, amount: e.target.value })}
                  className="w-full p-2 border rounded"
                  step="0.01"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingBudget(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 