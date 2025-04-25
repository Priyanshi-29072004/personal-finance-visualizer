'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Home() {
  const [transactions, setTransactions] = useState([])
  const [formData, setFormData] = useState({
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      const data = await response.json()
      setTransactions(Array.isArray(data) ? data : [])
    } catch (error) {
      setError('Failed to fetch transactions')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.amount || !formData.date || !formData.description) {
      setError('All fields are required')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number')
      return
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount,
          date: new Date(formData.date)
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create transaction')
      }

      const newTransaction = await response.json()
      setTransactions([newTransaction, ...transactions])
      setFormData({
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: ''
      })
    } catch (error) {
      setError(error.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete transaction')
      }

      setTransactions(transactions.filter(t => t._id !== id))
    } catch (error) {
      setError(error.message)
    }
  }

  const monthlyData = Array.isArray(transactions) ? transactions.reduce((acc, transaction) => {
    const month = format(new Date(transaction.date), 'MMM yyyy')
    if (!acc[month]) {
      acc[month] = 0
    }
    acc[month] += transaction.amount
    return acc
  }, {}) : {}

  const chartData = Object.entries(monthlyData).map(([month, amount]) => ({
    month,
    amount
  }))

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Personal Finance Visualizer</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Enter amount"
            step="0.01"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Enter description"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add Transaction
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Monthly Expenses</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-4 bg-white rounded shadow"
            >
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                <button
                  onClick={() => handleDelete(transaction._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-gray-500 text-center py-4">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  )
} 