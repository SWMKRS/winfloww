import { useMemo } from 'react';
import { Row, Col } from 'antd';

import ofLogo from '../assets/of_logo_circle.png';
import overviewSubscriptions from '../assets/earnings_overview/overview_subscriptions.png';
import overviewPosts from '../assets/earnings_overview/overview_posts.png';
import overviewMessages from '../assets/earnings_overview/overview_messages.png';
import overviewTips from '../assets/earnings_overview/overview_tips.png';
import overviewReferrals from '../assets/earnings_overview/overview_referrals.png';
import overviewStreams from '../assets/earnings_overview/overview_streams.png';

import './EarningsOverview.css';

const formatCurrency = (amount) => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const earningsConfig = [
  {
    key: 'subscriptions',
    title: 'Subscriptions',
    icon: overviewSubscriptions,
    color: '#10b981',
    bgColor: '#d1fae5'
  },
  {
    key: 'posts',
    title: 'Posts',
    icon: overviewPosts,
    color: '#06b6d4',
    bgColor: '#cffafe'
  },
  {
    key: 'messages',
    title: 'Messages',
    icon: overviewMessages,
    color: '#a855f7',
    bgColor: '#e9d5ff'
  },
  {
    key: 'tips',
    title: 'Tips',
    icon: overviewTips,
    color: '#f59e0b',
    bgColor: '#fef3c7'
  },
  {
    key: 'referrals',
    title: 'Referrals',
    icon: overviewReferrals,
    color: '#ef4444',
    bgColor: '#fee2e2'
  },
  {
    key: 'streams',
    title: 'Streams',
    icon: overviewStreams,
    color: '#3b82f6',
    bgColor: '#dbeafe'
  },
];

function EarningsOverview({ currentEarnings, padding = '0', totalEarningsGapHack = '0px' }) {
  /**
   * Displays an overview of earnings with a total earnings circle and individual category cards.
   */
  const earningsData = useMemo(() => {
    return earningsConfig.map(config => ({
      ...config,
      amount: `$${formatCurrency(currentEarnings[config.key])}`
    }));
  }, [currentEarnings]);

  return (
    <div className="earnings-overview" style={{ padding }}>
      <Row gutter={[0, 16]}>
        <Col xs={24} lg={6}>
          <div className="total-earnings-circle">
            <img src={ofLogo} alt="OnlyFans" className="earnings-logo" />
            <div className="earnings-label">Total earnings</div>
            <div style={{ height: totalEarningsGapHack }}></div>
            <div className="earnings-amount">
              <span className="earnings-dollar">$</span>
              <span className="earnings-number">
                {formatCurrency(currentEarnings.total)}
            </span>
            </div>
          </div>
        </Col>
        <Col xs={24} lg={18}>
          <div className="earnings-cards-wrapper">
            <Row gutter={[16, 28]}>
              {earningsData.map((item, index) => (
                <Col xs={24} sm={12} md={8} lg={8} key={index}>
                  <div className="earnings-card">
                    <div className="earnings-card-content">
                      <div className="earnings-card-amount">{item.amount}</div>
                      <div className="earnings-card-title">{item.title}</div>
                    </div>
                    <div className="earnings-card-icon">
                      <img src={item.icon} alt={item.title} />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default EarningsOverview;

