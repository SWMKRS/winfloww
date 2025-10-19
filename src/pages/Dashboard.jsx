import { useState, useMemo } from 'react';
import { Card, Row, Col, Segmented, Tooltip, Empty, Select } from 'antd';
import {
  InfoCircleOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import { useData } from '../data/DataContext';
import EarningsOverview from '../components/EarningsOverview';
import noDataImage from '../assets/no_data.png';
import clockedInEmployeesLogo from '../assets/dashboard/clocked_in_employees_logo.png';

import './Dashboard.css';

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
        <div>Earnings: ${(data.value / 1000).toFixed(1)}K Growth: {growth}%</div>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const [timeFilter, setTimeFilter] = useState('This week');
  const [earningsType, setEarningsType] = useState('Gross earnings');
  const { processedData } = useData();

  // get current data based on filters
  const currentEarnings = useMemo(() => {
    return processedData.earningsData[timeFilter]?.[earningsType] || processedData.earningsData['This week']['Gross earnings'];
  }, [timeFilter, earningsType, processedData]);

  const salesChartData = useMemo(() => {
    return processedData.salesChartData[timeFilter] || processedData.salesChartData['This week'];
  }, [timeFilter, processedData]);

  const currentEmployees = useMemo(() => {
    return [];
  }, [timeFilter]);

  const currentShifts = useMemo(() => {
    return [];
  }, [timeFilter]);

  const currentScheduledHours = useMemo(() => {
    return [];
  }, [timeFilter]);

  const clockedInCount = useMemo(() => {
    return 0;
  }, [timeFilter, currentEmployees]);

  return (
    <div className="dashboard">
      {/* Creator Earnings Overview */}
      <Card
        className="dashboard-card earnings-overview-card"
        title={
          <div className="card-title-row">
            <div style={{ paddingTop: '70px' }}>
            </div>
            <span style={{ marginRight: '12px' }}>
              Creator earnings overview
              <Tooltip title="View your earnings breakdown">
                <InfoCircleOutlined style={{ marginLeft: 8, color: '#999' }} />
              </Tooltip>
            </span>
            <span className="timezone-label">
              UTC{processedData.metadata?.utcOffset ?? '-07:00'}
              <Tooltip title="Timezone information">
                <InfoCircleOutlined style={{ marginLeft: 6, color: '#999' }} />
              </Tooltip>
            </span>
          </div>
        }
        extra={
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Select
              className="earnings-type-select"
              value={earningsType}
              onChange={setEarningsType}
              style={{ width: 140 }}
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
        <div style={{ paddingBottom: '6px' }}>
          <EarningsOverview currentEarnings={currentEarnings} />
        </div>
      </Card>

      {/* Second Row: My Shifts, Clocked-in Employees, Employee Sales */}
      <div style={{ display: 'flex', gap: '16px', marginTop: 16, alignItems: 'stretch' }}>
        {/* My Shifts */}
        <Card
          className="dashboard-card shifts-card"
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
            image={noDataImage}
            description="No data"
            styles={{ image: { height: 100 } }}
          />
        </Card>

        {/* Right Column: Clocked-in Employees and Employee Sales */}
        <div style={{ flex: 1 }}>
          <Row gutter={[0, 16]}>
            {/* Current Clocked-in Employees */}
            <Col xs={24}>
              <Card
                className="dashboard-card employees-card"
                title={
                  <span>
                    Current clocked-in employees
                    <Tooltip title="See who is currently working">
                      <img
                        src={clockedInEmployeesLogo}
                        alt="Clocked-in employees"
                        style={{ marginLeft: 6, marginTop: -1, width: 18, height: 18, verticalAlign: 'middle' }}
                      />
                    </Tooltip>
                    <span className="employee-count">{clockedInCount}</span>
                  </span>
                }
              >
                <div className="empty-employees">
                    <Empty
                    image={noDataImage}
                    description="No employees have clocked in."
                    styles={{ image: { height: 100 } }}
                    />
                  {/* <p className="empty-text">No employees have clocked in.</p> */}
                </div>
              </Card>
            </Col>

            {/* Employee Sales Chart */}
            <Col xs={24}>
              <Card
                className="dashboard-card sales-chart-card"
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
                  axisLine={false}
                  tickLine={false}
                  width={60}
                  domain={[0, 1000]}
                  ticks={[0, 200, 400, 600, 800, 1000]}
                  tickFormatter={(value) => value.toLocaleString()}
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
                className="dashboard-card scheduled-hours-card"
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
              image={noDataImage}
              description="No data"
              styles={{ image: { height: 100 } }}
            />
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

