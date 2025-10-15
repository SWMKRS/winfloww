import { useState, useMemo } from 'react';
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

import { earningsData as mockEarningsData } from '../data/mockData';
import EarningsOverview from '../components/EarningsOverview';
import calendarIcon from '../assets/creator_reports/calendar_icon.png';
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

const earningsTrendsData = [
  { date: 'Oct 5', value: 210 },
  { date: 'Oct 6', value: 1420 },
  { date: 'Oct 7', value: 285 },
  { date: 'Oct 8', value: 350 },
  { date: 'Oct 9', value: 195 },
  { date: 'Oct 10', value: 280 },
  { date: 'Oct 11', value: 165 },
];

const salesChartData = [
  { date: 'Oct 5', subscriptions: 850, tips: 120, posts: 450, messages: 320, referrals: 0, streams: 0 },
  { date: 'Oct 6', subscriptions: 920, tips: 180, posts: 520, messages: 410, referrals: 0, streams: 0 },
  { date: 'Oct 7', subscriptions: 780, tips: 145, posts: 390, messages: 350, referrals: 0, streams: 0 },
  { date: 'Oct 8', subscriptions: 890, tips: 165, posts: 480, messages: 380, referrals: 0, streams: 0 },
  { date: 'Oct 9', subscriptions: 740, tips: 135, posts: 360, messages: 310, referrals: 0, streams: 0 },
  { date: 'Oct 10', subscriptions: 860, tips: 155, posts: 440, messages: 365, referrals: 0, streams: 0 },
  { date: 'Oct 11', subscriptions: 720, tips: 125, posts: 340, messages: 295, referrals: 0, streams: 0 },
];

const creatorStatistics = {
  creators: 8,
  messageEarnings: 4523.75,
  totalEarnings: 12856.50,
  refunded: 245.00
};

const creatorTableData = [
  {
    key: '1',
    creator: '@sophia_rose',
    subscriptions: '$2,450.00',
    subscriptionsChange: 8.5,
    newSubscriptions: 45,
    newSubscriptionsChange: 12.5,
    recurringSubscriptions: 120,
    recurringSubscriptionsChange: 5.3,
    tips: '$890.50',
    message: '$1,234.25',
    totalEarnings: '$4,574.75',
    totalEarningsChange: 15.2,
    contribution: '35.6%',
    contributionChange: 2.4,
    ofRanking: '0.8%',
    following: '125K',
    fansWithRenewOn: 98,
    renewOnPercent: '81.7%',
    newFans: 52,
    activeFans: 165,
    activeFansChange: 7.8,
    changeInExpiredFanCount: '-8',
    avgSpendPerSpender: '$27.73',
    avgSpendPerSpenderChange: 13.1,
    avgSpendPerTransaction: '$18.45',
    avgSpendPerTransactionChange: 11.4,
    avgEarningsPerFan: '$27.73',
    avgSubscriptionLength: '4.2 months'
  },
  {
    key: '2',
    creator: '@emma_jade',
    subscriptions: '$1,890.00',
    subscriptionsChange: 6.2,
    newSubscriptions: 32,
    newSubscriptionsChange: 9.5,
    recurringSubscriptions: 95,
    recurringSubscriptionsChange: 3.8,
    tips: '$645.25',
    message: '$987.50',
    totalEarnings: '$3,522.75',
    totalEarningsChange: 10.7,
    contribution: '27.4%',
    contributionChange: 1.8,
    ofRanking: '1.2%',
    following: '98K',
    fansWithRenewOn: 76,
    renewOnPercent: '80.0%',
    newFans: 38,
    activeFans: 142,
    activeFansChange: 5.9,
    changeInExpiredFanCount: '-5',
    avgSpendPerSpender: '$24.81',
    avgSpendPerSpenderChange: 9.5,
    avgSpendPerTransaction: '$16.92',
    avgSpendPerTransactionChange: 8.6,
    avgEarningsPerFan: '$24.81',
    avgSubscriptionLength: '3.8 months'
  },
  {
    key: '3',
    creator: '@ava_luna',
    subscriptions: '$1,560.00',
    subscriptionsChange: -2.3,
    newSubscriptions: 28,
    newSubscriptionsChange: 7.2,
    recurringSubscriptions: 82,
    recurringSubscriptionsChange: 2.5,
    tips: '$523.75',
    message: '$768.90',
    totalEarnings: '$2,852.65',
    totalEarningsChange: 8.4,
    contribution: '22.2%',
    contributionChange: -1.2,
    ofRanking: '1.5%',
    following: '76K',
    fansWithRenewOn: 65,
    renewOnPercent: '79.3%',
    newFans: 31,
    activeFans: 118,
    activeFansChange: 5.3,
    changeInExpiredFanCount: '-3',
    avgSpendPerSpender: '$24.17',
    avgSpendPerSpenderChange: 8.4,
    avgSpendPerTransaction: '$15.73',
    avgSpendPerTransactionChange: 6.6,
    avgEarningsPerFan: '$24.17',
    avgSubscriptionLength: '3.5 months'
  },
  {
    key: '4',
    creator: '@mia_grace',
    subscriptions: '$1,240.00',
    subscriptionsChange: 4.1,
    newSubscriptions: 22,
    newSubscriptionsChange: 0,
    recurringSubscriptions: 68,
    recurringSubscriptionsChange: 1.5,
    tips: '$412.50',
    message: '$645.30',
    totalEarnings: '$2,297.80',
    totalEarningsChange: 6.3,
    contribution: '17.9%',
    contributionChange: 0.9,
    ofRanking: '2.1%',
    following: '62K',
    fansWithRenewOn: 54,
    renewOnPercent: '79.4%',
    newFans: 25,
    activeFans: 98,
    activeFansChange: 4.2,
    changeInExpiredFanCount: '-2',
    avgSpendPerSpender: '$23.45',
    avgSpendPerSpenderChange: 7.1,
    avgSpendPerTransaction: '$14.87',
    avgSpendPerTransactionChange: 5.5,
    avgEarningsPerFan: '$23.45',
    avgSubscriptionLength: '3.2 months'
  },
  {
    key: '5',
    creator: '@olivia_sky',
    subscriptions: '$980.00',
    subscriptionsChange: -3.8,
    newSubscriptions: 18,
    newSubscriptionsChange: 5.9,
    recurringSubscriptions: 54,
    recurringSubscriptionsChange: -1.8,
    tips: '$325.40',
    message: '$489.75',
    totalEarnings: '$1,795.15',
    totalEarningsChange: 3.2,
    contribution: '14.0%',
    contributionChange: -0.5,
    ofRanking: '2.8%',
    following: '48K',
    fansWithRenewOn: 43,
    renewOnPercent: '79.6%',
    newFans: 20,
    activeFans: 82,
    activeFansChange: 3.8,
    changeInExpiredFanCount: '-1',
    avgSpendPerSpender: '$21.89',
    avgSpendPerSpenderChange: 5.9,
    avgSpendPerTransaction: '$13.54',
    avgSpendPerTransactionChange: 5.0,
    avgEarningsPerFan: '$21.89',
    avgSubscriptionLength: '2.9 months'
  }
];

function CreatorReports() {
  const [timeFilter, setTimeFilter] = useState('This week');
  const [earningsType, setEarningsType] = useState('Net earnings');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState([dayjs().subtract(6, 'days'), dayjs()]);
  const [shownBy, setShownBy] = useState('day');
  const [selectedPreset, setSelectedPreset] = useState('Last 7 days');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);

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
        {sign}{change.toFixed(1)}%
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

  // get current data based on date range
  const currentEarnings = useMemo(() => {
    // scale earnings based on days in range
    const baseEarnings = mockEarningsData['This week'][earningsType] || mockEarningsData['This week']['Gross earnings'];
    const scaleFactor = daysInRange / 7;

    return {
      total: baseEarnings.total * scaleFactor,
      subscriptions: baseEarnings.subscriptions * scaleFactor,
      posts: baseEarnings.posts * scaleFactor,
      messages: baseEarnings.messages * scaleFactor,
      tips: baseEarnings.tips * scaleFactor,
      referrals: baseEarnings.referrals * scaleFactor,
      streams: baseEarnings.streams * scaleFactor
    };
  }, [dateRange, earningsType, daysInRange]);

  // generate dynamic chart data based on date range
  const dynamicEarningsTrends = useMemo(() => {
    const data = [];
    const days = Math.min(daysInRange, 30);

    for (let i = 0; i < days; i++) {
      const date = dateRange[0].add(i, 'day');
      const baseValue = 200 + Math.random() * 300;
      data.push({
        date: date.format('MMM D'),
        value: baseValue
      });
    }

    return data;
  }, [dateRange, daysInRange]);

  const dynamicSalesChart = useMemo(() => {
    const data = [];
    const days = Math.min(daysInRange, 30);

    for (let i = 0; i < days; i++) {
      const date = dateRange[0].add(i, 'day');
      data.push({
        date: date.format('MMM D'),
        subscriptions: 700 + Math.floor(Math.random() * 300),
        tips: 100 + Math.floor(Math.random() * 100),
        posts: 300 + Math.floor(Math.random() * 250),
        messages: 250 + Math.floor(Math.random() * 200),
        referrals: 0,
        streams: 0
      });
    }

    return data;
  }, [dateRange, daysInRange]);

  return (
    <div className="creator-reports">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">
              Creator reports
              <span className="timezone-badge">
                UTC+02:00
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
                options={[
                  { value: 'hour', label: 'Shown by hour', disabled: true },
                  { value: 'day', label: 'Shown by day' },
                  { value: 'week', label: 'Shown by week' },
                  { value: 'month', label: 'Shown by month' }
                ]}
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
            <EarningsOverview currentEarnings={currentEarnings} />
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
                <BarChart data={dynamicEarningsTrends} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e5e5"
                    vertical={false}
                    syncWithTicks={true}
                />
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
                    ticks={[0, 300, 600, 900, 1200, 1500]}
                    axisLine={false}
                    tickLine={false}
                    width={40}
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
                        // margin={{ top: 16}}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
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
                        ticks={[0, 200, 400, 600, 800, 1000]}
                        axisLine={false}
                        tickLine={false}
                        width={40}
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
                    <span className="legend-percentage">{((currentEarnings.subscriptions / currentEarnings.total) * 100).toFixed(1)}%</span>
                    <span className="legend-amount">${currentEarnings.subscriptions.toFixed(0)}</span>
                    </div>
                    <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#06b6d4' }}></span>
                    <span className="legend-label">Tips</span>
                    <span className="legend-percentage">{((currentEarnings.tips / currentEarnings.total) * 100).toFixed(1)}%</span>
                    <span className="legend-amount">${currentEarnings.tips.toFixed(0)}</span>
                    </div>
                    <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#ef4444' }}></span>
                    <span className="legend-label">Posts</span>
                    <span className="legend-percentage">{((currentEarnings.posts / currentEarnings.total) * 100).toFixed(1)}%</span>
                    <span className="legend-amount">${currentEarnings.posts.toFixed(0)}</span>
                    </div>
                    <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                    <span className="legend-label">Messages</span>
                    <span className="legend-percentage">{((currentEarnings.messages / currentEarnings.total) * 100).toFixed(1)}%</span>
                    <span className="legend-amount">${currentEarnings.messages.toFixed(0)}</span>
                    </div>
                    <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
                    <span className="legend-label">Referrals</span>
                    <span className="legend-percentage">{((currentEarnings.referrals / currentEarnings.total) * 100).toFixed(1)}%</span>
                    <span className="legend-amount">${currentEarnings.referrals.toFixed(0)}</span>
                    </div>
                    <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#a855f7' }}></span>
                    <span className="legend-label">Streams</span>
                    <span className="legend-percentage">{((currentEarnings.streams / currentEarnings.total) * 100).toFixed(1)}%</span>
                    <span className="legend-amount">${currentEarnings.streams.toFixed(0)}</span>
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
                        <span style={{ fontSize: '14px', fontWeight: 400, color: '#999' }}>
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
                    <div className="stat-value">{creatorStatistics.creators}</div>
                    <div className="stat-label">
                        <span>Creators</span>
                        <Tooltip title="Total number of creators">
                        <InfoCircleOutlined style={{ fontSize: 12 }} />
                        </Tooltip>
                    </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <div className="stat-card">
                    <div className="stat-value">${creatorStatistics.messageEarnings.toFixed(2)}</div>
                    <div className="stat-label">
                        <span>Message earnings</span>
                        <Tooltip title="Total earnings from messages">
                        <InfoCircleOutlined style={{ fontSize: 12 }} />
                        </Tooltip>
                    </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <div className="stat-card">
                    <div className="stat-value">${creatorStatistics.totalEarnings.toFixed(2)}</div>
                    <div className="stat-label">
                        <span>Total earnings</span>
                        <Tooltip title="Total earnings across all channels">
                        <InfoCircleOutlined style={{ fontSize: 12 }} />
                        </Tooltip>
                    </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <div className="stat-card">
                    <div className="stat-value">${creatorStatistics.refunded.toFixed(2)}</div>
                    <div className="stat-label">
                        <span>Refunded</span>
                        <Tooltip title="Total amount refunded">
                        <InfoCircleOutlined style={{ fontSize: 12 }} />
                        </Tooltip>
                    </div>
                    </div>
                </Col>
                </Row>

                {/* Creator Table */}
                <Table
                className="creator-table"
                scroll={{ x: 'max-content' }}
                columns={[
                    {
                    title: () => (
                        <span>
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
                dataSource={creatorTableData}
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

