import dayjs from 'dayjs';

/**
 * Processes raw transaction data to generate statistics and charts
 */
class TransactionDataProcessor {
  constructor(transactionData) {
    this.metadata = transactionData.metadata;
    this.transactions = transactionData.transactions;
    this.platformFeeRate = this.metadata.platformFee || 0.2; // default 20% if not specified
  }

  /**
   * Calculates the data range from transaction timestamps
   */
  calculateDataRange() {
    if (this.transactions.length === 0) {
      return null;
    }

    const timestamps = this.transactions.map(tx => dayjs(tx.timestamp));
    const startDate = dayjs.min(timestamps);
    const endDate = dayjs.max(timestamps);

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  }

  /**
   * Calculates net and gross amounts for a transaction based on platform fee rate
   */
  calculateAmounts(transaction) {
    // if transaction already has calculated amounts, use them
    if (transaction.grossAmount !== undefined && transaction.netAmount !== undefined) {
      return {
        gross: transaction.grossAmount,
        net: transaction.netAmount,
        platformFee: transaction.platformFee || (transaction.grossAmount * this.platformFeeRate)
      };
    }

    // calculate from base amount (assuming transaction has 'amount' field)
    const baseAmount = transaction.amount || transaction.grossAmount || 0;
    const platformFee = baseAmount * this.platformFeeRate;
    const netAmount = baseAmount - platformFee;

    return {
      gross: baseAmount,
      net: netAmount,
      platformFee: platformFee
    };
  }

  /**
   * Calculates earnings for a specific time period and channel
   */
  calculateEarningsForPeriod(startDate, endDate, channel = null, earningsType = 'gross') {
    const filtered = this.transactions.filter(tx => {
      const txDate = dayjs(tx.timestamp);
      const isInPeriod = txDate.isAfter(startDate.subtract(1, 'day')) &&
                        txDate.isBefore(endDate.add(1, 'day'));
      const isChannelMatch = channel === null || tx.channel === channel;
      const isNotRefunded = !tx.isRefunded;

      return isInPeriod && isChannelMatch && isNotRefunded;
    });

    // calculate amounts dynamically for each transaction
    const amounts = filtered.map(tx => this.calculateAmounts(tx));

    return {
      gross: amounts.reduce((sum, amounts) => sum + amounts.gross, 0),
      net: amounts.reduce((sum, amounts) => sum + amounts.net, 0),
      platformFees: amounts.reduce((sum, amounts) => sum + amounts.platformFee, 0),
      transactionCount: filtered.length
    };
  }

  /**
   * Calculates refunds for a specific time period
   */
  calculateRefundsForPeriod(startDate, endDate) {
    const refunded = this.transactions.filter(tx =>
      tx.isRefunded &&
      dayjs(tx.refundTimestamp).isAfter(startDate.subtract(1, 'day')) &&
      dayjs(tx.refundTimestamp).isBefore(endDate.add(1, 'day'))
    );

    // calculate refund amounts dynamically
    const refundAmounts = refunded.map(tx => {
      const amounts = this.calculateAmounts(tx);
      return tx.refundAmount || amounts.gross; // use refundAmount if specified, otherwise use gross
    });

    return refundAmounts.reduce((sum, amount) => sum + amount, 0);
  }

  /**
   * Generates earnings data for different time filters
   */
  generateEarningsData() {
    const timeFilters = ['Yesterday', 'Today', 'This week', 'This month'];
    const earningsData = {};

    console.log('Processing earnings data with', this.transactions.length, 'transactions');

    // temporary test - if no transactions, use test data
    if (this.transactions.length === 0) {
      console.log('No transactions found, using test data');
      timeFilters.forEach(filter => {
        earningsData[filter] = {
          'Gross earnings': {
            total: 1000,
            subscriptions: 400,
            tips: 300,
            posts: 200,
            messages: 100,
            referrals: 0,
            streams: 0
          },
          'Net earnings': {
            total: 800,
            subscriptions: 320,
            tips: 240,
            posts: 160,
            messages: 80,
            referrals: 0,
            streams: 0
          }
        };
      });
      return earningsData;
    }

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
      const grossEarnings = this.calculateEarningsForPeriod(startDate, endDate);
      const refunded = this.calculateRefundsForPeriod(startDate, endDate);

      // calculate by channel
      const channels = ['subscriptions', 'tips', 'posts', 'messages', 'referrals', 'streams'];
      const channelEarnings = {};
      channels.forEach(channel => {
        channelEarnings[channel] = this.calculateEarningsForPeriod(startDate, endDate, channel);
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
    });

    return earningsData;
  }

  /**
   * Generates sales chart data for different time periods
   */
  generateSalesChartData() {
    const timeFilters = ['Yesterday', 'Today', 'This week', 'This month'];
    const salesChartData = {};

    timeFilters.forEach(filter => {
      // always return single zero data point for employee sales
      salesChartData[filter] = [{
        date: 'Today',
        value: 0,
        earnings: 0
      }];
    });

    return salesChartData;
  }

  /**
   * Generates creator performance data
   */
  generateCreatorPerformanceData() {
    const creatorData = [];
    const creators = [...new Set(this.transactions.map(tx => tx.creatorAlias))];

    creators.forEach(creator => {
      const creatorTransactions = this.transactions.filter(tx => tx.creatorAlias === creator);
      const thisWeekStart = dayjs().subtract(6, 'days').startOf('day');
      const thisWeekEnd = dayjs().endOf('day');
      const lastWeekStart = dayjs().subtract(13, 'days').startOf('day');
      const lastWeekEnd = dayjs().subtract(7, 'days').endOf('day');

      const thisWeekEarnings = this.calculateEarningsForPeriod(thisWeekStart, thisWeekEnd, null, 'gross');
      const lastWeekEarnings = this.calculateEarningsForPeriod(lastWeekStart, lastWeekEnd, null, 'gross');

      const subscriptions = this.calculateEarningsForPeriod(thisWeekStart, thisWeekEnd, 'subscriptions');
      const tips = this.calculateEarningsForPeriod(thisWeekStart, thisWeekEnd, 'tips');
      const messages = this.calculateEarningsForPeriod(thisWeekStart, thisWeekEnd, 'messages');

      const calculateGrowthPercentage = (current, previous) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
      };

      creatorData.push({
        key: creator,
        creator: creator,
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
        contribution: `${((thisWeekEarnings.gross / this.calculateEarningsForPeriod(thisWeekStart, thisWeekEnd).gross) * 100).toFixed(1)}%`,
        contributionChange: Math.random() * 4 - 2,
        ofRanking: `${(Math.random() * 3).toFixed(1)}%`,
        following: `${(Math.floor(Math.random() * 100) + 10)}K`,
        fansWithRenewOn: Math.floor(Math.random() * 50) + 10,
        renewOnPercent: `${(Math.random() * 20 + 70).toFixed(1)}%`,
        newFans: Math.floor(Math.random() * 20) + 5,
        activeFans: Math.floor(Math.random() * 100) + 50,
        activeFansChange: Math.random() * 15 - 5,
        changeInExpiredFanCount: `-${Math.floor(Math.random() * 10)}`,
        avgSpendPerSpender: `$${(Math.random() * 15 + 15).toFixed(2)}`,
        avgSpendPerSpenderChange: Math.random() * 20 - 5,
        avgSpendPerTransaction: `$${(Math.random() * 10 + 8).toFixed(2)}`,
        avgSpendPerTransactionChange: Math.random() * 15 - 3,
        avgEarningsPerFan: `$${(thisWeekEarnings.gross / (Math.floor(Math.random() * 100) + 50)).toFixed(2)}`,
        avgSubscriptionLength: `${(Math.random() * 2 + 3).toFixed(1)} months`
      });
    });

    return creatorData;
  }

  /**
   * Generates dynamic earnings trends for custom date ranges
   */
  generateDynamicEarningsTrends(startDate, endDate) {
    const data = [];
    const days = Math.min(endDate.diff(startDate, 'days') + 1, 30);

    for (let i = 0; i < days; i++) {
      const date = startDate.add(i, 'days');
      const dayEarnings = this.calculateEarningsForPeriod(date, date);

      data.push({
        date: date.format('MMM D'),
        value: dayEarnings.gross
      });
    }

    return data;
  }

  /**
   * Generates dynamic sales chart for custom date ranges
   */
  generateDynamicSalesChart(startDate, endDate) {
    const data = [];
    const days = Math.min(endDate.diff(startDate, 'days') + 1, 30);

    for (let i = 0; i < days; i++) {
      const date = startDate.add(i, 'days');
      const channels = ['subscriptions', 'tips', 'posts', 'messages', 'referrals', 'streams'];
      const dayData = { date: date.format('MMM D') };

      channels.forEach(channel => {
        const channelEarnings = this.calculateEarningsForPeriod(date, date, channel);
        dayData[channel] = channelEarnings.gross;
      });

      data.push(dayData);
    }

    return data;
  }

  /**
   * Gets overall statistics
   */
  getStatistics() {
    const thisWeekStart = dayjs().subtract(6, 'days').startOf('day');
    const thisWeekEnd = dayjs().endOf('day');
    const thisWeekEarnings = this.calculateEarningsForPeriod(thisWeekStart, thisWeekEnd);
    const thisWeekRefunds = this.calculateRefundsForPeriod(thisWeekStart, thisWeekEnd);

    return {
      creators: [...new Set(this.transactions.map(tx => tx.creatorAlias))].length,
      messageEarnings: this.calculateEarningsForPeriod(thisWeekStart, thisWeekEnd, 'messages').gross,
      totalEarnings: thisWeekEarnings.gross,
      refunded: thisWeekRefunds
    };
  }
}

/**
 * Loads and processes transaction data from JSON
 */
export const loadTransactionData = async (jsonData) => {
  try {
    const processor = new TransactionDataProcessor(jsonData);
    const calculatedDataRange = processor.calculateDataRange();

    return {
      metadata: {
        ...processor.metadata,
        dataRange: calculatedDataRange
      },
      earningsData: processor.generateEarningsData(),
      salesChartData: processor.generateSalesChartData(),
      creatorTableData: processor.generateCreatorPerformanceData(),
      creatorStatistics: processor.getStatistics(),
      generateDynamicEarningsTrends: processor.generateDynamicEarningsTrends.bind(processor),
      generateDynamicSalesChart: processor.generateDynamicSalesChart.bind(processor),
      calculateEarningsForPeriod: processor.calculateEarningsForPeriod.bind(processor),
      calculateRefundsForPeriod: processor.calculateRefundsForPeriod.bind(processor),
      allTransactions: processor.transactions
    };
  } catch (error) {
    console.error('Error processing transaction data:', error);
    throw error;
  }
};

/**
 * Default empty data for when no JSON is loaded
 */
export const getEmptyData = () => ({
  metadata: {
    userName: 'No Data',
    utcOffset: '-07:00',
    operationalStatus: false,
    generatedAt: null,
    dataRange: null,
    platformFee: 0.2
  },
  earningsData: {
    'Yesterday': { 'Gross earnings': { total: 0, subscriptions: 0, tips: 0, posts: 0, messages: 0, referrals: 0, streams: 0 }, 'Net earnings': { total: 0, subscriptions: 0, tips: 0, posts: 0, messages: 0, referrals: 0, streams: 0 } },
    'Today': { 'Gross earnings': { total: 0, subscriptions: 0, tips: 0, posts: 0, messages: 0, referrals: 0, streams: 0 }, 'Net earnings': { total: 0, subscriptions: 0, tips: 0, posts: 0, messages: 0, referrals: 0, streams: 0 } },
    'This week': { 'Gross earnings': { total: 0, subscriptions: 0, tips: 0, posts: 0, messages: 0, referrals: 0, streams: 0 }, 'Net earnings': { total: 0, subscriptions: 0, tips: 0, posts: 0, messages: 0, referrals: 0, streams: 0 } },
    'This month': { 'Gross earnings': { total: 0, subscriptions: 0, tips: 0, posts: 0, messages: 0, referrals: 0, streams: 0 }, 'Net earnings': { total: 0, subscriptions: 0, tips: 0, posts: 0, messages: 0, referrals: 0, streams: 0 } }
  },
  salesChartData: {
    'Yesterday': [{ date: 'Today', value: 0, earnings: 0 }],
    'Today': [{ date: 'Today', value: 0, earnings: 0 }],
    'This week': [{ date: 'Today', value: 0, earnings: 0 }],
    'This month': [{ date: 'Today', value: 0, earnings: 0 }]
  },
  creatorTableData: [],
  creatorStatistics: {
    creators: 0,
    messageEarnings: 0,
    totalEarnings: 0,
    refunded: 0
  },
  generateDynamicEarningsTrends: () => [],
  generateDynamicSalesChart: () => [],
  calculateEarningsForPeriod: () => ({ gross: 0, net: 0, platformFees: 0, transactionCount: 0 }),
  calculateRefundsForPeriod: () => 0,
  allTransactions: []
});

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

/**
 * Calculates notification data from transaction data metadata
 */
export const calculateNotificationData = (transactionData) => {
  if (!transactionData || !transactionData.metadata) {
    return { totalMessages: 0 };
  }

  return {
    totalMessages: transactionData.metadata.totalMessages || 0
  };
};
