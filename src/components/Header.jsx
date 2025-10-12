import { Layout, Badge, Button, Dropdown, Space } from 'antd';
import {
  BellOutlined,
  GlobalOutlined,
  TeamOutlined,
  TrophyOutlined,
  DownOutlined,
} from '@ant-design/icons';
import './Header.css';

const { Header: AntHeader } = Layout;

function Header() {
  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
    },
    {
      key: 'settings',
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
    },
  ];

  return (
    <AntHeader className="app-header">
      <div className="header-left">
        {/* Trial Banner */}
        <div className="trial-banner">
          <div className="trial-icon">⚡</div>
          <div className="trial-text">
            <div>You're on a free trial</div>
            <div className="trial-days">14 days left</div>
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Status */}
        <div className="status-badge operational">
          <span className="status-dot"></span>
          <span>Operational</span>
        </div>

        {/* Timezone */}
        <Button type="text" className="header-button">
          <GlobalOutlined />
          <span>UTC-07:00</span>
          <Badge count={0} />
        </Button>

        {/* Referrals */}
        <Button type="text" className="header-button">
          <TeamOutlined />
          <span>Referrals</span>
        </Button>

        {/* Leaderboard */}
        <Button type="text" className="header-button">
          <TrophyOutlined />
          <span>Leaderboard</span>
        </Button>

        {/* SFW Badge */}
        <div className="sfw-badge">
          SFW
        </div>

        {/* Notifications */}
        <Button type="text" className="header-icon-button">
          <Badge count={0}>
            <BellOutlined style={{ fontSize: 18 }} />
          </Badge>
        </Button>

        {/* User Menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Button type="text" className="user-button">
            <div className="user-avatar">FD</div>
            <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Dropdown>
      </div>
    </AntHeader>
  );
}

export default Header;

