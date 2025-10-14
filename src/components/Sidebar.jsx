import { useState } from 'react';
import { Layout, Select, Badge } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

import { notificationData } from '../data/mockData';
import chevronIcon from '../assets/icons/chevron.png';
import ofLogo from '../assets/of_logo.webp';
import fanslyLogo from '../assets/fansly_logo.svg';

import dashboardActive from '../assets/sidebar/dashboard_active.png';
import dashboardInactive from '../assets/sidebar/dashboard_inactive.png';
import dashboardHover from '../assets/sidebar/dashboard_hover.png';
import shareForShareActive from '../assets/sidebar/share_for_share_active.png';
import shareForShareInactive from '../assets/sidebar/share_for_share_inactive.png';
import shareForShareHover from '../assets/sidebar/share_for_share_hover.png';
import discoverCreatorsInactive from '../assets/sidebar/discover_creators_inactive.png';
import discoverCreatorsHover from '../assets/sidebar/discover_creators_hover.png';
import requestsInactive from '../assets/sidebar/requests_inactive.png';
import requestsHover from '../assets/sidebar/requests_hover.png';
import s4sScheduleInactive from '../assets/sidebar/s4s_schedule_inactive.png';
import s4sScheduleHover from '../assets/sidebar/s4s_schedule_hover.png';
import s4sSettingsInactive from '../assets/sidebar/s4s_settings_inactive.png';
import s4sSettingsHover from '../assets/sidebar/s4s_settings_hover.png';
import ofActive from '../assets/sidebar/of_active.png';
import ofInactive from '../assets/sidebar/of_inactive.png';
import ofHover from '../assets/sidebar/of_hover.png';
import newPostInactive from '../assets/sidebar/new_post_inactive.png';
import newPostHover from '../assets/sidebar/new_post_hover.png';
import notificationsInactive from '../assets/sidebar/notifications_inactive.png';
import notificationsHover from '../assets/sidebar/notifications_hover.png';
import messagesBasicInactive from '../assets/sidebar/messaging_basic_inactive.png';
import messagesBasicHover from '../assets/sidebar/messaging_basic_hover.png';
import vaultInactive from '../assets/sidebar/vault_inactive.png';
import vaultHover from '../assets/sidebar/vault_hover.png';
import queueInactive from '../assets/sidebar/queue_inactive.png';
import queueHover from '../assets/sidebar/queue_hover.png';
import collectionsInactive from '../assets/sidebar/collections_inactive.png';
import collectionsHover from '../assets/sidebar/collections_hover.png';
import statementsInactive from '../assets/sidebar/statements_inactive.png';
import statementsHover from '../assets/sidebar/statements_hover.png';
import statisticsInactive from '../assets/sidebar/statistics_inactive.png';
import statisticsHover from '../assets/sidebar/statistics_hover.png';
import bankInactive from '../assets/sidebar/bank_inactive.png';
import bankHover from '../assets/sidebar/bank_hover.png';
import myProfileInactive from '../assets/sidebar/my_profile_inactive.png';
import myProfileHover from '../assets/sidebar/my_profile_hover.png';
import ofSettingsInactive from '../assets/sidebar/of_settings_inactive.png';
import ofSettingsHover from '../assets/sidebar/of_settings_hover.png';
import analyticsActive from '../assets/sidebar/analytics_active.png';
import analyticsInactive from '../assets/sidebar/analytics_inactive.png';
import analyticsHover from '../assets/sidebar/analytics_hover.png';
import creatorReportsActive from '../assets/sidebar/creator_reports_active.png';
import creatorReportsInactive from '../assets/sidebar/creator_reports_inactive.png';
import creatorReportsHover from '../assets/sidebar/creator_reports_hover.png';
import employeeReportsInactive from '../assets/sidebar/employee_reports_inactive.png';
import employeeReportsHover from '../assets/sidebar/employee_reports_hover.png';
import fanReportsInactive from '../assets/sidebar/fan_reports_inactive.png';
import fanReportsHover from '../assets/sidebar/fan_reports_hover.png';
import messageDashboardInactive from '../assets/sidebar/message_dashboard_inactive.png';
import messageDashboardHover from '../assets/sidebar/message_dashboard_hover.png';
import messagingActive from '../assets/sidebar/messaging_active.png';
import messagingInactive from '../assets/sidebar/messaging_inactive.png';
import messagingHover from '../assets/sidebar/messaging_hover.png';
import messagesProLeavePage from '../assets/sidebar/messages_pro_leave_page.png';
import growthActive from '../assets/sidebar/growth_active.png';
import growthInactive from '../assets/sidebar/growth_inactive.png';
import growthHover from '../assets/sidebar/growth_hover.png';
import smartMessagesInactive from '../assets/sidebar/smart_messages_inactive.png';
import smartMessagesHover from '../assets/sidebar/smart_messages_hover.png';
import smartListsInactive from '../assets/sidebar/smart_lists_inactive.png';
import smartListsHover from '../assets/sidebar/smart_lists_hover.png';
import autoFollowInactive from '../assets/sidebar/auto_follow_inactive.png';
import autoFollowHover from '../assets/sidebar/auto_follow_hover.png';
import vaultProInactive from '../assets/sidebar/vault_pro_inactive.png';
import vaultProHover from '../assets/sidebar/vault_pro_hover.png';
import scriptsInactive from '../assets/sidebar/scripts_inactive.png';
import scriptsHover from '../assets/sidebar/scripts_hover.png';
import profilePromotionInactive from '../assets/sidebar/profile_promotion_inactive.png';
import profilePromotionHover from '../assets/sidebar/profile_promotion_hover.png';
import freeTrialLinksInactive from '../assets/sidebar/free_trial_links_inactive.png';
import freeTrialLinksHover from '../assets/sidebar/free_trial_links_hover.png';
import trackingLinksInactive from '../assets/sidebar/tracking_links_inactive.png';
import trackingLinksHover from '../assets/sidebar/tracking_links_hover.png';
import sensitiveWordsInactive from '../assets/sidebar/sensitive_words_inactive.png';
import sensitiveWordsHover from '../assets/sidebar/sensitive_words_hover.png';
import aiCopilotInactive from '../assets/sidebar/ai_copilot_inactive.png';
import aiCopilotHover from '../assets/sidebar/ai_copilot_hover.png';
import creatorsActive from '../assets/sidebar/creators_active.png';
import creatorsInactive from '../assets/sidebar/creators_inactive.png';
import creatorsHover from '../assets/sidebar/creators_hover.png';
import manageCreatorsInactive from '../assets/sidebar/manage_creators_inactive.png';
import manageCreatorsHover from '../assets/sidebar/manage_creators_hover.png';
import customProxyInactive from '../assets/sidebar/custom_proxy_inactive.png';
import customProxyHover from '../assets/sidebar/custom_proxy_hover.png';
import employeesActive from '../assets/sidebar/employees_active.png';
import employeesInactive from '../assets/sidebar/employees_inactive.png';
import employeesHover from '../assets/sidebar/employees_hover.png';
import manageEmployeesInactive from '../assets/sidebar/manage_employees_inactive.png';
import manageEmployeesHover from '../assets/sidebar/manage_employees_hover.png';
import shiftScheduleInactive from '../assets/sidebar/shift_schedule_inactive.png';
import shiftScheduleHover from '../assets/sidebar/shift_schedule_hover.png';
import settingsActive from '../assets/sidebar/settings_active.png';
import settingsInactive from '../assets/sidebar/settings_inactive.png';
import settingsHover from '../assets/sidebar/settings_hover.png';
import helpActive from '../assets/sidebar/help_active.png';
import helpInactive from '../assets/sidebar/help_inactive.png';
import helpHover from '../assets/sidebar/help_hover.png';
import CustomMenu from './CustomMenu';
import './Sidebar.css';

const { Sider } = Layout;
const { Option } = Select;

function Sidebar({ collapsed }) {
  const [selectedPlatform, setSelectedPlatform] = useState('onlyfans');
  const [openKeys, setOpenKeys] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      iconActive: dashboardActive,
      iconInactive: dashboardInactive,
      iconHover: dashboardHover,
      label: 'Dashboard',
    },
    {
      key: '/of-manager',
      iconActive: ofActive,
      iconInactive: ofInactive,
      iconHover: ofHover,
      label: 'OF Manager',
      children: [
        {
          key: '/of-manager/new-post',
          label: 'New post',
          iconActive: null,
          iconInactive: newPostInactive,
          iconHover: newPostHover,
        },
        {
          key: '/of-manager/notifications',
          label: 'Notifications',
          iconActive: null,
          iconInactive: notificationsInactive,
          iconHover: notificationsHover,
        },
        {
          key: '/of-manager/messages-basic',
          label: 'Messages Basic',
          iconActive: null,
          iconInactive: messagesBasicInactive,
          iconHover: messagesBasicHover,
        },
        {
          key: '/of-manager/vault',
          label: 'Vault',
          iconActive: null,
          iconInactive: vaultInactive,
          iconHover: vaultHover,
        },
        {
          key: '/of-manager/queue',
          label: 'Queue',
          iconActive: null,
          iconInactive: queueInactive,
          iconHover: queueHover,
        },
        {
          key: '/of-manager/collections',
          label: 'Collections',
          iconActive: null,
          iconInactive: collectionsInactive,
          iconHover: collectionsHover,
        },
        {
          key: '/of-manager/statements',
          label: 'Statements',
          iconActive: null,
          iconInactive: statementsInactive,
          iconHover: statementsHover,
        },
        {
          key: '/of-manager/statistics',
          label: 'Statistics',
          iconActive: null,
          iconInactive: statisticsInactive,
          iconHover: statisticsHover,
        },
        {
          key: '/of-manager/bank',
          label: 'Bank',
          iconActive: null,
          iconInactive: bankInactive,
          iconHover: bankHover,
        },
        {
          key: '/of-manager/my-profile',
          label: 'My profile',
          iconActive: null,
          iconInactive: myProfileInactive,
          iconHover: myProfileHover,
        },
        {
          key: '/of-manager/of-settings',
          label: 'OF settings',
          iconActive: null,
          iconInactive: ofSettingsInactive,
          iconHover: ofSettingsHover,
        },
      ],
    },
    {
      key: '/analytics',
      iconActive: analyticsActive,
      iconInactive: analyticsInactive,
      iconHover: analyticsHover,
      label: 'Analytics',
      children: [
        {
          key: '/analytics/creator-reports',
          label: 'Creator reports',
          iconActive: creatorReportsActive,
          iconInactive: creatorReportsInactive,
          iconHover: creatorReportsHover,
        },
        {
          key: '/analytics/employee-reports',
          label: 'Employee reports',
          iconActive: null,
          iconInactive: employeeReportsInactive,
          iconHover: employeeReportsHover,
        },
        {
          key: '/analytics/fan-reports',
          label: 'Fan reports',
          iconActive: null,
          iconInactive: fanReportsInactive,
          iconHover: fanReportsHover,
        },
        {
          key: '/analytics/message-dashboard',
          label: 'Message dashboard',
          iconActive: null,
          iconInactive: messageDashboardInactive,
          iconHover: messageDashboardHover,
        },
      ],
    },
    {
      key: '/messaging',
      iconActive: messagingActive,
      iconInactive: messagingInactive,
      iconHover: messagingHover,
      label: 'Messages Pro',
      badge: (
        <Badge
          count={notificationData.totalMessages}
          styles={{
            indicator: {
              backgroundColor: '#ff69b4',
              fontWeight: '600',
              padding: '0 6px',
              height: '18px',
              lineHeight: '18px',
              fontSize: '10px',
              minWidth: '18px',
              borderRadius: '50%',
              border: 'none',
              boxShadow: 'none'
            }
          }}
        />
      ),
      leavePageIcon: messagesProLeavePage,
    },
    {
      key: '/growth',
      iconActive: growthActive,
      iconInactive: growthInactive,
      iconHover: growthHover,
      label: 'Growth',
      children: [
        {
          key: '/growth/smart-messages',
          label: 'Smart Messages',
          iconActive: null,
          iconInactive: smartMessagesInactive,
          iconHover: smartMessagesHover,
        },
        {
          key: '/growth/smart-lists',
          label: 'Smart lists',
          iconActive: null,
          iconInactive: smartListsInactive,
          iconHover: smartListsHover,
        },
        {
          key: '/growth/auto-follow',
          label: 'Auto-follow',
          iconActive: null,
          iconInactive: autoFollowInactive,
          iconHover: autoFollowHover,
        },
        {
          key: '/growth/vault-pro',
          label: 'Vault Pro',
          iconActive: null,
          iconInactive: vaultProInactive,
          iconHover: vaultProHover,
        },
        {
          key: '/growth/scripts',
          label: 'Scripts',
          iconActive: null,
          iconInactive: scriptsInactive,
          iconHover: scriptsHover,
        },
        {
          key: '/growth/profile-promotion',
          label: 'Profile promotion',
          iconActive: null,
          iconInactive: profilePromotionInactive,
          iconHover: profilePromotionHover,
        },
        {
          key: '/growth/free-trial-links',
          label: 'Free trial links',
          iconActive: null,
          iconInactive: freeTrialLinksInactive,
          iconHover: freeTrialLinksHover,
        },
        {
          key: '/growth/tracking-links',
          label: 'Tracking links',
          iconActive: null,
          iconInactive: trackingLinksInactive,
          iconHover: trackingLinksHover,
        },
        {
          key: '/growth/sensitive-words',
          label: 'Sensitive words',
          iconActive: null,
          iconInactive: sensitiveWordsInactive,
          iconHover: sensitiveWordsHover,
        },
        {
          key: '/growth/ai-copilot',
          label: 'AI Copilot',
          iconActive: null,
          iconInactive: aiCopilotInactive,
          iconHover: aiCopilotHover,
        },
      ],
    },
    {
      key: '/share-for-share',
      iconActive: shareForShareActive,
      iconInactive: shareForShareInactive,
      iconHover: shareForShareHover,
      label: 'Share for Share',
      children: [
        {
          key: '/share-for-share/discover-creators',
          label: 'Discover creators',
          iconActive: null,
          iconInactive: discoverCreatorsInactive,
          iconHover: discoverCreatorsHover,
        },
        {
          key: '/share-for-share/requests',
          label: 'Requests',
          iconActive: null,
          iconInactive: requestsInactive,
          iconHover: requestsHover,
        },
        {
          key: '/share-for-share/s4s-schedule',
          label: 'S4S schedule',
          iconActive: null,
          iconInactive: s4sScheduleInactive,
          iconHover: s4sScheduleHover,
        },
        {
          key: '/share-for-share/s4s-settings',
          label: 'S4S settings',
          iconActive: null,
          iconInactive: s4sSettingsInactive,
          iconHover: s4sSettingsHover,
        },
      ],
    },
  ];

  const middleMenuItems = [
    {
      key: '/creators',
      iconActive: creatorsActive,
      iconInactive: creatorsInactive,
      iconHover: creatorsHover,
      label: 'Creators',
      children: [
        {
          key: '/creators/manage-creators',
          label: 'Manage creators',
          iconActive: null,
          iconInactive: manageCreatorsInactive,
          iconHover: manageCreatorsHover,
        },
        {
          key: '/creators/custom-proxy',
          label: 'Custom proxy',
          iconActive: null,
          iconInactive: customProxyInactive,
          iconHover: customProxyHover,
        },
      ],
    },
    {
      key: '/employees',
      iconActive: employeesActive,
      iconInactive: employeesInactive,
      iconHover: employeesHover,
      label: 'Employees',
      children: [
        {
          key: '/employees/manage-employees',
          label: 'Manage employees',
          iconActive: null,
          iconInactive: manageEmployeesInactive,
          iconHover: manageEmployeesHover,
        },
        {
          key: '/employees/shift-schedule',
          label: 'Shift schedule',
          iconActive: null,
          iconInactive: shiftScheduleInactive,
          iconHover: shiftScheduleHover,
        },
      ],
    },
  ];

  const bottomMenuItems = [
    {
      key: '/settings',
      iconActive: settingsActive,
      iconInactive: settingsInactive,
      iconHover: settingsHover,
      label: 'Settings',
    },
    {
      key: '/help-support',
      iconActive: helpActive,
      iconInactive: helpInactive,
      iconHover: helpHover,
      label: 'Help center',
    },
  ];

  return (
    <Sider
      collapsed={collapsed}
      width={250}
      collapsedWidth={60}
      className="app-sidebar"
      style={{
        background: '#ffffff',
      }}
    >
      {/* platform selector */}
      <div className={`platform-selector-container ${collapsed ? 'collapsed' : ''}`}>
        <Select
          value={selectedPlatform}
          onChange={setSelectedPlatform}
          style={{ width: '100%' }}
          suffixIcon={null}
          className="platform-selector"
          popupMatchSelectWidth={false}
          classNames={{ popup: collapsed ? 'platform-selector-dropdown-collapsed' : '' }}
          styles={{ popup: collapsed ? { minWidth: '180px' } : {} }}
          placement={collapsed ? 'rightTop' : 'bottomLeft'}
          dropdownAlign={collapsed ? { offset: [12, 0] } : undefined}
        >
          <Option value="onlyfans">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={ofLogo} alt="OF" style={{ width: 24, height: 24 }} />
                <span className={collapsed ? 'platform-label' : ''}>OnlyFans</span>
              </span>
              {!collapsed && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {notificationData.totalMessages > 0 && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ff69b4',
                      flexShrink: 0
                    }} />
                  )}
                  <img src={chevronIcon} alt='' style={{ width: 12, height: 12, transform: 'rotate(90deg)', opacity: 0.38, marginRight: '4px' }} />
                </span>
              )}
            </div>
          </Option>
          <Option value="fansly">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={fanslyLogo} alt="Fansly" style={{ width: 16, height: 16 }} />
                <span className={collapsed ? 'platform-label' : ''}>Fansly</span>
              </span>
              {!collapsed && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {notificationData.totalMessages > 0 && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ff69b4',
                      flexShrink: 0
                    }} />
                  )}
                  <img src={chevronIcon} alt='' style={{ width: 12, height: 12, transform: 'rotate(90deg)', opacity: 0.38, marginRight: '4px' }} />
                </span>
              )}
            </div>
          </Option>
        </Select>
      </div>

      {/* main menu */}
      <div className="sidebar-menu-container">
        <CustomMenu
          items={menuItems.map(item => {
            return {
              key: item.key,
              icon: item.icon,
              iconData: item.iconActive && item.iconInactive && item.iconHover ? {
                iconActive: item.iconActive,
                iconInactive: item.iconInactive,
                iconHover: item.iconHover,
              } : null,
              label: item.label,
              badge: item.badge,
              leavePageIcon: item.leavePageIcon,
              children: item.children?.map(child => ({
                ...child,
                iconData: child.iconInactive ? {
                  iconActive: child.iconActive,
                  iconInactive: child.iconInactive,
                  iconHover: child.iconHover,
                } : null,
              })),
            };
          })}
          selectedKey={location.pathname}
          onClick={(key) => navigate(key)}
          collapsed={collapsed}
        />

        {/* divider */}
        <div className="menu-divider" style={{ margin: '8px 16px' }}></div>

        {/* middle menu (creators/employees) */}
        <CustomMenu
          items={middleMenuItems.map(item => {
            return {
              key: item.key,
              icon: item.icon,
              iconData: item.iconActive && item.iconInactive && item.iconHover ? {
                iconActive: item.iconActive,
                iconInactive: item.iconInactive,
                iconHover: item.iconHover,
              } : null,
              label: item.label,
              badge: item.badge,
              children: item.children?.map(child => ({
                ...child,
                iconData: child.iconInactive ? {
                  iconActive: child.iconActive,
                  iconInactive: child.iconInactive,
                  iconHover: child.iconHover,
                } : null,
              })),
            };
          })}
          selectedKey={location.pathname}
          onClick={(key) => navigate(key)}
          collapsed={collapsed}
        />
      </div>

      {/* bottom menu */}
      <div className="sidebar-bottom-container">
        <div className="sidebar-bottom-menu-border"></div>
        <CustomMenu
          items={bottomMenuItems.map(item => {
            return {
              key: item.key,
              icon: item.icon,
              iconData: item.iconActive && item.iconInactive && item.iconHover ? {
                iconActive: item.iconActive,
                iconInactive: item.iconInactive,
                iconHover: item.iconHover,
              } : null,
              label: item.label,
            };
          })}
          selectedKey={location.pathname}
          onClick={(key) => navigate(key)}
          collapsed={collapsed}
        />
        {!collapsed && (
          <div className="sidebar-version">
            Version 5.6.0
          </div>
        )}
      </div>
    </Sider>
  );
}

export default Sidebar;
