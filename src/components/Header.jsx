import { Layout, Button, Dropdown } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

import notificationsIcon from '../assets/header/notifications.png';
import sidebarActiveIcon from '../assets/header/sidebar_active.png';
import sidebarInactiveIcon from '../assets/header/sidebar_inactive.png';
import referralsIcon from '../assets/header/referrals.png';
import leaderboardIcon from '../assets/header/leaderboards.png';
import utcIcon from '../assets/header/utc.png';
import './Header.css';

const { Header: AntHeader } = Layout;

function Header({ sidebarCollapsed, onToggleSidebar }) {
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
        <div className="sidebar-logo-header" onClick={onToggleSidebar}>
          <img
            src={sidebarCollapsed ? sidebarInactiveIcon : sidebarActiveIcon}
            alt="Toggle sidebar"
            className="sidebar-toggle-icon"
          />
        </div>
      </div>

      <div className="header-right">
        {/* Status */}
        <div className="status-badge operational">
          <span className="status-dot"></span>
          <span>Operational</span>
        </div>

        {/* Timezone */}
        <div className="header-timezone-badge">
          <img src={utcIcon} alt="UTC" className="header-badge-icon" />
          <span>UTC-07:00</span>
          <InfoCircleOutlined style={{ fontSize: 18 }} />
        </div>

        {/* Referrals */}
        <div className="header-timezone-badge">
          <img src={referralsIcon} alt="Referrals" className="header-badge-icon" />
          <span>Referrals</span>
        </div>

        {/* Leaderboard */}
        <div className="header-timezone-badge">
          <img src={leaderboardIcon} alt="Leaderboard" className="header-badge-icon" />
          <span>Leaderboard</span>
        </div>

        {/* SFW Toggle */}
        <div className="sfw-toggle">
          <div className="sfw-label">SFW</div>
          <div className="sfw-switch">
            <div className="sfw-switch-handle"></div>
          </div>
        </div>

        {/* Notifications */}
        <img
          src={notificationsIcon}
          alt="Notifications"
          className="notification-icon"
        />

        {/* User Menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Button type="text" className="user-button">
            <div className="user-avatar">FD</div>
          </Button>
        </Dropdown>
      </div>
    </AntHeader>
  );
}

export default Header;


