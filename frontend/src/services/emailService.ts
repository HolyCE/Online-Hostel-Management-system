import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const sendWelcomeEmail = async (name: string, email: string, password: string) => {
  try {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    await axios.post(`${API_URL}/emails/welcome`, { name, email, password }, { headers });
    console.log('Welcome email sent');
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

export const sendRoomAllocationEmail = async (name: string, email: string, roomNumber: string, blockName: string) => {
  try {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    await axios.post(`${API_URL}/emails/room-allocation`, { name, email, roomNumber, blockName }, { headers });
    console.log('Room allocation email sent');
  } catch (error) {
    console.error('Failed to send room allocation email:', error);
  }
};

export const sendPaymentConfirmationEmail = async (name: string, email: string, amount: number, reference: string) => {
  try {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    await axios.post(`${API_URL}/emails/payment-confirmation`, { name, email, amount, reference }, { headers });
    console.log('Payment confirmation email sent');
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
  }
};

export const sendTicketUpdateEmail = async (name: string, email: string, ticketTitle: string, status: string, comment?: string) => {
  try {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    await axios.post(`${API_URL}/emails/ticket-update`, { name, email, ticketTitle, status, comment }, { headers });
    console.log('Ticket update email sent');
  } catch (error) {
    console.error('Failed to send ticket update email:', error);
  }
};
