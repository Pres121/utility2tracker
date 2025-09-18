import { useState, useEffect } from 'react';
import { useBills } from './useBills';
import { isBefore, isAfter, addDays, differenceInDays } from 'date-fns';

export interface Notification {
  id: string;
  type: 'overdue' | 'due_soon' | 'reminder';
  title: string;
  message: string;
  billId: string;
  billTitle: string;
  amount: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  createdAt: Date;
}

export const useNotifications = () => {
  const { bills } = useBills();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    generateNotifications();
  }, [bills]);

  const generateNotifications = () => {
    const today = new Date();
    const newNotifications: Notification[] = [];

    bills.forEach(bill => {
      if (bill.status !== 'pending') return;

      const dueDate = new Date(bill.due_date);
      const daysUntilDue = differenceInDays(dueDate, today);

      // Overdue bills
      if (isBefore(dueDate, today)) {
        newNotifications.push({
          id: `overdue-${bill.id}`,
          type: 'overdue',
          title: 'Bill Overdue',
          message: `${bill.title} was due ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} ago`,
          billId: bill.id,
          billTitle: bill.title,
          amount: bill.amount,
          dueDate: bill.due_date,
          priority: 'high',
          read: false,
          createdAt: new Date(),
        });
      }
      // Due within 3 days
      else if (daysUntilDue <= 3 && daysUntilDue >= 0) {
        newNotifications.push({
          id: `due-soon-${bill.id}`,
          type: 'due_soon',
          title: 'Bill Due Soon',
          message: daysUntilDue === 0 
            ? `${bill.title} is due today`
            : `${bill.title} is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
          billId: bill.id,
          billTitle: bill.title,
          amount: bill.amount,
          dueDate: bill.due_date,
          priority: daysUntilDue === 0 ? 'high' : 'medium',
          read: false,
          createdAt: new Date(),
        });
      }
      // Due within 7 days (reminder)
      else if (daysUntilDue <= 7 && daysUntilDue > 3) {
        newNotifications.push({
          id: `reminder-${bill.id}`,
          type: 'reminder',
          title: 'Upcoming Bill',
          message: `${bill.title} is due in ${daysUntilDue} days`,
          billId: bill.id,
          billTitle: bill.title,
          amount: bill.amount,
          dueDate: bill.due_date,
          priority: 'low',
          read: false,
          createdAt: new Date(),
        });
      }
    });

    // Sort by priority and date
    newNotifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.read).length);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  };
};