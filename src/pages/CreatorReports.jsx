import { useState, useMemo } from 'react';
import { Card, Row, Col, Segmented, Tooltip, Empty, Select, Table, Button } from 'antd';
import {
  InfoCircleOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  MessageOutlined,
  BulbOutlined,
  TeamOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { earningsData as mockEarningsData, salesChartData as mockSalesData, employeesData, shiftsData, scheduledHoursData } from '../data/mockData';
import './CreatorReports.css';

const earningsConfig = [
  {
    key: 'subscriptions',
    title: 'Subscriptions',
    icon: CreditCardOutlined,
    color: '#10b981',
    bgColor: '#d1fae5'
  },
  {
    key: 'posts',
    title: 'Posts',
    icon: FileTextOutlined,
    color: '#06b6d4',
    bgColor: '#cffafe'
  },
  {
    key: 'messages',
    title: 'Messages',
    icon: MessageOutlined,
    color: '#a855f7',
    bgColor: '#e9d5ff'
  },
  {
    key: 'tips',
    title: 'Tips',
    icon: BulbOutlined,
    color: '#f59e0b',
    bgColor: '#fef3c7'
  },
  {
    key: 'referrals',
    title: 'Referrals',
    icon: TeamOutlined,
    color: '#ef4444',
    bgColor: '#fee2e2'
  },
  {
    key: 'streams',
    title: 'Streams',
    icon: BarChartOutlined,
    color: '#3b82f6',
    bgColor: '#dbeafe'
  },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const growth = data.earnings > 0 ? ((data.value / data.earnings) * 100).toFixed(2) : 0;
    return (
      <div style={{
        backgroundColor: '#4a4a4a',
        padding: '12px 16px',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{data.date}</div>
        <div>Earnings: ${data.value.toFixed(2)} Growth: {growth}%</div>
      </div>
    );
  }
  return null;
};

function CreatorReports() {
  const [timeFilter, setTimeFilter] = useState('This week');
  const [earningsType, setEarningsType] = useState('Gross earnings');

  // Get current data based on filters
  const currentEarnings = useMemo(() => {
    return mockEarningsData[timeFilter]?.[earningsType] || mockEarningsData['This week']['Gross earnings'];
  }, [timeFilter, earningsType]);

  const earningsData = useMemo(() => {
    return earningsConfig.map(config => ({
      ...config,
      amount: `$${currentEarnings[config.key].toFixed(2)}`
    }));
  }, [currentEarnings]);

  const salesChartData = useMemo(() => {
    return mockSalesData[timeFilter] || mockSalesData['This week'];
  }, [timeFilter]);

  const currentEmployees = useMemo(() => {
    return employeesData[timeFilter] || [];
  }, [timeFilter]);

  const currentShifts = useMemo(() => {
    return shiftsData[timeFilter] || [];
  }, [timeFilter]);

  const currentScheduledHours = useMemo(() => {
    return scheduledHoursData[timeFilter] || [];
  }, [timeFilter]);

  const clockedInCount = useMemo(() => {
    if (timeFilter === 'Today') {
      return currentEmployees.filter(e => e.status === 'clocked-in').length;
    }
    return 0;
  }, [timeFilter, currentEmployees]);

  return (
    <div className="creator-reports">
      {/* Creator Earnings Overview */}
      <Card
        className="creator-reports-card earnings-overview-card"
        title={
          <div className="card-title-row">
            <div style={{ paddingTop: '90px' }}>
            </div>
            <span>
              Creator earnings overview
              <Tooltip title="View your earnings breakdown">
                <InfoCircleOutlined style={{ marginLeft: 8, color: '#999' }} />
              </Tooltip>
            </span>
            <span className="timezone-label">
              UTC-07:00
              <Tooltip title="Timezone information">
                <InfoCircleOutlined style={{ marginLeft: 6, color: '#999' }} />
              </Tooltip>
            </span>
          </div>
        }
        extra={
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Select
              className="earnings-type-select"
              value={earningsType}
              onChange={setEarningsType}
              style={{ width: 150 }}
              options={[
                { value: 'Gross earnings', label: 'Gross earnings' },
                { value: 'Net earnings', label: 'Net earnings' }
              ]}
            />
            <Segmented
              className="time-filter-segmented"
              options={['Yesterday', 'Today', 'This week', 'This month']}
              value={timeFilter}
              onChange={setTimeFilter}
            />
          </div>
        }
      >
        <Row gutter={[16, 16]}>
          {/* Total Earnings Circle */}
          <Col xs={24} lg={6}>
            <div className="total-earnings-circle">
              <img src="/of_logo.png" alt="OnlyFans" className="earnings-logo" />
              <div className="earnings-label">Total earnings</div>
              <div className="earnings-amount">${currentEarnings.total.toFixed(2)}</div>
            </div>
          </Col>

          {/* Earnings Cards Grid */}
          <Col xs={24} lg={18}>
            <div className="earnings-cards-wrapper">
              <Row gutter={[16, 8]}>
                {earningsData.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <Col xs={24} sm={12} md={8} lg={8} key={index}>
                      <div className="earnings-card">
                        <div className="earnings-card-content">
                          <div className="earnings-card-amount">{item.amount}</div>
                          <div className="earnings-card-title">{item.title}</div>
                        </div>
                        <div
                          className="earnings-card-icon"
                          style={{ background: item.bgColor, color: item.color }}
                        >
                          <IconComponent />
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Second Row: My Shifts, Clocked-in Employees, Employee Sales */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* My Shifts */}
        <Col xs={24} md={4}>
          <Card
            className="creator-reports-card shifts-card"
            title={
              <span>
                My shifts
                <Tooltip title="View your shift schedule">
                  <InfoCircleOutlined style={{ marginLeft: 8, color: '#999' }} />
                </Tooltip>
              </span>
            }
          >
            <Empty
              image="/infloww-assets/preload/messages/no-data.svg"
              description="No data"
              imageStyle={{ height: 80 }}
            />
          </Card>
        </Col>

        {/* Right Column: Clocked-in Employees and Employee Sales */}
        <Col xs={24} md={20}>
          <Row gutter={[0, 16]}>
            {/* Current Clocked-in Employees */}
            <Col xs={24}>
              <Card
                className="creator-reports-card employees-card"
                title={
                  <span>
                    Current clocked-in employees
                    <Tooltip title="See who is currently working">
                      <TeamOutlined style={{ marginLeft: 8, color: '#999' }} />
                    </Tooltip>
                    <span className="employee-count">{clockedInCount}</span>
                  </span>
                }
              >
                <div className="empty-employees">
                    <Empty
                    image="/infloww-assets/preload/messages/no-data.svg"
                    description="No employees have clocked in."
                    imageStyle={{ height: 80 }}
                    />
                  {/* <p className="empty-text">No employees have clocked in.</p> */}
                </div>
              </Card>
            </Col>

            {/* Employee Sales Chart */}
            <Col xs={24}>
              <Card
                className="creator-reports-card sales-chart-card"
                title={
                  <span>
                    Employee sales
                    <Tooltip title="Track employee performance">
                      <InfoCircleOutlined style={{ marginLeft: 8, color: '#999' }} />
                    </Tooltip>
                  </span>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d9d9d9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#999"
                      style={{ fontSize: 12 }}
                      padding={{ left: 80, right: 80 }}
                      axisLine={false}
                    />
                <YAxis
                  stroke="#999"
                  style={{ fontSize: 12 }}
                  ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                    <RechartsTooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: '#999', strokeWidth: 0.5, strokeDasharray: '3 3' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3467ff"
                      strokeWidth={3}
                      dot={{ fill: 'white', stroke: '#3467ff', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Scheduled Hours */}
            <Col xs={24}>
              <Card
                className="creator-reports-card scheduled-hours-card"
                title={
                  <span>
                    Scheduled hours
                    <Tooltip title="View scheduled work hours">
                      <InfoCircleOutlined style={{ marginLeft: 8, color: '#999' }} />
                    </Tooltip>
                  </span>
                }
              >
                <div className="empty-employees">
                  <Empty
                    image="/infloww-assets/preload/messages/no-data.svg"
                    description="No data"
                    imageStyle={{ height: 80 }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Earnings by Channel */}
      <Row style={{ marginTop: 16 }}>
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
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={salesChartData}>
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
                      ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <RechartsTooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: '#999', strokeWidth: 0.5, strokeDasharray: '3 3' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="earnings-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></span>
                  <span className="legend-label">Subscriptions</span>
                  <span className="legend-percentage">0%</span>
                  <span className="legend-amount">$0</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: '#06b6d4' }}></span>
                  <span className="legend-label">Tips</span>
                  <span className="legend-percentage">0%</span>
                  <span className="legend-amount">$0</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: '#ef4444' }}></span>
                  <span className="legend-label">Posts</span>
                  <span className="legend-percentage">0%</span>
                  <span className="legend-amount">$0</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                  <span className="legend-label">Messages</span>
                  <span className="legend-percentage">0%</span>
                  <span className="legend-amount">$0</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: '#06b6d4' }}></span>
                  <span className="legend-label">Referrals</span>
                  <span className="legend-percentage">0%</span>
                  <span className="legend-amount">$0</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: '#a855f7' }}></span>
                  <span className="legend-label">Streams</span>
                  <span className="legend-percentage">0%</span>
                  <span className="legend-amount">$0</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Creator Statistics */}
      <Row style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card
            className="creator-reports-card creator-statistics-card"
            title={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span>Creator statistics</span>
                <span style={{ fontSize: '13px', fontWeight: 400, color: '#999' }}>
                  Percentage change is calculated based on the change in value in the selected time frame against the same time frame immediately before it.
                </span>
              </div>
            }
            extra={
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button icon={<SettingOutlined />}>Custom metrics</Button>
                <Button icon={<DownloadOutlined />}>Export</Button>
              </div>
            }
          >
            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <div className="stat-card">
                  <div className="stat-value">0</div>
                  <div className="stat-label">
                    Creators
                    <Tooltip title="Total number of creators">
                      <InfoCircleOutlined style={{ marginLeft: 6, fontSize: 12 }} />
                    </Tooltip>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="stat-card">
                  <div className="stat-value">$0.00</div>
                  <div className="stat-label">
                    Message earnings
                    <Tooltip title="Total earnings from messages">
                      <InfoCircleOutlined style={{ marginLeft: 6, fontSize: 12 }} />
                    </Tooltip>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="stat-card">
                  <div className="stat-value">$0.00</div>
                  <div className="stat-label">
                    Total earnings
                    <Tooltip title="Total earnings across all channels">
                      <InfoCircleOutlined style={{ marginLeft: 6, fontSize: 12 }} />
                    </Tooltip>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="stat-card">
                  <div className="stat-value">$0.00</div>
                  <div className="stat-label">
                    Refunded
                    <Tooltip title="Total amount refunded">
                      <InfoCircleOutlined style={{ marginLeft: 6, fontSize: 12 }} />
                    </Tooltip>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Creator Table */}
            <Table
              className="creator-table"
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
                },
              ]}
              dataSource={[]}
              pagination={false}
              locale={{
                emptyText: (
                  <Empty
                    image="/infloww-assets/preload/messages/no-data.svg"
                    description="No data"
                    imageStyle={{ height: 80 }}
                  />
                ),
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default CreatorReports;

