import { Layout, Button, Dropdown } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

import { useData } from '../data/DataContext';
import notificationsIcon from '../assets/header/notification_bell_header.png';
import sidebarActiveIcon from '../assets/header/sidebar_active.png';
import sidebarInactiveIcon from '../assets/header/sidebar_inactive.png';
import referralsIcon from '../assets/header/referrals.png';
import leaderboardIcon from '../assets/header/leaderboards.png';
import utcIcon from '../assets/header/utc.png';
import './Header.css';

const { Header: AntHeader } = Layout;

function Header({ sidebarCollapsed, onToggleSidebar }) {
  const { processedData, notificationData } = useData();
  const operationalStatus = processedData.metadata?.operationalStatus ?? true;
  const utcOffset = processedData.metadata?.utcOffset ?? '-07:00';
  const userName = processedData.metadata?.userName ?? 'User';

  // generate initials from userName
  const getInitials = (name) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const userInitials = getInitials(userName);

  console.log(userName, userInitials);

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
        <div className={`status-badge ${operationalStatus ? 'operational' : 'partial-outage'}`}>
          <span className="status-dot"></span>
          <span>{operationalStatus ? 'Operational' : 'Partial outage'}</span>
        </div>

        {/* Timezone */}
        <div className="header-timezone-badge">
          <img src={utcIcon} alt="UTC" className="header-badge-icon" />
          <span>UTC{utcOffset}</span>
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
        <div className="notification-container">
          <img
            src={notificationsIcon}
            alt="Notifications"
            className="notification-icon"
          />
          {notificationData.totalNotifications > 0 && (
            <div className="notification-count">
              {notificationData.totalNotifications > 99 ? '99+' : notificationData.totalNotifications}
            </div>
          )}
        </div>

        {/* User Menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Button type="text" className="user-button">
            <div className="user-avatar">{userInitials}</div>
          </Button>
        </Dropdown>
      </div>
    </AntHeader>
  );
}

export default Header;


