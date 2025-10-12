import { useState } from 'react';
import { Layout, Menu, Select, Badge } from 'antd';
import {
  DashboardOutlined,
  BarChartOutlined,
  MessageOutlined,
  RiseOutlined,
  ShareAltOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  DownOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const { Sider } = Layout;
const { Option } = Select;

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('onlyfans');
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/of-manager',
      icon: <img src="/infloww-assets/renderer/infloww.png" alt="" style={{ width: 16, height: 16 }} />,
      label: 'OF Manager',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: '/creator-reports',
      icon: <FileTextOutlined />,
      label: 'Creator Reports',
    },
    {
      key: '/messages-pro',
      icon: <MessageOutlined />,
      label: 'Messages Pro',
      badge: <Badge count={0} style={{ backgroundColor: '#ff4d4f' }} />,
    },
    {
      key: '/growth',
      icon: <RiseOutlined />,
      label: 'Growth',
    },
    {
      key: '/share-for-share',
      icon: <ShareAltOutlined />,
      label: 'Share for Share',
    },
    {
      key: 'divider1',
      type: 'divider',
    },
    {
      key: '/creators',
      icon: <TeamOutlined />,
      label: 'Creators',
    },
    {
      key: '/employees',
      icon: <UserOutlined />,
      label: 'Employees',
    },
  ];

  const bottomMenuItems = [
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      key: '/help',
      icon: <QuestionCircleOutlined />,
      label: 'Help center',
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={220}
      className="app-sidebar"
      style={{
        background: '#ffffff',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <div className="sidebar-header">
        <img
          src="/infloww-assets/app-logo/logo.png"
          alt="Infloww"
          className="sidebar-logo"
          style={{ display: collapsed ? 'none' : 'block' }}
        />
      </div>

      {/* Platform Selector */}
      <div style={{ padding: '16px 16px 8px' }}>
        <Select
          value={selectedPlatform}
          onChange={setSelectedPlatform}
          style={{ width: '100%' }}
          suffixIcon={<DownOutlined />}
          className="platform-selector"
        >
          <Option value="onlyfans">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/infloww-assets/renderer/infloww.png" alt="OF" style={{ width: 16, height: 16 }} />
              OnlyFans
            </span>
          </Option>
          <Option value="fansly">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/infloww-assets/renderer/fansly_logo.webp" alt="Fansly" style={{ width: 16, height: 16 }} />
              Fansly
            </span>
          </Option>
        </Select>
      </div>

      {/* Main Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => key !== 'divider1' && navigate(key)}
        className="sidebar-menu"
        items={menuItems.map(item => {
          if (item.type === 'divider') {
            return { type: 'divider', key: item.key };
          }
          return {
            key: item.key,
            icon: item.icon,
            label: (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{item.label}</span>
                {item.badge}
              </span>
            ),
          };
        })}
      />

      {/* Bottom Menu */}
      <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          className="sidebar-bottom-menu"
          items={bottomMenuItems}
        />
        <div className="sidebar-version">
          Version 5.5.5
        </div>
      </div>
    </Sider>
  );
}

export default Sidebar;

