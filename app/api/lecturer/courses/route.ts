import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CourseRequest from '@/models/CourseRequest';
import Attendance from '@/models/Attendance';

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const lecturerId = searchParams.get('lecturerId');

    if (!lecturerId) {
      return NextResponse.json({ error: 'Lecturer ID is required' }, { status: 400 });
    }

    const courses = await CourseRequest.find({
      lecturerId,
      status: 'APPROVED',
    }).sort({ createdAt: -1 });

    // Calculate unique students who have attended any of these courses
    const courseCodes = courses.map(c => c.courseCode);
    const uniqueStudents = await Attendance.distinct('studentId', {
      courseCode: { $in: courseCodes }
    });

    return NextResponse.json({ 
      courses,
      totalStudents: uniqueStudents.length 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
