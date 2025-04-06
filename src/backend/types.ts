export interface User {
  user_id: string;
  user_role: string;
  department?: string;
  employee_status?: string;
  time_in_position?: string;
  location?: string;
  last_security_training?: string;
  employee_join_date?: string;
  region?: string;
  past_violations?: number;
}

export interface AccessRequest {
  request_id: string;
  timestamp: string;
  user_id: string;
  resource_type: string;
  resource_sensitivity: string;
  action: string;
  request_reason: string;
  is_approved: boolean;
} 