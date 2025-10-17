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

import { useData } from '../data/DataContext';
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

function CreatorReports() {
  const [timeFilter, setTimeFilter] = useState('This week');
  const [earningsType, setEarningsType] = useState('Net earnings');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState([dayjs().subtract(6, 'days'), dayjs()]);
  const [shownBy, setShownBy] = useState('day');
  const [selectedPreset, setSelectedPreset] = useState('Last 7 days');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const { processedData } = useData();

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
  }, [dateRange, earningsType]);

  // generate dynamic chart data based on date range
  const dynamicEarningsTrends = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return processedData.generateDynamicEarningsTrends(dayjs().subtract(6, 'days'), dayjs());
    }
    return processedData.generateDynamicEarningsTrends(dateRange[0], dateRange[1]);
  }, [dateRange]);

  const dynamicSalesChart = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return processedData.generateDynamicSalesChart(dayjs().subtract(6, 'days'), dayjs());
    }
    return processedData.generateDynamicSalesChart(dateRange[0], dateRange[1]);
  }, [dateRange]);

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
                    <div className="stat-value">{processedData.creatorStatistics.creators}</div>
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
                    <div className="stat-value">${processedData.creatorStatistics.messageEarnings.toFixed(2)}</div>
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
                    <div className="stat-value">${processedData.creatorStatistics.totalEarnings.toFixed(2)}</div>
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
                    <div className="stat-value">${processedData.creatorStatistics.refunded.toFixed(2)}</div>
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
                dataSource={processedData.creatorTableData}
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

