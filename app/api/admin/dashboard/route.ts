import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import CourseRequest from '@/models/CourseRequest';
import Attendance from '@/models/Attendance';

export async function GET(req: Request) {
  await dbConnect();

  try {
    // 1. Get total counts
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalLecturers = await User.countDocuments({ role: 'LECTURER' });
    const activeCourses = await CourseRequest.countDocuments({ status: 'APPROVED' });
    
    // 2. Calculate Check-ins (Total Attendance Records)
    const totalCheckins = await Attendance.countDocuments();

    // 3. Get Recent Activity
    // Fetch recent attendance
    const recentAttendance = await Attendance.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('studentId', 'name studentId');

    // Fetch recent course approvals (simulating "Class Started" type events or just recent approvals)
    // For now, let's just mix in recent attendance as the primary activity source
    const activities = recentAttendance.map((record: any) => ({
      title: 'New Check-in',
      desc: `${record.studentName || 'Student'} (${record.studentId?.studentId || 'N/A'}) checked in to ${record.courseCode}`,
      time: record.createdAt,
      type: 'CHECKIN'
    }));

    // 4. Calculate Attendance Overview (Simple Weekly Data)
    // For simplicity, we'll just return mock data for the chart or calculate real daily counts if needed.
    // Let's do real daily counts for the last 7 days.
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
    }).reverse();

    const chartData = await Promise.all(last7Days.map(async (date) => {
        const start = new Date(date.setHours(0, 0, 0, 0));
        const end = new Date(date.setHours(23, 59, 59, 999));
        const count = await Attendance.countDocuments({
            createdAt: { $gte: start, $lte: end }
        });
        return {
            day: start.toLocaleDateString('en-US', { weekday: 'short' }),
            count
        };
    }));

    return NextResponse.json({
      stats: {
        students: totalStudents,
        lecturers: totalLecturers,
        courses: activeCourses,
        checkins: totalCheckins
      },
      recentActivity: activities,
      chartData
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
