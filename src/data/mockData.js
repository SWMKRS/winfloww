// comprehensive mock data for creator reports and dashboard
import dayjs from 'dayjs';

// platform fee percentage (typical for OF/Fansly)
const PLATFORM_FEE_PERCENTAGE = 0.20;

// creator profiles with realistic data
const creatorProfiles = [
  {
    id: 'sophia_rose',
    username: '@sophia_rose',
    followers: 125000,
    subscriptionPrice: 9.99,
    avgSubscriptionLength: 4.2,
    renewRate: 0.817,
    ofRanking: 0.8,
    joinDate: dayjs().subtract(8, 'months')
  },
  {
    id: 'emma_jade',
    username: '@emma_jade',
    followers: 98000,
    subscriptionPrice: 12.99,
    avgSubscriptionLength: 3.8,
    renewRate: 0.800,
    ofRanking: 1.2,
    joinDate: dayjs().subtract(6, 'months')
  },
  {
    id: 'ava_luna',
    username: '@ava_luna',
    followers: 76000,
    subscriptionPrice: 7.99,
    avgSubscriptionLength: 3.5,
    renewRate: 0.793,
    ofRanking: 1.5,
    joinDate: dayjs().subtract(4, 'months')
  },
  {
    id: 'mia_grace',
    username: '@mia_grace',
    followers: 62000,
    subscriptionPrice: 14.99,
    avgSubscriptionLength: 3.2,
    renewRate: 0.794,
    joinDate: dayjs().subtract(3, 'months')
  },
  {
    id: 'olivia_sky',
    username: '@olivia_sky',
    followers: 48000,
    subscriptionPrice: 6.99,
    avgSubscriptionLength: 2.9,
    renewRate: 0.796,
    ofRanking: 2.8,
    joinDate: dayjs().subtract(2, 'months')
  }
];

// generate realistic transaction data for the last 90 days
const generateTransactionData = () => {
  const transactions = [];
  const channels = ['subscriptions', 'tips', 'posts', 'messages', 'referrals', 'streams'];

  // generate data for last 90 days
  for (let i = 89; i >= 0; i--) {
    const date = dayjs().subtract(i, 'days');

    // daily transaction count varies (weekends typically lower)
    const isWeekend = date.day() === 0 || date.day() === 6;
    const baseTransactions = isWeekend ? 15 : 25;
    const transactionCount = baseTransactions + Math.floor(Math.random() * 10);

    for (let j = 0; j < transactionCount; j++) {
      const creator = creatorProfiles[Math.floor(Math.random() * creatorProfiles.length)];
      const channel = channels[Math.floor(Math.random() * channels.length)];

      // realistic amounts based on channel type
      let amount;
      switch (channel) {
        case 'subscriptions':
          amount = creator.subscriptionPrice + (Math.random() - 0.5) * 5;
          break;
        case 'tips':
          amount = 5 + Math.random() * 50;
          break;
        case 'posts':
          amount = 3 + Math.random() * 25;
          break;
        case 'messages':
          amount = 2 + Math.random() * 15;
          break;
        case 'referrals':
          amount = Math.random() < 0.1 ? 10 + Math.random() * 20 : 0;
          break;
        case 'streams':
          amount = Math.random() < 0.05 ? 20 + Math.random() * 30 : 0;
          break;
        default:
          amount = 5 + Math.random() * 20;
      }

      // add some randomness to timing within the day
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const timestamp = date.hour(hour).minute(minute);

      transactions.push({
        id: `tx_${date.format('YYYYMMDD')}_${j}`,
        timestamp,
        creatorId: creator.id,
        creatorUsername: creator.username,
        channel,
        grossAmount: Math.round(amount * 100) / 100,
        platformFee: Math.round(amount * PLATFORM_FEE_PERCENTAGE * 100) / 100,
        netAmount: Math.round(amount * (1 - PLATFORM_FEE_PERCENTAGE) * 100) / 100,
        isRefunded: Math.random() < 0.02, // 2% refund rate
        refundAmount: 0,
        refundTimestamp: null
      });
    }
  }

  // add refunds for some transactions
  transactions.forEach(tx => {
    if (tx.isRefunded) {
      tx.refundAmount = tx.grossAmount;
      tx.refundTimestamp = tx.timestamp.add(Math.floor(Math.random() * 7), 'days');
    }
  });

  return transactions;
};

// generate realistic fan data
const generateFanData = () => {
  const fanData = {};

  creatorProfiles.forEach(creator => {
    const totalFans = Math.floor(creator.followers * 0.15); // 15% conversion rate
    const activeFans = Math.floor(totalFans * 0.8); // 80% active
    const fansWithRenewOn = Math.floor(activeFans * creator.renewRate);
    const newFans = Math.floor(totalFans * 0.1); // 10% new this period

    fanData[creator.id] = {
      totalFans,
      activeFans,
      fansWithRenewOn,
      newFans,
      expiredFans: totalFans - activeFans,
      avgSpendPerSpender: 20 + Math.random() * 15,
      avgSpendPerTransaction: 12 + Math.random() * 8
    };
  });

  return fanData;
};

// generate the transaction data
const allTransactions = generateTransactionData();
const fanData = generateFanData();

// helper functions for calculations
const calculateEarningsForPeriod = (transactions = allTransactions, startDate, endDate, channel = null) => {
  const filtered = transactions.filter(tx => {
    const txDate = tx.timestamp;
    return txDate.isAfter(startDate.subtract(1, 'day')) &&
           txDate.isBefore(endDate.add(1, 'day')) &&
           !tx.isRefunded &&
           (channel === null || tx.channel === channel);
  });

  return {
    gross: filtered.reduce((sum, tx) => sum + tx.grossAmount, 0),
    net: filtered.reduce((sum, tx) => sum + tx.netAmount, 0),
    platformFees: filtered.reduce((sum, tx) => sum + tx.platformFee, 0),
    transactionCount: filtered.length
  };
};

const calculateRefundsForPeriod = (transactions = allTransactions, startDate, endDate) => {
  const refunded = transactions.filter(tx =>
    tx.isRefunded &&
    tx.refundTimestamp.isAfter(startDate.subtract(1, 'day')) &&
    tx.refundTimestamp.isBefore(endDate.add(1, 'day'))
  );

  return refunded.reduce((sum, tx) => sum + tx.refundAmount, 0);
};

const calculateGrowthPercentage = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// generate time-based data
const generateTimeBasedData = () => {
  const timeFilters = ['Yesterday', 'Today', 'This week', 'This month'];
  const earningsData = {};
  const salesChartData = {};

  timeFilters.forEach(filter => {
    let startDate, endDate;

    switch (filter) {
      case 'Yesterday':
        startDate = dayjs().subtract(1, 'day').startOf('day');
        endDate = dayjs().subtract(1, 'day').endOf('day');
        break;
      case 'Today':
        startDate = dayjs().startOf('day');
        endDate = dayjs().endOf('day');
        break;
      case 'This week':
        startDate = dayjs().subtract(6, 'days').startOf('day');
        endDate = dayjs().endOf('day');
        break;
      case 'This month':
        startDate = dayjs().startOf('month');
        endDate = dayjs().endOf('day');
        break;
    }

    // calculate gross earnings
    const grossEarnings = calculateEarningsForPeriod(allTransactions, startDate, endDate);
    const refunded = calculateRefundsForPeriod(allTransactions, startDate, endDate);

    // calculate by channel
    const channels = ['subscriptions', 'tips', 'posts', 'messages', 'referrals', 'streams'];
    const channelEarnings = {};
    channels.forEach(channel => {
      channelEarnings[channel] = calculateEarningsForPeriod(allTransactions, startDate, endDate, channel);
    });

    earningsData[filter] = {
    'Gross earnings': {
        total: grossEarnings.gross,
        subscriptions: channelEarnings.subscriptions.gross,
        tips: channelEarnings.tips.gross,
        posts: channelEarnings.posts.gross,
        messages: channelEarnings.messages.gross,
        referrals: channelEarnings.referrals.gross,
        streams: channelEarnings.streams.gross
    },
    'Net earnings': {
        total: grossEarnings.net,
        subscriptions: channelEarnings.subscriptions.net,
        tips: channelEarnings.tips.net,
        posts: channelEarnings.posts.net,
        messages: channelEarnings.messages.net,
        referrals: channelEarnings.referrals.net,
        streams: channelEarnings.streams.net
      }
    };

    // generate chart data for the period
    const chartData = [];
    const days = endDate.diff(startDate, 'days') + 1;

    for (let i = 0; i < days; i++) {
      const chartDate = startDate.add(i, 'days');
      const dayEarnings = calculateEarningsForPeriod(allTransactions, chartDate, chartDate);

      chartData.push({
        date: chartDate.format('MMM D'),
        value: dayEarnings.gross,
        earnings: dayEarnings.gross
      });
    }

    salesChartData[filter] = chartData;
  });

  return { earningsData, salesChartData };
};

// generate creator performance data
const generateCreatorPerformanceData = () => {
  const creatorData = [];

  creatorProfiles.forEach(creator => {
    const creatorTransactions = allTransactions.filter(tx => tx.creatorId === creator.id);
    const thisWeekStart = dayjs().subtract(6, 'days').startOf('day');
    const thisWeekEnd = dayjs().endOf('day');
    const lastWeekStart = dayjs().subtract(13, 'days').startOf('day');
    const lastWeekEnd = dayjs().subtract(7, 'days').endOf('day');

    const thisWeekEarnings = calculateEarningsForPeriod(creatorTransactions, thisWeekStart, thisWeekEnd);
    const lastWeekEarnings = calculateEarningsForPeriod(creatorTransactions, lastWeekStart, lastWeekEnd);

    const subscriptions = calculateEarningsForPeriod(creatorTransactions, thisWeekStart, thisWeekEnd, 'subscriptions');
    const tips = calculateEarningsForPeriod(creatorTransactions, thisWeekStart, thisWeekEnd, 'tips');
    const messages = calculateEarningsForPeriod(creatorTransactions, thisWeekStart, thisWeekEnd, 'messages');

    const fans = fanData[creator.id];

    creatorData.push({
      key: creator.id,
      creator: creator.username,
      subscriptions: `$${subscriptions.gross.toFixed(2)}`,
      subscriptionsChange: calculateGrowthPercentage(subscriptions.gross, lastWeekEarnings.gross * 0.6),
      newSubscriptions: Math.floor(subscriptions.transactionCount * 0.3),
      newSubscriptionsChange: Math.random() * 20 - 5,
      recurringSubscriptions: Math.floor(subscriptions.transactionCount * 0.7),
      recurringSubscriptionsChange: Math.random() * 15 - 3,
      tips: `$${tips.gross.toFixed(2)}`,
      message: `$${messages.gross.toFixed(2)}`,
      totalEarnings: `$${thisWeekEarnings.gross.toFixed(2)}`,
      totalEarningsChange: calculateGrowthPercentage(thisWeekEarnings.gross, lastWeekEarnings.gross),
      contribution: `${((thisWeekEarnings.gross / calculateEarningsForPeriod(allTransactions, thisWeekStart, thisWeekEnd).gross) * 100).toFixed(1)}%`,
      contributionChange: Math.random() * 4 - 2,
      ofRanking: `${creator.ofRanking}%`,
      following: `${(creator.followers / 1000).toFixed(0)}K`,
      fansWithRenewOn: fans.fansWithRenewOn,
      renewOnPercent: `${(fans.fansWithRenewOn / fans.activeFans * 100).toFixed(1)}%`,
      newFans: fans.newFans,
      activeFans: fans.activeFans,
      activeFansChange: Math.random() * 15 - 5,
      changeInExpiredFanCount: `-${Math.floor(Math.random() * 10)}`,
      avgSpendPerSpender: `$${fans.avgSpendPerSpender.toFixed(2)}`,
      avgSpendPerSpenderChange: Math.random() * 20 - 5,
      avgSpendPerTransaction: `$${fans.avgSpendPerTransaction.toFixed(2)}`,
      avgSpendPerTransactionChange: Math.random() * 15 - 3,
      avgEarningsPerFan: `$${(thisWeekEarnings.gross / fans.activeFans).toFixed(2)}`,
      avgSubscriptionLength: `${creator.avgSubscriptionLength} months`
    });
  });

  return creatorData;
};

// generate the comprehensive data
const { earningsData, salesChartData } = generateTimeBasedData();
const creatorTableData = generateCreatorPerformanceData();

// calculate overall statistics
const thisWeekEarnings = calculateEarningsForPeriod(allTransactions, dayjs().subtract(6, 'days').startOf('day'), dayjs().endOf('day'));
const thisWeekRefunds = calculateRefundsForPeriod(allTransactions, dayjs().subtract(6, 'days').startOf('day'), dayjs().endOf('day'));

const creatorStatistics = {
  creators: creatorProfiles.length,
  messageEarnings: calculateEarningsForPeriod(allTransactions, dayjs().subtract(6, 'days').startOf('day'), dayjs().endOf('day'), 'messages').gross,
  totalEarnings: thisWeekEarnings.gross,
  refunded: thisWeekRefunds
};

// generate dynamic chart data for creator reports
const generateDynamicEarningsTrends = (startDate, endDate) => {
  const data = [];
  const days = Math.min(endDate.diff(startDate, 'days') + 1, 30);

  for (let i = 0; i < days; i++) {
    const date = startDate.add(i, 'days');
    const dayEarnings = calculateEarningsForPeriod(allTransactions, date, date);

    data.push({
      date: date.format('MMM D'),
      value: dayEarnings.gross
    });
  }

  return data;
};

const generateDynamicSalesChart = (startDate, endDate) => {
  const data = [];
  const days = Math.min(endDate.diff(startDate, 'days') + 1, 30);

  for (let i = 0; i < days; i++) {
    const date = startDate.add(i, 'days');
    const channels = ['subscriptions', 'tips', 'posts', 'messages', 'referrals', 'streams'];
    const dayData = { date: date.format('MMM D') };

    channels.forEach(channel => {
      const channelEarnings = calculateEarningsForPeriod(allTransactions, date, date, channel);
      dayData[channel] = channelEarnings.gross;
    });

    data.push(dayData);
  }

  return data;
};

// export all the data
export {
  earningsData,
  salesChartData,
  creatorTableData,
  creatorStatistics,
  generateDynamicEarningsTrends,
  generateDynamicSalesChart,
  calculateEarningsForPeriod,
  calculateRefundsForPeriod,
  allTransactions,
  creatorProfiles,
  fanData
};

// legacy exports for backward compatibility
export const employeesData = {
  'Yesterday': [],
  'Today': [],
  'This week': [],
  'This month': []
};

export const shiftsData = {
  'Yesterday': [],
  'Today': [],
  'This week': [],
  'This month': []
};

export const scheduledHoursData = {
  'Yesterday': [],
  'Today': [],
  'This week': [],
  'This month': []
};

export const notificationData = {
  totalMessages: 7
};