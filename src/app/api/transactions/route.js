import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Transaction from '../../../models/Transaction';
import { CATEGORIES } from '../../../constants/categories';

// GET all transactions
export async function GET() {
  try {
    console.log('GET /api/transactions - Starting request');
    const db = await connectDB();
    console.log('Database connected, fetching transactions...');
    
    const transactions = await Transaction.find().sort({ date: -1 });
    console.log(`Successfully fetched ${transactions.length} transactions`);
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error in GET /api/transactions:', error);
    
    // Log detailed error information
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    if (error.name === 'MongoServerError' || error.name === 'MongoNetworkError') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// POST new transaction
export async function POST(request) {
  try {
    console.log('POST /api/transactions - Starting request');
    const db = await connectDB();
    console.log('Database connected, processing request...');
    
    const data = await request.json();
    console.log('Received transaction data:', data);
    
    // Validate required fields
    if (!data.amount || !data.date || !data.description || !data.category) {
      console.log('Validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate category
    if (data.category && !CATEGORIES.includes(data.category)) {
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
    
    const transaction = await Transaction.create({
      ...data,
      amount,
      date: new Date(data.date)
    });
    
    console.log('Transaction created successfully:', transaction);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/transactions:', error);
    
    // Log detailed error information
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    if (error.name === 'MongoServerError' || error.name === 'MongoNetworkError') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 503 }
      );
    }
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
} 