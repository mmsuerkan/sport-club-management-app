import { ref } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, push, set } from 'firebase/database';

export function useNotifications() {
  const createNotification = async (notification: {
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }) => {
    try {
      const newNotificationRef = push(dbRef(db, 'notifications'));
      await set(newNotificationRef, {
        ...notification,
        read: false,
        createdAt: Date.now()
      });
      return true;
    } catch (err) {
      console.error('Error creating notification:', err);
      return false;
    }
  };

  return {
    createNotification
  };
}