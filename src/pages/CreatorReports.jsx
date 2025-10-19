import { useState, useMemo, useEffect } from 'react';
import { Card, Row, Col, Tooltip, Empty, Select, Table, Button, Tabs, DatePicker } from 'antd';
import {
  InfoCircleOutlined,
  PieChartOutlined,
  DownloadOutlined,
  SettingOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Utility function to format numbers with commas
const formatNumber = (value) => {
  return value.toLocaleString();
};

// Utility function to calculate nice Y-axis ticks based on data range
const calculateNiceTicks = (data, dataKey) => {
  if (!data || data.length === 0) return [0];

  const values = [];

  // For LineChart, consider all data keys (subscriptions, tips, posts, etc.)
  if (dataKey === 'subscriptions' && data.length > 0) {
    const allKeys = ['subscriptions', 'tips', 'posts', 'messages', 'referrals', 'streams'];
    data.forEach(item => {
      allKeys.forEach(key => {
        if (typeof item[key] === 'number') {
          values.push(item[key]);
        }
      });
    });
  } else {
    // For BarChart, just use the specified dataKey
    data.forEach(item => {
      if (typeof item[dataKey] === 'number') {
        values.push(item[dataKey]);
      }
      // Handle nested objects like { gross: 100, net: 80 }
      if (typeof item[dataKey] === 'object' && item[dataKey] !== null) {
        const nestedValues = Object.values(item[dataKey]).filter(v => typeof v === 'number');
        values.push(...nestedValues);
      }
    });
  }

  if (values.length === 0) return [0];

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  if (maxValue === minValue) return [0, maxValue];

  // Calculate nice step size based on max value (starting from 0)
  const step = Math.pow(10, Math.floor(Math.log10(maxValue / 5)));
  const niceStep = step * Math.ceil(maxValue / step / 5);

  const ticks = [];
  let tick = 0;

  while (tick <= maxValue + niceStep) {
    ticks.push(tick);
    tick += niceStep;
  }

  return ticks;
};

import { useData } from '../data/DataContext';
import EarningsOverview from '../components/EarningsOverview';
import calendarIcon from '../assets/creator_reports/calendar_icon.png';
import chevronIcon from '../assets/icons/chevron.png';
import exportIcon from '../assets/creator_reports/export.png';
import customMetricsIcon from '../assets/creator_reports/custom_metrics.png';
import filtersIcon from '../assets/creator_reports/filters.png';
import noDataImage from '../assets/no_data.png';

import './CreatorReports.css';

const CustomTooltip = ({ active, payload, setHoveredBar }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // calculate growth (simplified - you might want to implement proper growth calculation)
    const growth = -49.91; // placeholder value matching the design

    // set the hovered bar for the reference line
    if (setHoveredBar) {
      setHoveredBar(data.date);
    }

    return (
      <div style={{
        // backgroundColor: '#4a4a4a',
        backgroundColor: '#000',
        opacity: 0.8,
        padding: '12px 16px',
        borderRadius: '5px',
        border: '1px solid #333',
        color: 'white',
        fontSize: '14px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ marginBottom: '2px' }}>{data.date}</div>
        <div style={{ marginBottom: '2px' }}>Earnings: ${data.value.toFixed(2)}</div>
        <div>Growth: {growth.toFixed(2)}%</div>
      </div>
    );
  } else if (setHoveredBar) {
    setHoveredBar(null);
  }
  return null;
};

const EarningsChannelTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // channel colors mapping
    const channelColors = {
      subscriptions: '#3b82f6',
      tips: '#06b6d4',
      posts: '#ef4444',
      messages: '#f59e0b',
      referrals: '#10b981',
      streams: '#a855f7'
    };

    return (
      <div style={{
        backgroundColor: '#000',
        opacity: 0.8,
        padding: '12px 16px',
        borderRadius: '5px',
        border: '1px solid #333',
        color: 'white',
        fontSize: '14px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ marginBottom: '6px' }}>{label}</div>
        {payload.map((entry, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: '180px',
            marginBottom: '2px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: channelColors[entry.dataKey] || '#999',
                marginRight: '8px'
              }} />
              <span style={{ textTransform: 'capitalize' }}>{entry.dataKey}</span>
            </div>
            <span style={{ fontWeight: 'bold' }}>${entry.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const { RangePicker } = DatePicker;

function CreatorReports() {
  const [timeFilter, setTimeFilter] = useState('This week');
  const [earningsType, setEarningsType] = useState('Net earnings');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState([dayjs('2025-10-01'), dayjs('2025-10-08')]);
  const [shownBy, setShownBy] = useState('day');
  const [selectedPreset, setSelectedPreset] = useState('Custom');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tableSort, setTableSort] = useState({ field: null, order: null });
  const { processedData, isLoading, error } = useData();

  // calculate available "shown by" options based on date range
  const availableShownByOptions = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return [
        { value: 'hour', label: 'Shown by hour', disabled: true },
        { value: 'day', label: 'Shown by day' },
        { value: 'week', label: 'Shown by week', disabled: true },
        { value: 'month', label: 'Shown by month', disabled: true }
      ];
    }

    const startDate = dateRange[0];
    const endDate = dateRange[1];
    const daysDiff = endDate.diff(startDate, 'days');
    const weeksDiff = endDate.diff(startDate, 'weeks');
    const monthsDiff = endDate.diff(startDate, 'months');

    const options = [
      {
        value: 'hour',
        label: 'Shown by hour',
        disabled: true // always disabled
      },
      {
        value: 'day',
        label: 'Shown by day',
        disabled: false // always available
      },
      {
        value: 'week',
        label: 'Shown by week',
        disabled: weeksDiff < 1 // need at least 1 week
      },
      {
        value: 'month',
        label: 'Shown by month',
        disabled: monthsDiff < 1 // need at least 1 month
      }
    ];

    return options;
  }, [dateRange]);

  // auto-switch to valid "shown by" option if current selection becomes disabled
  useEffect(() => {
    const currentOption = availableShownByOptions.find(opt => opt.value === shownBy);
    if (currentOption && currentOption.disabled) {
      // Find the first enabled option, defaulting to 'day'
      const validOption = availableShownByOptions.find(opt => !opt.disabled) || { value: 'day' };
      setShownBy(validOption.value);
    }
  }, [availableShownByOptions, shownBy]);

  // handle preset selection
  const handlePresetClick = (label, range) => {
    setSelectedPreset(label);
    setDateRange(range);
    setPickerOpen(false);
  };

  // helper function to render percentage change
  const renderPercentageChange = (change) => {
    if (change === undefined || change === null) return null;
    const color = change > 0 ? '#10b981' : '#ef4444';
    const sign = change > 0 ? '+' : '';
    return (
      <span style={{
        color,
        fontSize: '11px',
        fontWeight: 700,
        marginLeft: '8px'
      }}>
        {change.toFixed(2)}%
      </span>
    );
  };

  // generate dynamic month presets (current month + 5 previous months)
  const monthPresets = useMemo(() => {
    const presets = [];
    const currentYear = dayjs().year();

    presets.push({
      label: currentYear.toString(),
      value: [dayjs(`${currentYear}-01-01`), dayjs(`${currentYear}-12-31`)]
    });

    for (let i = 0; i < 6; i++) {
      const monthDate = dayjs().subtract(i, 'month');
      const monthName = monthDate.format('MMMM');
      const startOfMonth = monthDate.startOf('month');
      const endOfMonth = monthDate.endOf('month');
      presets.push({
        label: monthName,
        value: [startOfMonth, endOfMonth]
      });
    }

    return presets;
  }, []);

  // calculate days in selected range
  const daysInRange = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return 7;
    return dateRange[1].diff(dateRange[0], 'day') + 1;
  }, [dateRange]);

  // get current data based on date range using dynamic calculations
  const currentEarnings = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return processedData.earningsData['This week'][earningsType] || processedData.earningsData['This week']['Gross earnings'];
    }

    const earnings = processedData.calculateEarningsForPeriod(dateRange[0], dateRange[1]);
    const channels = ['subscriptions', 'tips', 'posts', 'messages', 'referrals', 'streams'];
    const channelEarnings = {};

    channels.forEach(channel => {
      channelEarnings[channel] = processedData.calculateEarningsForPeriod(dateRange[0], dateRange[1], channel);
    });

    return {
      total: earningsType === 'Net earnings' ? earnings.net : earnings.gross,
      subscriptions: earningsType === 'Net earnings' ? channelEarnings.subscriptions.net : channelEarnings.subscriptions.gross,
      tips: earningsType === 'Net earnings' ? channelEarnings.tips.net : channelEarnings.tips.gross,
      posts: earningsType === 'Net earnings' ? channelEarnings.posts.net : channelEarnings.posts.gross,
      messages: earningsType === 'Net earnings' ? channelEarnings.messages.net : channelEarnings.messages.gross,
      referrals: earningsType === 'Net earnings' ? channelEarnings.referrals.net : channelEarnings.referrals.gross,
      streams: earningsType === 'Net earnings' ? channelEarnings.streams.net : channelEarnings.streams.gross
    };
  }, [dateRange, earningsType, processedData]);

  // generate dynamic chart data based on date range
  const dynamicEarningsTrends = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return processedData.generateDynamicEarningsTrends(dayjs('2025-10-01'), dayjs('2025-10-08'), shownBy);
    }
    return processedData.generateDynamicEarningsTrends(dateRange[0], dateRange[1], shownBy);
  }, [dateRange, processedData, shownBy]);

  const dynamicSalesChart = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return processedData.generateDynamicSalesChart(dayjs('2025-10-01'), dayjs('2025-10-08'), shownBy);
    }
    return processedData.generateDynamicSalesChart(dateRange[0], dateRange[1], shownBy);
  }, [dateRange, processedData, shownBy]);

  // calculate dynamic creator statistics based on date range
  const dynamicCreatorStatistics = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return {
        creators: 0,
        messageEarnings: 0,
        totalEarnings: 0,
        refunded: 0
      };
    }

    const startDate = dateRange[0];
    const endDate = dateRange[1];

    // Calculate earnings for the selected period
    const periodEarnings = processedData.calculateEarningsForPeriod(startDate, endDate);

    // Calculate refunds for the selected period
    const periodRefunds = processedData.calculateRefundsForPeriod(startDate, endDate);

    // Get unique creators from the period
    const periodTransactions = processedData.allTransactions.filter(tx => {
      const txDate = dayjs(tx.timestamp);
      return txDate.isAfter(startDate.subtract(1, 'day')) &&
             txDate.isBefore(endDate.add(1, 'day')) &&
             !tx.isRefunded;
    });

    const uniqueCreators = new Set(periodTransactions.map(tx => tx.creatorAlias)).size;

    // Calculate message earnings specifically
    const messageTransactions = periodTransactions.filter(tx => tx.channel === 'messages');
    const messageEarnings = messageTransactions.reduce((sum, tx) => {
      const grossAmount = tx.amount || 0;
      const platformFee = grossAmount * (processedData.metadata.platformFee || 0.2);
      const netAmount = grossAmount - platformFee;
      return sum + (earningsType === 'Net earnings' ? netAmount : grossAmount);
    }, 0);

    return {
      creators: uniqueCreators,
      messageEarnings: messageEarnings,
      totalEarnings: earningsType === 'Net earnings' ? periodEarnings.net : periodEarnings.gross,
      refunded: periodRefunds
    };
  }, [dateRange, processedData, earningsType]);

  // calculate dynamic creator table data based on date range
  const dynamicCreatorTableData = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return [];
    }

    const startDate = dateRange[0];
    const endDate = dateRange[1];
    const rangeLength = endDate.diff(startDate, 'days') + 1;

    // Calculate previous period (same length, immediately before current period)
    const previousEndDate = startDate.subtract(1, 'day');
    const previousStartDate = previousEndDate.subtract(rangeLength - 1, 'days');

    // Get transactions for current period
    const currentPeriodTransactions = processedData.allTransactions.filter(tx => {
      const txDate = dayjs(tx.timestamp);
      return txDate.isAfter(startDate.subtract(1, 'day')) &&
             txDate.isBefore(endDate.add(1, 'day')) &&
             !tx.isRefunded;
    });

    // Get transactions for previous period
    const previousPeriodTransactions = processedData.allTransactions.filter(tx => {
      const txDate = dayjs(tx.timestamp);
      return txDate.isAfter(previousStartDate.subtract(1, 'day')) &&
             txDate.isBefore(previousEndDate.add(1, 'day')) &&
             !tx.isRefunded;
    });

    const creators = [...new Set(currentPeriodTransactions.map(tx => tx.creatorAlias))];

        let tableData = creators.map(creator => {
          const currentCreatorTransactions = currentPeriodTransactions.filter(tx => tx.creatorAlias === creator);
          const previousCreatorTransactions = previousPeriodTransactions.filter(tx => tx.creatorAlias === creator);

          const calculateChannelEarnings = (transactions) => {
            return transactions.reduce((sum, tx) => {
              const grossAmount = tx.amount || 0;
              const platformFee = grossAmount * (processedData.metadata.platformFee || 0.2);
              const netAmount = grossAmount - platformFee;
              return sum + (earningsType === 'Net earnings' ? netAmount : grossAmount);
            }, 0);
          };

          const calculateChannelData = (channel) => {
            const currentTxs = currentCreatorTransactions.filter(tx => tx.channel === channel);
            const previousTxs = previousCreatorTransactions.filter(tx => tx.channel === channel);

            const currentEarnings = calculateChannelEarnings(currentTxs);
            const previousEarnings = calculateChannelEarnings(previousTxs);

            const change = previousEarnings > 0 ? ((currentEarnings - previousEarnings) / previousEarnings) * 100 : 0;

            return {
              earnings: currentEarnings,
              count: currentTxs.length,
              change: change
            };
          };

          const subscriptions = calculateChannelData('subscriptions');
          const tips = calculateChannelData('tips');
          const messages = calculateChannelData('messages');
          const posts = calculateChannelData('posts');
          const referrals = calculateChannelData('referrals');
          const streams = calculateChannelData('streams');

          const totalEarnings = subscriptions.earnings + tips.earnings + messages.earnings +
                               posts.earnings + referrals.earnings + streams.earnings;

          // Calculate total earnings for contribution percentage
          const allPeriodEarnings = processedData.calculateEarningsForPeriod(startDate, endDate);
          const totalPeriodEarnings = earningsType === 'Net earnings' ? allPeriodEarnings.net : allPeriodEarnings.gross;
          const contribution = totalPeriodEarnings > 0 ? (totalEarnings / totalPeriodEarnings) * 100 : 0;

          // Calculate previous period earnings for percentage changes
          const previousEarnings = calculateChannelEarnings(previousCreatorTransactions);

          // Calculate contribution percentage change
          const previousAllPeriodEarnings = processedData.calculateEarningsForPeriod(previousStartDate, previousEndDate);
          const previousTotalPeriodEarnings = earningsType === 'Net earnings' ? previousAllPeriodEarnings.net : previousAllPeriodEarnings.gross;
          const previousContribution = previousTotalPeriodEarnings > 0 ? (previousEarnings / previousTotalPeriodEarnings) * 100 : 0;
          const contributionChange = previousContribution > 0 ? ((contribution - previousContribution) / previousContribution) * 100 : 0;

          // Calculate total transaction count change
          const currentTotalTxs = currentCreatorTransactions.length;
          const previousTotalTxs = previousCreatorTransactions.length;
          const totalTxChange = previousTotalTxs > 0 ? ((currentTotalTxs - previousTotalTxs) / previousTotalTxs) * 100 : 0;

          // Calculate fan-based metrics
          const fans = processedData.getFansForCreator(creator, startDate, endDate);
          const newSubs = processedData.getNewSubscriptions(creator, startDate, endDate);
          const recurringSubs = processedData.getRecurringSubscriptions(creator, startDate, endDate);
          const fansWithRenew = processedData.getFansWithRenewOn(creator, startDate, endDate);
          const activeFans = processedData.getActiveFans(creator, startDate, endDate);
          const creatorData = processedData.getCreatorData(creator);

          // Calculate previous period metrics for percentage changes
          const previousFans = processedData.getFansForCreator(creator, previousStartDate, previousEndDate);
          const previousNewSubs = processedData.getNewSubscriptions(creator, previousStartDate, previousEndDate);
          const previousRecurringSubs = processedData.getRecurringSubscriptions(creator, previousStartDate, previousEndDate);
          const previousActiveFans = processedData.getActiveFans(creator, previousStartDate, previousEndDate);
          const previousAvgSpendPerSpender = processedData.calculateAvgSpendPerSpender(creator, previousStartDate, previousEndDate);
          const previousAvgSpendPerTransaction = processedData.calculateAvgSpendPerTransaction(creator, previousStartDate, previousEndDate);

          // Calculate percentage changes
          const newSubscriptionsChange = previousNewSubs.earnings > 0 ? ((newSubs.earnings - previousNewSubs.earnings) / previousNewSubs.earnings) * 100 : 0;
          const recurringSubscriptionsChange = previousRecurringSubs.earnings > 0 ? ((recurringSubs.earnings - previousRecurringSubs.earnings) / previousRecurringSubs.earnings) * 100 : 0;
          const totalEarningsChange = previousEarnings > 0 ? ((totalEarnings - previousEarnings) / previousEarnings) * 100 : 0;
          const activeFansChange = previousActiveFans > 0 ? ((activeFans - previousActiveFans) / previousActiveFans) * 100 : 0;
          const avgSpendPerSpenderChange = previousAvgSpendPerSpender > 0 ? ((processedData.calculateAvgSpendPerSpender(creator, startDate, endDate) - previousAvgSpendPerSpender) / previousAvgSpendPerSpender) * 100 : 0;
          const avgSpendPerTransactionChange = previousAvgSpendPerTransaction > 0 ? ((processedData.calculateAvgSpendPerTransaction(creator, startDate, endDate) - previousAvgSpendPerTransaction) / previousAvgSpendPerTransaction) * 100 : 0;

          return {
            key: creator,
            creator: creator,
            subscriptions: subscriptions.earnings.toFixed(2),
            subscriptionsCount: subscriptions.count,
            subscriptionsChange: subscriptions.change,
            newSubscriptions: `$${newSubs.earnings.toFixed(2)}`,
            newSubscriptionsCount: newSubs.count,
            newSubscriptionsChange: newSubscriptionsChange,
            recurringSubscriptions: `$${recurringSubs.earnings.toFixed(2)}`,
            recurringSubscriptionsCount: recurringSubs.count,
            recurringSubscriptionsChange: recurringSubscriptionsChange,
            tips: tips.earnings.toFixed(2),
            tipsCount: tips.count,
            tipsChange: tips.change,
            messages: messages.earnings.toFixed(2),
            messagesCount: messages.count,
            messagesChange: messages.change,
            posts: posts.earnings.toFixed(2),
            postsCount: posts.count,
            postsChange: posts.change,
            referrals: referrals.earnings.toFixed(2),
            referralsCount: referrals.count,
            referralsChange: referrals.change,
            streams: streams.earnings.toFixed(2),
            streamsCount: streams.count,
            streamsChange: streams.change,
            totalEarnings: totalEarnings.toFixed(2),
            totalEarningsChange: totalEarningsChange,
            contribution: contribution.toFixed(2),
            contributionChange: contributionChange,
            fans: fans.length,
            ofRanking: creatorData?.ofRanking || '',
            following: creatorData?.following || '',
            fansWithRenewOn: fansWithRenew,
            renewOnPercent: fans.length > 0 ? `${((fansWithRenew / fans.length) * 100).toFixed(2)}%` : '0.00%',
            newFans: newSubs.count,
            activeFans: activeFans,
            activeFansChange: activeFansChange,
            expiredFanCount: Math.floor(Math.random() * 50) + 20, // Placeholder for now
            avgSpendPerSpender: `$${processedData.calculateAvgSpendPerSpender(creator, startDate, endDate).toFixed(2)}`,
            avgSpendPerSpenderChange: avgSpendPerSpenderChange,
            avgSpendPerTransaction: `$${processedData.calculateAvgSpendPerTransaction(creator, startDate, endDate).toFixed(2)}`,
            avgSpendPerTransactionChange: avgSpendPerTransactionChange,
            avgEarningsPerFan: `$${(totalEarnings / Math.max(fans.length, 1)).toFixed(2)}`,
            avgSubscriptionLength: `${processedData.calculateAvgSubscriptionLength(creator, startDate, endDate).toFixed(0)} days`
          };
        });

        // apply sorting if specified
        if (tableSort.field && tableSort.order) {
          tableData.sort((a, b) => {
            let aValue, bValue;

            // handle different field types
            if (tableSort.field === 'creator') {
              aValue = a.creator.toLowerCase();
              bValue = b.creator.toLowerCase();
            } else if (tableSort.field === 'totalEarnings' || tableSort.field === 'contribution') {
              aValue = parseFloat(a[tableSort.field]);
              bValue = parseFloat(b[tableSort.field]);
            } else if (tableSort.field === 'totalTransactions') {
              aValue = a.totalTransactions;
              bValue = b.totalTransactions;
            } else {
              // for channel earnings fields
              aValue = parseFloat(a[tableSort.field]);
              bValue = parseFloat(b[tableSort.field]);
            }

            if (tableSort.order === 'ascend') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
        }

        return tableData;
  }, [dateRange, processedData, earningsType, tableSort]);

  // show loading state while data is being loaded
  if (isLoading) {
    return (
      <div className="creator-reports" style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading data...</div>
      </div>
    );
  }

  // show error state if there's an error
  if (error) {
    return (
      <div className="creator-reports" style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: 'red' }}>Error loading data: {error}</div>
      </div>
    );
  }

  return (
    <div className="creator-reports">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">
              Creator reports
              <span className="timezone-badge">
                UTC{processedData.metadata?.utcOffset ?? '-07:00'}
                <Tooltip title="Timezone information">
                  <InfoCircleOutlined style={{ marginLeft: 6, fontSize: 14 }} />
                </Tooltip>
              </span>
            </h1>
          </div>
        </div>

        <div className="page-header-content">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="page-tabs"
            items={[
              { key: 'overview', label: 'Overview' },
              { key: 'creator-performance', label: 'Creator performance' }
            ]}
          />

          <div className="page-filters">
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="MMM. DD, YYYY"
              suffixIcon={<img src={calendarIcon} alt="calendar" style={{ width: 17, height: 17 }} />}
              className="date-range-picker"
              dropdownClassName="custom-date-picker-dropdown"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              panelRender={(panelNode) => (
                <div className="custom-range-picker-panel">
                  <div className="custom-presets">
                    <div className={`preset-button ${selectedPreset === 'Custom' ? 'selected' : ''}`} onClick={() => handlePresetClick('Custom', dateRange)}>Custom</div>
                    <div className={`preset-button ${selectedPreset === 'Last 7 days' ? 'selected' : ''}`} onClick={() => handlePresetClick('Last 7 days', [dayjs().subtract(6, 'days'), dayjs()])}>Last 7 days</div>
                    <div className={`preset-button ${selectedPreset === 'Last 30 days' ? 'selected' : ''}`} onClick={() => handlePresetClick('Last 30 days', [dayjs().subtract(29, 'days'), dayjs()])}>Last 30 days</div>
                    <div className={`preset-button ${selectedPreset === 'Last 90 days' ? 'selected' : ''}`} onClick={() => handlePresetClick('Last 90 days', [dayjs().subtract(89, 'days'), dayjs()])}>Last 90 days</div>
                    <div className={`preset-button ${selectedPreset === 'Last 365 days' ? 'selected' : ''}`} onClick={() => handlePresetClick('Last 365 days', [dayjs().subtract(364, 'days'), dayjs()])}>Last 365 days</div>
                    <div className={`preset-button ${selectedPreset === '2025' ? 'selected' : ''}`} onClick={() => handlePresetClick('2025', [dayjs(`${dayjs().year()}-01-01`), dayjs(`${dayjs().year()}-12-31`)])}>2025</div>
                    {monthPresets.slice(1).map((preset) => (
                      <div key={preset.label} className={`preset-button ${selectedPreset === preset.label ? 'selected' : ''}`} onClick={() => handlePresetClick(preset.label, preset.value)}>{preset.label}</div>
                    ))}
                  </div>
                  {panelNode}
                </div>
              )}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Select
                value={shownBy}
                onChange={setShownBy}
                className="filter-select"
                popupClassName="custom-filter-dropdown"
                suffixIcon={<img src={chevronIcon} alt='' style={{ width: 10, height: 10, transform: 'rotate(90deg)', opacity: 0.6 }} />}
                options={availableShownByOptions}
              />
              <Tooltip title="Select time grouping">
                <InfoCircleOutlined style={{ color: '#aaa', fontSize: 13 }} />
              </Tooltip>
            </div>
            <Select
              value={earningsType}
              onChange={setEarningsType}
              className="filter-select"
              popupClassName="custom-filter-dropdown"
              suffixIcon={<img src={chevronIcon} alt='' style={{ width: 10, height: 10, transform: 'rotate(90deg)', opacity: 0.6 }} />}
              options={[
                { value: 'Gross earnings', label: 'Gross earnings' },
                { value: 'Net earnings', label: 'Net earnings' }
              ]}
            />
            <Button className="filters-button">
              <img src={filtersIcon} alt="filters" style={{ width: 12, height: 12 }} />
              Filters
            </Button>
          </div>
        </div>
      </div>

        <div className="creator-reports-container">

        {/* Earnings Summary */}
        <div className="earnings-summary-section">
            <h2 className="section-title">
            Earnings summary
            <Tooltip title="View your earnings breakdown">
                <InfoCircleOutlined style={{ marginLeft: 8, color: '#999', fontSize: 16 }} />
            </Tooltip>
            </h2>
            <EarningsOverview currentEarnings={currentEarnings} totalEarningsGapHack="10px" />
        </div>

        {/* Earnings Trends Section */}
        <div className="earnings-trends-section">
            <h2 className="section-title">
            Earnings trends
            <Tooltip title="View your earnings trends over time">
                <InfoCircleOutlined style={{ marginLeft: 8, color: '#999', fontSize: 16 }} />
            </Tooltip>
            </h2>

            <div className="earnings-trends-chart">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dynamicEarningsTrends} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e5e5"
                    vertical={false}
                    syncWithTicks={true}
                />
                <ReferenceLine y={0} stroke="#e5e5e5" strokeWidth={1} />
                <XAxis
                    dataKey="date"
                    stroke="#999"
                    style={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    stroke="#999"
                    style={{ fontSize: 12 }}
                    ticks={calculateNiceTicks(dynamicEarningsTrends, 'value')}
                    tickFormatter={formatNumber}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                />
                <RechartsTooltip
                    content={(props) => <CustomTooltip {...props} setHoveredBar={setHoveredBar} />}
                    cursor={false}
                />
                {/* {hoveredBar && (
                    <ReferenceLine
                        x={hoveredBar}
                        stroke="#ccc"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        zIndex={1000}
                    />
                )} */}
              <Bar
                dataKey="value"
                fill="#3467ff"
                maxBarSize={60}
              />
                {hoveredBar && (
                    <ReferenceLine
                        x={hoveredBar}
                        stroke="#ccc"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        zIndex={1000}
                    />
                )}
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>

        {/* Earnings by Channel */}
        <Row>
            <Col xs={24}>
            <Card
                className="creator-reports-card earnings-channel-card"
                title={
                <span>
                    Earnings by channel
                    <Tooltip title="View earnings breakdown by channel">
                    <InfoCircleOutlined style={{ marginLeft: 8, color: '#999' }} />
                    </Tooltip>
                </span>
                }
            >
                <div style={{ display: 'flex', gap: '24px', marginTop: '36px' }}>
                <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dynamicSalesChart}
                        margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                        <ReferenceLine y={0} stroke="#e5e5e5" strokeWidth={1} />
                        <XAxis
                        dataKey="date"
                        stroke="#999"
                        style={{ fontSize: 12 }}
                        padding={{ left: 20, right: 20 }}
                        axisLine={false}
                        tickLine={false}
                        />
                        <YAxis
                        stroke="#999"
                        style={{ fontSize: 12 }}
                        ticks={calculateNiceTicks(dynamicSalesChart, 'subscriptions')}
                        tickFormatter={formatNumber}
                        axisLine={false}
                        tickLine={false}
                        width={50}
                        domain={['dataMin', 'dataMax']}
                        />
                        <RechartsTooltip
                        content={<EarningsChannelTooltip />}
                        cursor={{ stroke: '#999', strokeWidth: 1, strokeDasharray: '5 5' }}
                        />
                        <Line
                        dataKey="subscriptions"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: 'white', stroke: '#3b82f6', strokeWidth: 2, r: 2 }}
                        />
                        <Line
                        dataKey="tips"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        dot={{ fill: 'white', stroke: '#06b6d4', strokeWidth: 2, r: 2 }}
                        />
                        <Line
                        dataKey="posts"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: 'white', stroke: '#ef4444', strokeWidth: 2, r: 2 }}
                        />
                        <Line
                        dataKey="messages"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: 'white', stroke: '#f59e0b', strokeWidth: 2, r: 2 }}
                        />
                        <Line
                        dataKey="referrals"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: 'white', stroke: '#10b981', strokeWidth: 2, r: 2 }}
                        />
                        <Line
                        dataKey="streams"
                        stroke="#a855f7"
                        strokeWidth={2}
                        dot={{ fill: 'white', stroke: '#a855f7', strokeWidth: 2, r: 2 }}
                        />
                    </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="earnings-legend">
                    <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></span>
                    <span className="legend-label">Subscriptions</span>
                    <span className="legend-percentage">{((currentEarnings.subscriptions / currentEarnings.total) * 100).toFixed(2)}%</span>
                    <span className="legend-amount">${currentEarnings.subscriptions.toFixed(2)}</span>
                    </div>
                    <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#06b6d4' }}></span>
                    <span className="legend-label">Tips</span>
                    <span className="legend-percentage">{((currentEarnings.tips / currentEarnings.total) * 100).toFixed(2)}%</span>
                    <span className="legend-amount">${currentEarnings.tips.toFixed(2)}</span>
                    </div>
                    <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#ef4444' }}></span>
                    <span className="legend-label">Posts</span>
                    <span className="legend-percentage">{((currentEarnings.posts / currentEarnings.total) * 100).toFixed(2)}%</span>
                    <span className="legend-amount">${currentEarnings.posts.toFixed(2)}</span>
                    </div>
                    <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                    <span className="legend-label">Messages</span>
                    <span className="legend-percentage">{((currentEarnings.messages / currentEarnings.total) * 100).toFixed(2)}%</span>
                    <span className="legend-amount">${currentEarnings.messages.toFixed(2)}</span>
                    </div>
                    <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
                    <span className="legend-label">Referrals</span>
                    <span className="legend-percentage">{((currentEarnings.referrals / currentEarnings.total) * 100).toFixed(2)}%</span>
                    <span className="legend-amount">${currentEarnings.referrals.toFixed(2)}</span>
                    </div>
                    <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#a855f7' }}></span>
                    <span className="legend-label">Streams</span>
                    <span className="legend-percentage">{((currentEarnings.streams / currentEarnings.total) * 100).toFixed(2)}%</span>
                    <span className="legend-amount">${currentEarnings.streams.toFixed(2)}</span>
                    </div>
                </div>
                </div>
            </Card>
            </Col>
        </Row>

        {/* Creator Statistics */}
        <Row>
            <Col xs={24}>
            <Card
                className="creator-reports-card creator-statistics-card"
                title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', flex: '1', minWidth: '300px' }}>
                        <span>Creator statistics</span>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#999' }}>
                        Percentage change is calculated based on the change in value in the selected time frame against the same time frame immediately before it.
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
                        <Button style={{ border: 'none', boxShadow: 'none', fontSize: '12px', background: 'transparent', paddingLeft: 0, paddingRight: 0 }}>
                            <img src={customMetricsIcon} alt="custom metrics" style={{ width: 16, height: 16, marginRight: 0 }} />
                            Custom metrics
                        </Button>
                        <Button className="filters-button">
                            <img src={exportIcon} alt="export" style={{ width: 12, height: 12 }} />
                            Export
                        </Button>
                    </div>
                </div>
                }
            >
                {/* Stats Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <div className="stat-card">
                    <div className="stat-value">{dynamicCreatorStatistics.creators}</div>
                    <div className="stat-label">
                        <span>Creators</span>
                        <Tooltip title="Total number of creators">
                        <InfoCircleOutlined style={{ fontSize: 14 }} />
                        </Tooltip>
                    </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <div className="stat-card">
                    <div className="stat-value">${dynamicCreatorStatistics.messageEarnings.toFixed(2)}</div>
                    <div className="stat-label">
                        <span>Message earnings</span>
                        <Tooltip title="Total earnings from messages">
                        <InfoCircleOutlined style={{ fontSize: 14 }} />
                        </Tooltip>
                    </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <div className="stat-card">
                    <div className="stat-value">${dynamicCreatorStatistics.totalEarnings.toFixed(2)}</div>
                    <div className="stat-label">
                        <span>Total earnings</span>
                        <Tooltip title="Total earnings across all channels">
                        <InfoCircleOutlined style={{ fontSize: 14 }} />
                        </Tooltip>
                    </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <div className="stat-card">
                    <div className="stat-value">${dynamicCreatorStatistics.refunded.toFixed(2)}</div>
                    <div className="stat-label">
                        <span>Refunded</span>
                        <Tooltip title="Total amount refunded">
                        <InfoCircleOutlined style={{ fontSize: 14 }} />
                        </Tooltip>
                    </div>
                    </div>
                </Col>
                </Row>

                {/* Creator Table */}
                <Table
                className="creator-table"
                scroll={{ x: 'max-content' }}
                onChange={(pagination, filters, sorter) => {
                    if (sorter && sorter.field) {
                        setTableSort({
                            field: sorter.field,
                            order: sorter.order
                        });
                    } else {
                        setTableSort({ field: null, order: null });
                    }
                }}
                columns={[
                    {
                    title: () => (
                        <span className="ant-table-column-title">
                        Creator <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'creator',
                    key: 'creator',
                    fixed: 'left',
                    width: 150,
                    },
                    {
                    title: () => (
                        <span>
                        Subscriptions <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'subscriptions',
                    key: 'subscriptions',
                    sorter: true,
                    width: 180,
                    render: (text, record) => (
                        <span>
                        ${text}
                        {record.subscriptionsChange !== undefined && (
                            <span style={{
                                color: record.subscriptionsChange >= 0 ? '#67d1ae' : '#ee8376',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginLeft: '8px'
                            }}>
                                {record.subscriptionsChange.toFixed(2)}%
                            </span>
                        )}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        New subscriptions <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'newSubscriptions',
                    key: 'newSubscriptions',
                    sorter: true,
                    width: 200,
                    render: (text, record) => (
                        <span>
                        {text}
                        {record.newSubscriptionsChange !== undefined && (
                            <span style={{
                                color: record.newSubscriptionsChange >= 0 ? '#67d1ae' : '#ee8376',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginLeft: '8px'
                            }}>
                                {record.newSubscriptionsChange.toFixed(2)}%
                            </span>
                        )}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        Recurring subscriptions <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'recurringSubscriptions',
                    key: 'recurringSubscriptions',
                    sorter: true,
                    width: 240,
                    render: (text, record) => (
                        <span>
                        {text}
                        {record.recurringSubscriptionsChange !== undefined && (
                            <span style={{
                                color: record.recurringSubscriptionsChange >= 0 ? '#67d1ae' : '#ee8376',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginLeft: '8px'
                            }}>
                                {record.recurringSubscriptionsChange.toFixed(2)}%
                            </span>
                        )}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        Tips <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'tips',
                    key: 'tips',
                    sorter: true,
                    width: 150,
                    render: (text) => `$${text}`,
                    },
                    {
                    title: () => (
                        <span>
                        Message <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'messages',
                    key: 'messages',
                    sorter: true,
                    width: 150,
                    render: (text) => `$${text}`,
                    },
                    {
                    title: () => (
                        <span>
                        Total earnings <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'totalEarnings',
                    key: 'totalEarnings',
                    sorter: true,
                    width: 180,
                    render: (text, record) => (
                        <span>
                        ${text}
                        {record.totalEarningsChange !== undefined && (
                            <span style={{
                                color: record.totalEarningsChange >= 0 ? '#67d1ae' : '#ee8376',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginLeft: '8px'
                            }}>
                                {record.totalEarningsChange.toFixed(2)}%
                            </span>
                        )}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        Contribution % <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'contribution',
                    key: 'contribution',
                    sorter: true,
                    width: 180,
                    render: (text, record) => (
                        <span>
                        {text}%
                        {record.contributionChange !== undefined && (
                            <span style={{
                                color: record.contributionChange >= 0 ? '#67d1ae' : '#ee8376',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginLeft: '8px'
                            }}>
                                {record.contributionChange.toFixed(2)}%
                            </span>
                        )}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        OF ranking <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'ofRanking',
                    key: 'ofRanking',
                    sorter: true,
                    width: 120,
                    render: (text) => text,
                    },
                    {
                    title: () => (
                        <span>
                        Following <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'following',
                    key: 'following',
                    sorter: true,
                    width: 120,
                    render: (text) => text,
                    },
                    {
                    title: () => (
                        <span>
                        Fans with renew on <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'fansWithRenewOn',
                    key: 'fansWithRenewOn',
                    sorter: true,
                    width: 170,
                    render: (text) => text,
                    },
                    {
                    title: () => (
                        <span>
                        Renew on % <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'renewOnPercent',
                    key: 'renewOnPercent',
                    sorter: true,
                    width: 130,
                    render: (text) => text,
                    },
                    {
                    title: () => (
                        <span>
                        New fans <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'newFans',
                    key: 'newFans',
                    sorter: true,
                    width: 120,
                    render: (text) => text,
                    },
                    {
                    title: () => (
                        <span>
                        Active fans <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'activeFans',
                    key: 'activeFans',
                    sorter: true,
                    width: 180,
                    render: (text, record) => (
                        <span>
                        {text}
                        {record.activeFansChange !== undefined && (
                            <span style={{
                                color: record.activeFansChange >= 0 ? '#67d1ae' : '#ee8376',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginLeft: '8px'
                            }}>
                                {record.activeFansChange.toFixed(2)}%
                            </span>
                        )}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        Change in expired fan count <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'expiredFanCount',
                    key: 'expiredFanCount',
                    sorter: true,
                    width: 200,
                    render: (text) => text,
                    },
                    {
                    title: () => (
                        <span>
                        Avg spend per spender <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'avgSpendPerSpender',
                    key: 'avgSpendPerSpender',
                    sorter: true,
                    width: 240,
                    render: (text, record) => (
                        <span>
                        {text}
                        {record.avgSpendPerSpenderChange !== undefined && (
                            <span style={{
                                color: record.avgSpendPerSpenderChange >= 0 ? '#67d1ae' : '#ee8376',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginLeft: '8px'
                            }}>
                                {record.avgSpendPerSpenderChange.toFixed(2)}%
                            </span>
                        )}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        Avg spend per transaction <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'avgSpendPerTransaction',
                    key: 'avgSpendPerTransaction',
                    sorter: true,
                    width: 250,
                    render: (text, record) => (
                        <span>
                        {text}
                        {record.avgSpendPerTransactionChange !== undefined && (
                            <span style={{
                                color: record.avgSpendPerTransactionChange >= 0 ? '#67d1ae' : '#ee8376',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginLeft: '8px'
                            }}>
                                {record.avgSpendPerTransactionChange.toFixed(2)}%
                            </span>
                        )}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        Avg earnings per fan <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'avgEarningsPerFan',
                    key: 'avgEarningsPerFan',
                    sorter: true,
                    width: 200,
                    render: (text) => text,
                    },
                    {
                    title: () => (
                        <span>
                        Avg subscription length <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'avgSubscriptionLength',
                    key: 'avgSubscriptionLength',
                    sorter: true,
                    width: 200,
                    render: (text) => text,
                    },
                    {
                    title: () => (
                        <span>
                        Subscriptions <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'subscriptions',
                    key: 'subscriptions',
                    sorter: true,
                    width: 180,
                    render: (text, record) => (
                        <span>
                        {text}
                        {renderPercentageChange(record.subscriptionsChange)}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        New subscriptions <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'newSubscriptions',
                    key: 'newSubscriptions',
                    sorter: true,
                    width: 200,
                    render: (text, record) => (
                        <span>
                        {text}
                        {renderPercentageChange(record.newSubscriptionsChange)}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        Recurring subscriptions <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'recurringSubscriptions',
                    key: 'recurringSubscriptions',
                    sorter: true,
                    width: 240,
                    render: (text, record) => (
                        <span>
                        {text}
                        {renderPercentageChange(record.recurringSubscriptionsChange)}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        Tips <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'tips',
                    key: 'tips',
                    sorter: true,
                    width: 120,
                    },
                    {
                    title: () => (
                        <span>
                        Message <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'message',
                    key: 'message',
                    sorter: true,
                    width: 120,
                    },
                    {
                    title: () => (
                        <span>
                        Total earnings <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'totalEarnings',
                    key: 'totalEarnings',
                    sorter: true,
                    width: 180,
                    render: (text, record) => (
                        <span>
                        {text}
                        {renderPercentageChange(record.totalEarningsChange)}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        Contribution % <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'contribution',
                    key: 'contribution',
                    sorter: true,
                    width: 180,
                    render: (text, record) => (
                        <span>
                        {text}
                        {renderPercentageChange(record.contributionChange)}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        OF ranking <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'ofRanking',
                    key: 'ofRanking',
                    sorter: true,
                    width: 120,
                    },
                    {
                    title: () => (
                        <span>
                        Following <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'following',
                    key: 'following',
                    sorter: true,
                    width: 120,
                    },
                    {
                    title: () => (
                        <span>
                        Fans with renew on <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'fansWithRenewOn',
                    key: 'fansWithRenewOn',
                    sorter: true,
                    width: 170,
                    },
                    {
                    title: () => (
                        <span>
                        Renew on % <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'renewOnPercent',
                    key: 'renewOnPercent',
                    sorter: true,
                    width: 130,
                    },
                    {
                    title: () => (
                        <span>
                        New fans <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'newFans',
                    key: 'newFans',
                    sorter: true,
                    width: 120,
                    },
                    {
                    title: () => (
                        <span>
                        Active fans <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'activeFans',
                    key: 'activeFans',
                    sorter: true,
                    width: 180,
                    render: (text, record) => (
                        <span>
                        {text}
                        {renderPercentageChange(record.activeFansChange)}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        Change in expired fan count <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'changeInExpiredFanCount',
                    key: 'changeInExpiredFanCount',
                    sorter: true,
                    width: 230,
                    },
                    {
                    title: () => (
                        <span>
                        Avg spend per spender <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'avgSpendPerSpender',
                    key: 'avgSpendPerSpender',
                    sorter: true,
                    width: 240,
                    render: (text, record) => (
                        <span>
                        {text}
                        {renderPercentageChange(record.avgSpendPerSpenderChange)}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        Avg spend per transaction <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'avgSpendPerTransaction',
                    key: 'avgSpendPerTransaction',
                    sorter: true,
                    width: 250,
                    render: (text, record) => (
                        <span>
                        {text}
                        {renderPercentageChange(record.avgSpendPerTransactionChange)}
                        </span>
                    ),
                    },
                    {
                    title: () => (
                        <span>
                        Avg earnings per fan <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'avgEarningsPerFan',
                    key: 'avgEarningsPerFan',
                    sorter: true,
                    width: 180,
                    },
                    {
                    title: () => (
                        <span>
                        Avg subscription length <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: '#999' }} />
                        </span>
                    ),
                    dataIndex: 'avgSubscriptionLength',
                    key: 'avgSubscriptionLength',
                    sorter: true,
                    width: 200,
                    },
                ]}
                dataSource={dynamicCreatorTableData}
                pagination={false}
                locale={{
                    emptyText: (
                    <Empty
                        image={noDataImage}
                        description="No data"
                        styles={{ image: { height: 80 } }}
                    />
                    ),
                }}
                />
            </Card>
            </Col>
        </Row>
        </div>
    </div>
  );
}

export default CreatorReports;

