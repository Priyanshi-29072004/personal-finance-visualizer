import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Budget from '../../../models/Budget';
import { CATEGORIES } from '../../../constants/categories';

// GET all budgets for the current month
export async function GET() {
  try {
    console.log('GET /api/budgets - Starting request');
    const db = await connectDB();
    console.log('Database connected, fetching budgets...');
    
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const budgets = await Budget.find({
      month: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });
    
    console.log(`Successfully fetched ${budgets.length} budgets`);
    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error in GET /api/budgets:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// POST new budget
export async function POST(request) {
  try {
    console.log('POST /api/budgets - Starting request');
    const db = await connectDB();
    console.log('Database connected, processing request...');
    
    const data = await request.json();
    console.log('Received budget data:', data);
    
    // Validate required fields
    if (!data.amount || !data.category) {
      console.log('Validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'Amount and category are required' },
        { status: 400 }
      );
    }
    
    // Validate category
    if (!CATEGORIES.includes(data.category)) {
      console.log('Validation failed: Invalid category');
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }
    
    // Validate amount
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      console.log('Validation failed: Invalid amount');
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }
    
    // Set the month to the first day of the current month
    const currentDate = new Date();
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const budget = await Budget.create({
      ...data,
      amount,
      month,
      year: currentDate.getFullYear()
    });
    
    console.log('Budget created successfully:', budget);
    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/budgets:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A budget for this category already exists for this month' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
} 