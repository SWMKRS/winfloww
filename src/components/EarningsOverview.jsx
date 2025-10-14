import { useMemo } from 'react';
import { Row, Col } from 'antd';

import ofLogo from '../assets/of_logo.webp';
import overviewSubscriptions from '../assets/overview_subscriptions.png';
import overviewPosts from '../assets/overview_posts.png';
import overviewMessages from '../assets/overview_messages.png';
import overviewTips from '../assets/overview_tips.png';
import overviewReferrals from '../assets/overview_referrals.png';
import overviewStreams from '../assets/overview_streams.png';

import './EarningsOverview.css';

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

function EarningsOverview({ currentEarnings, padding = '0' }) {
  /**
   * Displays an overview of earnings with a total earnings circle and individual category cards.
   */
  const earningsData = useMemo(() => {
    return earningsConfig.map(config => ({
      ...config,
      amount: `$${currentEarnings[config.key].toFixed(2)}`
    }));
  }, [currentEarnings]);

  return (
    <div className="earnings-overview" style={{ padding }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={6}>
          <div className="total-earnings-circle">
            <img src={ofLogo} alt="OnlyFans" className="earnings-logo" />
            <div className="earnings-label">Total earnings</div>
            <div className="earnings-amount">${currentEarnings.total.toFixed(2)}</div>
          </div>
        </Col>
        <Col xs={24} lg={18}>
          <div className="earnings-cards-wrapper">
            <Row gutter={[16, 8]}>
              {earningsData.map((item, index) => (
                <Col xs={24} sm={12} md={8} lg={8} key={index}>
                  <div className="earnings-card">
                    <div className="earnings-card-content">
                      <div className="earnings-card-amount">{item.amount}</div>
                      <div className="earnings-card-title">{item.title}</div>
                    </div>
                    <div
                      className="earnings-card-icon"
                    //   style={{ background: item.bgColor }}
                    >
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

