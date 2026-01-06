import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    let query: any = {};
    if (role && role !== 'ALL') {
      query.role = role;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      studentId: user.studentId
    }));

    return NextResponse.json({ users: formattedUsers }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
