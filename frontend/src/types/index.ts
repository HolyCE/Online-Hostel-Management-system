export type UserRole = 'student' | 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  matricNumber?: string;
  phone?: string;
  gender?: 'male' | 'female';
  avatar?: string;
  roomId?: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

export interface Room {
  id: string;
  number: string;
  block: string;
  floor: number;
  capacity: number;
  currentOccupants: number;
  price: number;
  type: 'Standard' | 'Deluxe' | 'Suite';
  status: 'available' | 'occupied' | 'maintenance';
  genderRestriction: 'male' | 'female' | 'mixed';
  amenities: string[];
  image?: string;
  occupants?: User[];
}

export interface Payment {
  id: string;
  reference: string;
  studentId: string;
  studentName: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  date: string;
  method: 'card' | 'bank_transfer' | 'paystack';
  session: string;
}

export interface TicketComment {
  id: string;
  author: string;
  authorRole: UserRole;
  content: string;
  date: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: 'electrical' | 'plumbing' | 'furniture' | 'cleaning' | 'security' | 'other';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'in-progress' | 'resolved';
  studentId: string;
  studentName: string;
  roomNumber: string;
  assignedTo?: string;
  dateSubmitted: string;
  dateResolved?: string;
  comments: TicketComment[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  date: string;
}
