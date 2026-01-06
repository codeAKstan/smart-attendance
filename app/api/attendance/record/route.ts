import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';

// GET: Fetch attendance count for a session
export async function GET(req: Request) {
  await dbConnect();
  
  const { searchParams } = new URL(req.url);
  const sessionCode = searchParams.get('sessionCode');

  if (!sessionCode) {
    return NextResponse.json({ error: 'Session code is required' }, { status: 400 });
  }

  try {
    // Count attendance records for this session
    const count = await Attendance.countDocuments({ sessionCode });
    
    // If details are requested, fetch the list of students
    let students = [];
    if (searchParams.get('includeDetails') === 'true') {
      // Find attendance records and populate the studentId field to get the user's studentId string
      const records = await Attendance.find({ sessionCode })
        .populate('studentId', 'studentId') // Populate the referenced User document, selecting only 'studentId'
        .sort({ timestamp: -1 });

      // Transform the result to return the actual student ID string instead of the ObjectId
      students = records.map(record => ({
        studentName: record.studentName,
        studentId: (record.studentId as any)?.studentId || 'N/A', // Access the populated field
        timestamp: record.timestamp
      }));
    }

    return NextResponse.json({ count, students }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Record student attendance
export async function POST(req: Request) {
  await dbConnect();

  try {
    const { studentId, studentName, courseCode, sessionCode } = await req.json();

    if (!studentId || !courseCode || !sessionCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already checked in
    const existing = await Attendance.findOne({ studentId, sessionCode });
    if (existing) {
      return NextResponse.json({ message: 'Already checked in' }, { status: 200 });
    }

    const attendance = await Attendance.create({
      studentId,
      studentName: studentName || 'Unknown Student',
      courseCode,
      sessionCode,
    });

    return NextResponse.json({ 
      message: 'Attendance recorded successfully',
      attendance 
    }, { status: 201 });

  } catch (error: any) {
    // Handle duplicate key error gracefully if race condition occurs
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Already checked in' }, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
