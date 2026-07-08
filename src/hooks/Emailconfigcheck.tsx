import { useState } from 'react';
import { toast } from 'sonner';
import { API_URL } from '@/components/api';

const API = API_URL;

export function useEmailConfigCheck() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const checkEmailConfig = async (): Promise<boolean> => {
    const seller = JSON.parse(localStorage.getItem("seller") || "{}");

    try {
      const res = await fetch(`${API}/status/${seller.id}`);
      const json = await res.json();

      if (!json.success) {
        toast.error('User not found');
        return false;
      }

      const { email_config, email_sent } = json.data;

      if (email_config === 0) {
        setModalMessage('Please configure your email before sending.');
        setModalOpen(true);
        return false;
      }

      if (email_sent === 0) {
        setModalMessage('Please send a test mail first.');
        setModalOpen(true);
        return false;
      }

      return true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to check email status');
      return false;
    }
  };

  return { checkEmailConfig, modalOpen, modalMessage, setModalOpen };
}