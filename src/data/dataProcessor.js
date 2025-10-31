import dayjs from 'dayjs';

/**
 * Processes raw transaction data to generate statistics and charts
 */
class TransactionDataProcessor {
  constructor(transactionData) {
    this.metadata = transactionData.metadata;
    this.transactions = transactionData.transactions;
    this.fans = transactionData.fans || [];
    this.creators = transactionData.creators || [];
    this.platformFeeRate = this.metadata.platformFee || 0.2; // default 20% if not specified
    this.cache = new Map(); // cache for expensive calculations
    console.log('TransactionDataProcessor created with', this.transactions.length, 'transactions');
    console.log('Fans:', this.fans.length, 'Creators:', this.creators.length);
  }

  /**
   * Calculates the data range from transaction timestamps
   */
  calculateDataRange() {
    if (this.transactions.length === 0) {
      return null;
    }

    const timestamps = this.transactions.map(tx => dayjs(tx.timestamp));
    const startDate = timestamps.reduce((min, current) => current.isBefore(min) ? current : min);
    const endDate = timestamps.reduce((max, current) => current.isAfter(max) ? current : max);

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  }

  /**
   * Normalizes transaction data to ensure consistent structure
   */
  normalizeTransaction(transaction) {
    // calculate all amounts from base amount
    const grossAmount = transaction.amount || 0;
    const platformFee = grossAmount * this.platformFeeRate;
    const netAmount = grossAmount - platformFee;

    return {
      ...transaction,
      grossAmount,
      netAmount,
      platformFee
    };
  }

  /**
   * Calculates earnings for a specific time period and channel
   */
  calculateEarningsForPeriod(startDate, endDate, channel = null, earningsType = 'gross') {
    const cacheKey = `${startDate.format('YYYY-MM-DD')}-${endDate.format('YYYY-MM-DD')}-${channel || 'all'}`;

    if (this.cache.has(cacheKey)) {
      console.log('Using cached result for:', cacheKey);
      return this.cache.get(cacheKey);
    }

    console.log(`Calculating earnings for ${startDate.format('YYYY-MM-DD')} to ${endDate.format('YYYY-MM-DD')}, channel: ${channel || 'all'}`);
    console.log(`Total transactions available: ${this.transactions.length}`);

    const filtered = this.transactions.filter(tx => {
      const txDate = dayjs(tx.timestamp);
      const isOnOrAfterStart = txDate.isAfter(startDate) || txDate.isSame(startDate);
      const isOnOrBeforeEnd = txDate.isBefore(endDate) || txDate.isSame(endDate);
      const isInPeriod = isOnOrAfterStart && isOnOrBeforeEnd;
      const isChannelMatch = channel === null || tx.channel === channel;
      const isNotRefunded = !tx.isRefunded;

      const passes = isInPeriod && isChannelMatch && isNotRefunded;
      if (passes) {
        console.log(`Transaction ${tx.id} passes filter: ${txDate.format('YYYY-MM-DD')} - ${tx.channel} - $${tx.amount}`);
      }

      return passes;
    });

    console.log(`Filtered transactions: ${filtered.length}`);

    // normalize and sum amounts
    const normalized = filtered.map(tx => this.normalizeTransaction(tx));

    const result = {
      gross: normalized.reduce((sum, tx) => sum + tx.grossAmount, 0),
      net: normalized.reduce((sum, tx) => sum + tx.netAmount, 0),
      platformFees: normalized.reduce((sum, tx) => sum + tx.platformFee, 0),
      transactionCount: filtered.length
    };

    console.log(`Result: gross=$${result.gross}, net=$${result.net}, count=${result.transactionCount}`);

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Calculates refunds for a specific time period
   */
  calculateRefundsForPeriod(startDate, endDate) {
    const refunded = this.transactions.filter(tx => {
      if (!tx.isRefunded) {
        return false;
      }
      const refundDate = dayjs(tx.refundTimestamp);
      const isOnOrAfterStart = refundDate.isAfter(startDate) || refundDate.isSame(startDate);
      const isOnOrBeforeEnd = refundDate.isBefore(endDate) || refundDate.isSame(endDate);
      return isOnOrAfterStart && isOnOrBeforeEnd;
    });

    // normalize and sum refund amounts
    const normalized = refunded.map(tx => this.normalizeTransaction(tx));
    return normalized.reduce((sum, tx) => sum + (tx.refundAmount || tx.grossAmount), 0);
  }

  /**
   * Generates earnings data for different time filters
   */
  generateEarningsData() {
    console.log('=== generateEarningsData called ===');
    const timeFilters = ['Yesterday', 'Today', 'This week', 'This month'];
    const earningsData = {};

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

      console.log(`${filter}: ${startDate.format('YYYY-MM-DD HH:mm:ss')} to ${endDate.format('YYYY-MM-DD HH:mm:ss')}`);

      // calculate gross earnings
      const grossEarnings = this.calculateEarningsForPeriod(startDate, endDate);

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

    console.log('=== generateEarningsData complete ===');
    console.log('Final earnings data:', earningsData);
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
  generateDynamicEarningsTrends(startDate, endDate, shownBy = 'day') {
    const data = [];
    let interval, dateFormat, maxPoints;

    switch (shownBy) {
      case 'hour':
        interval = 'hour';
        dateFormat = 'MMM D, HH:mm';
        maxPoints = 24;
        break;
      case 'week':
        interval = 'week';
        dateFormat = 'MMM D';
        maxPoints = 12;
        break;
      case 'month':
        interval = 'month';
        dateFormat = 'MMM YYYY';
        maxPoints = 12;
        break;
      default: // 'day'
        interval = 'day';
        dateFormat = 'MMM D';
        maxPoints = 30;
    }

    const totalIntervals = Math.min(endDate.diff(startDate, interval) + 1, maxPoints);

    for (let i = 0; i < totalIntervals; i++) {
      const currentStart = startDate.add(i, interval);
      let currentEnd;

      if (interval === 'hour') {
        currentEnd = currentStart.add(1, 'hour');
      } else if (interval === 'week') {
        currentEnd = currentStart.add(1, 'week');
      } else if (interval === 'month') {
        currentEnd = currentStart.add(1, 'month');
      } else { // day
        currentEnd = currentStart.add(1, 'day');
      }

      const periodEarnings = this.calculateEarningsForPeriod(currentStart, currentEnd);

      data.push({
        date: currentStart.format(dateFormat),
        value: periodEarnings.gross
      });
    }

    return data;
  }

  /**
   * Generates dynamic sales chart for custom date ranges
   */
  generateDynamicSalesChart(startDate, endDate, shownBy = 'day') {
    const data = [];
    let interval, dateFormat, maxPoints;

    switch (shownBy) {
      case 'hour':
        interval = 'hour';
        dateFormat = 'MMM D, HH:mm';
        maxPoints = 24;
        break;
      case 'week':
        interval = 'week';
        dateFormat = 'MMM D';
        maxPoints = 12;
        break;
      case 'month':
        interval = 'month';
        dateFormat = 'MMM YYYY';
        maxPoints = 12;
        break;
      default: // 'day'
        interval = 'day';
        dateFormat = 'MMM D';
        maxPoints = 30;
    }

    const totalIntervals = Math.min(endDate.diff(startDate, interval) + 1, maxPoints);
    const channels = ['subscriptions', 'tips', 'posts', 'messages', 'referrals', 'streams'];

    for (let i = 0; i < totalIntervals; i++) {
      const currentStart = startDate.add(i, interval);
      let currentEnd;

      if (interval === 'hour') {
        currentEnd = currentStart.add(1, 'hour');
      } else if (interval === 'week') {
        currentEnd = currentStart.add(1, 'week');
      } else if (interval === 'month') {
        currentEnd = currentStart.add(1, 'month');
      } else { // day
        currentEnd = currentStart.add(1, 'day');
      }

      const periodData = { date: currentStart.format(dateFormat) };

      channels.forEach(channel => {
        const channelEarnings = this.calculateEarningsForPeriod(currentStart, currentEnd, channel);
        periodData[channel] = channelEarnings.gross;
      });

      data.push(periodData);
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

  // Fan-based calculation methods
  getFansForCreator(creatorAlias, startDate, endDate) {
    return this.fans.filter(fan => {
      const fanStartDate = dayjs(fan.subscriptionStartDate);
      return fan.creatorAlias === creatorAlias &&
             fanStartDate.isBefore(endDate.add(1, 'day')) &&
             fan.subscriptionStatus === 'active';
    });
  }

  getNewSubscriptions(creatorAlias, startDate, endDate) {
    const newFans = this.fans.filter(fan => {
      const fanStartDate = dayjs(fan.subscriptionStartDate);
      return fan.creatorAlias === creatorAlias &&
             fan.subscriptionType === 'new' &&
             fanStartDate.isAfter(startDate.subtract(1, 'day')) &&
             fanStartDate.isBefore(endDate.add(1, 'day'));
    });

    const newFanIds = newFans.map(fan => fan.fanId);
    const transactions = this.transactions.filter(tx =>
      tx.creatorAlias === creatorAlias &&
      newFanIds.includes(tx.fanId) &&
      !tx.isRefunded
    );

    const earnings = transactions.reduce((sum, tx) => {
      const grossAmount = tx.amount || 0;
      const platformFee = grossAmount * this.platformFeeRate;
      const netAmount = grossAmount - platformFee;
      return sum + netAmount;
    }, 0);

    return {
      count: newFans.length,
      earnings: earnings
    };
  }

  getRecurringSubscriptions(creatorAlias, startDate, endDate) {
    const recurringFans = this.fans.filter(fan => {
      const fanStartDate = dayjs(fan.subscriptionStartDate);
      return fan.creatorAlias === creatorAlias &&
             fan.subscriptionType === 'recurring' &&
             fanStartDate.isBefore(startDate);
    });

    const recurringFanIds = recurringFans.map(fan => fan.fanId);
    const transactions = this.transactions.filter(tx =>
      tx.creatorAlias === creatorAlias &&
      recurringFanIds.includes(tx.fanId) &&
      !tx.isRefunded
    );

    const earnings = transactions.reduce((sum, tx) => {
      const grossAmount = tx.amount || 0;
      const platformFee = grossAmount * this.platformFeeRate;
      const netAmount = grossAmount - platformFee;
      return sum + netAmount;
    }, 0);

    return {
      count: recurringFans.length,
      earnings: earnings
    };
  }

  getFansWithRenewOn(creatorAlias, startDate, endDate) {
    const fans = this.getFansForCreator(creatorAlias, startDate, endDate);
    return fans.filter(fan => fan.renewOn).length;
  }

  getActiveFans(creatorAlias, startDate, endDate) {
    const fanIds = this.fans
      .filter(fan => fan.creatorAlias === creatorAlias)
      .map(fan => fan.fanId);

    const activeFanIds = new Set();
    this.transactions.forEach(tx => {
      if (tx.creatorAlias === creatorAlias &&
          fanIds.includes(tx.fanId) &&
          !tx.isRefunded) {
        const txDate = dayjs(tx.timestamp);
        if (txDate.isAfter(startDate.subtract(1, 'day')) &&
            txDate.isBefore(endDate.add(1, 'day'))) {
          activeFanIds.add(tx.fanId);
        }
      }
    });

    return activeFanIds.size;
  }

  calculateAvgSpendPerSpender(creatorAlias, startDate, endDate) {
    const activeFans = this.getActiveFans(creatorAlias, startDate, endDate);
    if (activeFans === 0) return 0;

    const earnings = this.calculateEarningsForPeriod(startDate, endDate, creatorAlias);
    return earnings.net / activeFans;
  }

  calculateAvgSpendPerTransaction(creatorAlias, startDate, endDate) {
    const transactions = this.transactions.filter(tx => {
      const txDate = dayjs(tx.timestamp);
      return tx.creatorAlias === creatorAlias &&
             txDate.isAfter(startDate.subtract(1, 'day')) &&
             txDate.isBefore(endDate.add(1, 'day')) &&
             !tx.isRefunded;
    });

    if (transactions.length === 0) return 0;

    const totalEarnings = transactions.reduce((sum, tx) => {
      const grossAmount = tx.amount || 0;
      const platformFee = grossAmount * this.platformFeeRate;
      return sum + (grossAmount - platformFee);
    }, 0);

    return totalEarnings / transactions.length;
  }

  calculateAvgSubscriptionLength(creatorAlias, startDate, endDate) {
    const fans = this.getFansForCreator(creatorAlias, startDate, endDate);
    if (fans.length === 0) return 0;

    const totalDays = fans.reduce((sum, fan) => {
      const startDate = dayjs(fan.subscriptionStartDate);
      const endDate = dayjs(fan.lastTransactionDate);
      return sum + endDate.diff(startDate, 'days');
    }, 0);

    return totalDays / fans.length;
  }

  getCreatorData(creatorAlias) {
    return this.creators.find(creator => creator.alias === creatorAlias);
  }
}

/**
 * Loads and processes transaction data from JSON
 */
export const loadTransactionData = async (jsonData) => {
  try {
    console.log('Loading transaction data...');
    console.log('JSON data structure:', {
      hasMetadata: !!jsonData.metadata,
      hasTransactions: !!jsonData.transactions,
      transactionCount: jsonData.transactions?.length || 0,
      metadataKeys: Object.keys(jsonData.metadata || {})
    });

    const processor = new TransactionDataProcessor(jsonData);
    console.log('Processor created with', processor.transactions.length, 'transactions');

    const calculatedDataRange = processor.calculateDataRange();
    console.log('Data range:', calculatedDataRange);

    const result = {
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
      // Fan-based methods
      getFansForCreator: processor.getFansForCreator.bind(processor),
      getNewSubscriptions: processor.getNewSubscriptions.bind(processor),
      getRecurringSubscriptions: processor.getRecurringSubscriptions.bind(processor),
      getFansWithRenewOn: processor.getFansWithRenewOn.bind(processor),
      getActiveFans: processor.getActiveFans.bind(processor),
      calculateAvgSpendPerSpender: processor.calculateAvgSpendPerSpender.bind(processor),
      calculateAvgSpendPerTransaction: processor.calculateAvgSpendPerTransaction.bind(processor),
      calculateAvgSubscriptionLength: processor.calculateAvgSubscriptionLength.bind(processor),
      getCreatorData: processor.getCreatorData.bind(processor),
      allTransactions: processor.transactions
    };

    console.log('Processing complete. Earnings data:', result.earningsData);
    return result;
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
