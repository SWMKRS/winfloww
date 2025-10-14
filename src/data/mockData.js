// Mock data for the dashboard

export const earningsData = {
  'Yesterday': {
    'Gross earnings': {
      total: 1245.50,
      subscriptions: 450.00,
      posts: 320.50,
      messages: 180.00,
      tips: 195.00,
      referrals: 50.00,
      streams: 50.00
    },
    'Net earnings': {
      total: 996.40,
      subscriptions: 360.00,
      posts: 256.40,
      messages: 144.00,
      tips: 156.00,
      referrals: 40.00,
      streams: 40.00
    }
  },
  'Today': {
    'Gross earnings': {
      total: 892.30,
      subscriptions: 320.00,
      posts: 245.30,
      messages: 135.00,
      tips: 142.00,
      referrals: 30.00,
      streams: 20.00
    },
    'Net earnings': {
      total: 713.84,
      subscriptions: 256.00,
      posts: 196.24,
      messages: 108.00,
      tips: 113.60,
      referrals: 24.00,
      streams: 16.00
    }
  },
  'This week': {
    'Gross earnings': {
      total: 7856.75,
      subscriptions: 2800.00,
      posts: 1950.50,
      messages: 1350.25,
      tips: 1256.00,
      referrals: 300.00,
      streams: 200.00
    },
    'Net earnings': {
      total: 6285.40,
      subscriptions: 2240.00,
      posts: 1560.40,
      messages: 1080.20,
      tips: 1004.80,
      referrals: 240.00,
      streams: 160.00
    }
  },
  'This month': {
    'Gross earnings': {
      total: 28456.50,
      subscriptions: 10500.00,
      posts: 7250.50,
      messages: 4850.00,
      tips: 4206.00,
      referrals: 1050.00,
      streams: 600.00
    },
    'Net earnings': {
      total: 22765.20,
      subscriptions: 8400.00,
      posts: 5800.40,
      messages: 3880.00,
      tips: 3364.80,
      referrals: 840.00,
      streams: 480.00
    }
  }
};

export const salesChartData = {
  'Yesterday': [
    { date: 'Yesterday', value: 0, earnings: 0 }
  ],
  'Today': [
    { date: 'Today', value: 0, earnings: 0 }
  ],
  'This week': [
    { date: 'This week', value: 0, earnings: 0 }
  ],
  'This month': [
    { date: 'This month', value: 0, earnings: 0 }
  ]
};

export const employeesData = {
  'Yesterday': [
    { id: 1, name: 'Sarah Johnson', status: 'clocked-out', hours: 8.5, sales: 0 },
    { id: 2, name: 'Mike Chen', status: 'clocked-out', hours: 7.0, sales: 0 },
    { id: 3, name: 'Emma Davis', status: 'clocked-out', hours: 6.5, sales: 0 }
  ],
  'Today': [
    { id: 1, name: 'Sarah Johnson', status: 'clocked-in', hours: 4.2, sales: 0 },
    { id: 2, name: 'Mike Chen', status: 'clocked-in', hours: 3.5, sales: 0 },
    { id: 4, name: 'Alex Rodriguez', status: 'clocked-in', hours: 2.0, sales: 0 }
  ],
  'This week': [
    { id: 1, name: 'Sarah Johnson', hours: 42.5, sales: 0 },
    { id: 2, name: 'Mike Chen', hours: 38.0, sales: 0 },
    { id: 3, name: 'Emma Davis', hours: 35.5, sales: 0 },
    { id: 4, name: 'Alex Rodriguez', hours: 28.0, sales: 0 }
  ],
  'This month': [
    { id: 1, name: 'Sarah Johnson', hours: 168.5, sales: 0 },
    { id: 2, name: 'Mike Chen', hours: 152.0, sales: 0 },
    { id: 3, name: 'Emma Davis', hours: 145.5, sales: 0 },
    { id: 4, name: 'Alex Rodriguez', hours: 112.0, sales: 0 }
  ]
};

export const shiftsData = {
  'Yesterday': [
    { employee: 'Sarah Johnson', start: '9:00 AM', end: '5:30 PM' },
    { employee: 'Mike Chen', start: '10:00 AM', end: '5:00 PM' },
    { employee: 'Emma Davis', start: '11:00 AM', end: '5:30 PM' }
  ],
  'Today': [
    { employee: 'Sarah Johnson', start: '9:00 AM', end: '5:30 PM', current: true },
    { employee: 'Mike Chen', start: '10:00 AM', end: '6:00 PM', current: true },
    { employee: 'Alex Rodriguez', start: '12:00 PM', end: '8:00 PM', current: true }
  ],
  'This week': [
    { employee: 'Sarah Johnson', totalHours: 42.5, shifts: 6 },
    { employee: 'Mike Chen', totalHours: 38.0, shifts: 5 },
    { employee: 'Emma Davis', totalHours: 35.5, shifts: 5 },
    { employee: 'Alex Rodriguez', totalHours: 28.0, shifts: 4 }
  ],
  'This month': [
    { employee: 'Sarah Johnson', totalHours: 168.5, shifts: 22 },
    { employee: 'Mike Chen', totalHours: 152.0, shifts: 20 },
    { employee: 'Emma Davis', totalHours: 145.5, shifts: 19 },
    { employee: 'Alex Rodriguez', totalHours: 112.0, shifts: 15 }
  ]
};

export const scheduledHoursData = {
  'Yesterday': [
    { employee: 'Sarah Johnson', scheduled: 8, worked: 8.5 },
    { employee: 'Mike Chen', scheduled: 7, worked: 7.0 },
    { employee: 'Emma Davis', scheduled: 6.5, worked: 6.5 }
  ],
  'Today': [
    { employee: 'Sarah Johnson', scheduled: 8.5, worked: 4.2, inProgress: true },
    { employee: 'Mike Chen', scheduled: 8, worked: 3.5, inProgress: true },
    { employee: 'Alex Rodriguez', scheduled: 8, worked: 2.0, inProgress: true }
  ],
  'This week': [
    { employee: 'Sarah Johnson', scheduled: 40, worked: 42.5 },
    { employee: 'Mike Chen', scheduled: 40, worked: 38.0 },
    { employee: 'Emma Davis', scheduled: 35, worked: 35.5 },
    { employee: 'Alex Rodriguez', scheduled: 30, worked: 28.0 }
  ],
  'This month': [
    { employee: 'Sarah Johnson', scheduled: 160, worked: 168.5 },
    { employee: 'Mike Chen', scheduled: 160, worked: 152.0 },
    { employee: 'Emma Davis', scheduled: 140, worked: 145.5 },
    { employee: 'Alex Rodriguez', scheduled: 120, worked: 112.0 }
  ]
};

export const notificationData = {
  totalMessages: 7
};
