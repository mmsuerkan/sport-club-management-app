import { ref } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, push, set } from 'firebase/database';

export function useDevelopmentNotifications() {
  const createDevelopmentNotification = async (notification: {
    studentId: string;
    studentName: string;
    type: 'achievement' | 'performance' | 'assessment' | 'feedback';
    title: string;
    message: string;
  }) => {
    try {
      const newNotificationRef = push(dbRef(db, 'developmentNotifications'));
      await set(newNotificationRef, {
        ...notification,
        read: false,
        createdAt: Date.now()
      });
      return true;
    } catch (err) {
      console.error('Error creating development notification:', err);
      return false;
    }
  };

  return {
    createDevelopmentNotification
  };
}