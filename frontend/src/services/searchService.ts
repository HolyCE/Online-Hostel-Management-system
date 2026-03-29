import { toast } from 'react-hot-toast';

export interface SearchResult {
  type: 'room' | 'payment' | 'ticket' | 'user' | 'hall';
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

// Search through rooms
const searchRooms = (rooms: any[], query: string): SearchResult[] => {
  return rooms
    .filter(room => 
      room.roomNumber?.toLowerCase().includes(query) ||
      room.blockName?.toLowerCase().includes(query) ||
      room.status?.toLowerCase().includes(query)
    )
    .map(room => ({
      type: 'room',
      id: room._id,
      title: `Room ${room.roomNumber}`,
      subtitle: `${room.blockName} • ${room.status} • ₦${room.price?.toLocaleString()}`,
      link: '/dashboard/rooms'
    }));
};

// Search through tickets
const searchTickets = (tickets: any[], query: string): SearchResult[] => {
  return tickets
    .filter(ticket =>
      ticket.title?.toLowerCase().includes(query) ||
      ticket.description?.toLowerCase().includes(query) ||
      ticket.category?.toLowerCase().includes(query) ||
      ticket.student?.name?.toLowerCase().includes(query)
    )
    .map(ticket => ({
      type: 'ticket',
      id: ticket._id,
      title: ticket.title,
      subtitle: `${ticket.category} • ${ticket.status} • By: ${ticket.student?.name || 'Unknown'}`,
      link: '/dashboard/tickets'
    }));
};

// Search through payments
const searchPayments = (payments: any[], query: string): SearchResult[] => {
  return payments
    .filter(payment =>
      payment.reference?.toLowerCase().includes(query) ||
      payment.student?.name?.toLowerCase().includes(query) ||
      payment.status?.toLowerCase().includes(query)
    )
    .map(payment => ({
      type: 'payment',
      id: payment._id,
      title: `Payment: ${payment.reference?.slice(0, 12)}...`,
      subtitle: `₦${payment.amount?.toLocaleString()} • ${payment.status} • By: ${payment.student?.name || 'Unknown'}`,
      link: '/dashboard/payments'
    }));
};

// Search through users (admin only)
const searchUsers = (users: any[], query: string): SearchResult[] => {
  return users
    .filter(user =>
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.matricNumber?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    )
    .map(user => ({
      type: 'user',
      id: user._id,
      title: user.name,
      subtitle: `${user.email} • ${user.role} • ${user.matricNumber || 'N/A'}`,
      link: '/dashboard/admin/users'
    }));
};

// Main search function
export const performSearch = async (
  query: string,
  userRole: string,
  fetchData: () => Promise<any>
): Promise<SearchResult[]> => {
  const results: SearchResult[] = [];
  
  if (!query || query.length < 2) {
    toast.error('🔍 Please enter at least 2 characters to search', {
      duration: 3000,
      icon: '❓',
      style: {
        background: '#f3f4f6',
        color: '#000000',
      },
    });
    return [];
  }

  const lowerQuery = query.toLowerCase();
  
  try {
    const data = await fetchData();
    
    // Search rooms
    if (data.rooms?.length) {
      results.push(...searchRooms(data.rooms, lowerQuery));
    }
    
    // Search tickets
    if (data.tickets?.length) {
      results.push(...searchTickets(data.tickets, lowerQuery));
    }
    
    // Search payments
    if (data.payments?.length) {
      results.push(...searchPayments(data.payments, lowerQuery));
    }
    
    // Search users (admin only)
    if (userRole === 'admin' && data.users?.length) {
      results.push(...searchUsers(data.users, lowerQuery));
    }
    
    // Show result feedback
    if (results.length > 0) {
      toast.success(`🔍 Found ${results.length} result(s) for "${query}"`, {
        duration: 3000,
        icon: '✅',
      });
    } else {
      toast.error(`🔍 No results found for "${query}". Try searching by:
• Room numbers (e.g., A101)
• Student names or emails
• Payment references
• Ticket titles or categories
• Use keywords like "pending", "success", "available"`, {
        duration: 6000,
        icon: '❌',
        style: {
          background: '#f3f4f6',
          color: '#000000',
          maxWidth: '400px',
        },
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('Search error:', error);
    toast.error('❌ Unable to search. Please try again later.', {
      duration: 3000,
      icon: '⚠️',
    });
    return [];
  }
};
