import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import CourseRequest from '@/models/CourseRequest';

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const lecturerId = searchParams.get('lecturerId');

    if (!lecturerId) {
      return NextResponse.json({ error: 'Lecturer ID is required' }, { status: 400 });
    }

    // 1. Get all courses taught by this lecturer
    // We remove the status check for now to ensure we see history even if course status is weird
    const courses = await CourseRequest.find({
      lecturerId,
      // status: 'APPROVED', // Commented out to debug if status is the issue
    }).select('courseCode courseName');

    const courseCodes = courses.map(c => c.courseCode);

    // 2. Aggregate attendance records by session
    // NOTE: We match by courseCode if found, otherwise we might want to show all if debugging
    // But strict matching is better. 
    // DEBUG: Let's log the courseCodes we are looking for
    console.log('Fetching history for courses:', courseCodes);

    // If no courses found, try to find ANY attendance for this lecturer's probable courses
    // This is a fallback if the course mapping is broken
    let matchStage: any = {};
    if (courseCodes.length > 0) {
        // If we have courses, match loosely (case insensitive)
        const regexCodes = courseCodes.map(code => new RegExp(`^${code}$`, 'i'));
        matchStage = { courseCode: { $in: regexCodes } };
    } else {
        // If no courses assigned to lecturer, we can't show history
        // UNLESS we want to debug and show ALL attendance? No, that's unsafe.
        return NextResponse.json({ history: [] }, { status: 200 });
    }
    
    // DEBUG: Let's log the match stage
    console.log('Match Stage:', matchStage);

    const history = await Attendance.aggregate([
      {
        $match: matchStage
      },
      {
        $group: {
          _id: "$sessionCode",
          courseCode: { $first: "$courseCode" },
          timestamp: { $min: "$timestamp" }, // Use the first check-in time as session start
          attendees: { $sum: 1 }
        }
      },
      {
        $sort: { timestamp: -1 }
      }
    ]);

    // 3. Map course names to the history items
    const historyWithDetails = history.map(item => {
      // Find course case-insensitively if needed
      const course = courses.find(c => c.courseCode.toLowerCase() === item.courseCode.toLowerCase());
      return {
        ...item,
        courseName: course?.courseName || item.courseCode,
        sessionCode: item._id
      };
    });

    return NextResponse.json({ history: historyWithDetails }, { status: 200 });
  } catch (error: any) {
    console.error('History API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
