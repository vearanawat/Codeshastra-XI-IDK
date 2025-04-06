import fs from 'fs';
import { createReadStream } from 'fs';
import csvParser from 'csv-parser';
import supabase from '../supabase/client';

export async function importUsersFromCSV(filePath: string) {
  const results: any[] = [];
  
  return new Promise((resolve, reject) => {
    createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => {
        // Process each row of the CSV file
        // Extract only the columns needed for users table
        const user = {
          user_id: data.user_id,
          user_role: data.user_role,
          department: data.department,
          employee_status: data.employee_status,
          time_in_position: data.time_in_position,
          location: data.location,
          last_security_training: data.last_security_training === 'Never' ? null : data.last_security_training,
          employee_join_date: data.employee_join_date === 'invalid_date' ? null : data.employee_join_date,
          region: data.region,
          past_violations: parseInt(data.past_violations, 10) || 0,
        };
        
        if (user.user_id) {
          results.push(user);
        }
      })
      .on('end', async () => {
        try {
          // Deduplicate users by user_id
          const uniqueUsers = [...new Map(results.map(user => [user.user_id, user])).values()];
          
          // Insert users into Supabase
          const { data, error } = await supabase.from('users').upsert(uniqueUsers, {
            onConflict: 'user_id',
            ignoreDuplicates: false,
          });
          
          if (error) {
            reject(error);
          } else {
            resolve({ success: true, count: uniqueUsers.length });
          }
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

export async function importAccessRequestsFromCSV(filePath: string) {
  const results: any[] = [];
  
  return new Promise((resolve, reject) => {
    createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => {
        // Process each row of the CSV file
        const accessRequest = {
          request_id: data.request_id,
          timestamp: data.timestamp === 'invalid_date' ? null : data.timestamp,
          user_id: data.user_id,
          resource_type: data.resource_type,
          resource_sensitivity: data.resource_sensitivity,
          action: data.action,
          request_reason: data.request_reason,
          is_approved: data.is_approved === '1', // Convert to boolean
        };
        
        if (accessRequest.request_id) {
          results.push(accessRequest);
        }
      })
      .on('end', async () => {
        try {
          // Insert access requests into Supabase
          const { data, error } = await supabase.from('access_requests').upsert(results, {
            onConflict: 'request_id',
            ignoreDuplicates: false,
          });
          
          if (error) {
            reject(error);
          } else {
            resolve({ success: true, count: results.length });
          }
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
} 