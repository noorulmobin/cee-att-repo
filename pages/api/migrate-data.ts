import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../src/lib/supabase';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Read existing users from local JSON file
    const usersPath = path.join(process.cwd(), 'src', 'data', 'users.json');
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);

    // Read existing attendance data
    const attendancePath = path.join(process.cwd(), 'data', 'attendance.csv');
    const attendanceData = fs.readFileSync(attendancePath, 'utf8');
    const attendanceRows = attendanceData.split('\n').slice(1); // Skip header

    let migratedUsers = 0;
    let migratedAttendance = 0;

    // Migrate users
    for (const user of users) {
      try {
        const { error } = await supabase
          .from('users')
          .insert([{
            username: user.username,
            password: user.password,
            name: user.name,
            email: user.email,
            role: user.role || 'user'
          }]);

        if (!error) {
          migratedUsers++;
        }
      } catch (err) {
        console.log(`User ${user.username} already exists or error:`, err);
      }
    }

    // Migrate attendance data
    for (const row of attendanceRows) {
      if (row.trim()) {
        const [username, action, timestamp, activityDescription] = row.split(',');
        try {
          const { error } = await supabase
            .from('attendance')
            .insert([{
              username: username.trim(),
              action: action.trim(),
              timestamp: timestamp.trim(),
              activity_description: activityDescription.trim()
            }]);

          if (!error) {
            migratedAttendance++;
          }
        } catch (err) {
          console.log(`Attendance record error:`, err);
        }
      }
    }

    return res.status(200).json({
      message: 'Migration completed',
      migratedUsers,
      migratedAttendance
    });

  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ message: 'Migration failed' });
  }
}
