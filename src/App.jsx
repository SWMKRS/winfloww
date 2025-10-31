import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';

import { DataProvider } from './data/DataContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoadingPage from './components/LoadingPage';
import Dashboard from './pages/Dashboard';
import CreatorReports from './pages/CreatorReports';
import Settings from './pages/Settings';
import HelpSupport from './pages/HelpSupport';
import ComingSoon from './pages/ComingSoon';
import chatbotIcon from './assets/fab/chatbot.png';
import './styles/App.css';

const { Content } = Layout;

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // force navigation to dashboard after loading
    setTimeout(() => {
      console.log('Forcing navigation to dashboard...');
      navigate('/dashboard', { replace: true });
    }, 100);
  };

  // ensure app lands on dashboard after loading
  useEffect(() => {
    console.log('App useEffect - isLoading:', isLoading, 'pathname:', location.pathname);
    if (!isLoading && location.pathname === '/') {
      console.log('Redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, location.pathname, navigate]);

  if (isLoading) {
    return <LoadingPage onComplete={handleLoadingComplete} />;
  }

  return (
    <DataProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <Layout>
          <Sidebar collapsed={sidebarCollapsed} />
          <Content style={{
            margin: 0,
            height: 'calc(100vh - 64px)',
            overflow: 'auto',
            background: '#f5f5f5'
          }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* OF Manager */}
              <Route path="/of-manager/new-post" element={<ComingSoon />} />
              <Route path="/of-manager/notifications" element={<ComingSoon />} />
              <Route path="/of-manager/messages-basic" element={<ComingSoon />} />
              <Route path="/of-manager/vault" element={<ComingSoon />} />
              <Route path="/of-manager/queue" element={<ComingSoon />} />
              <Route path="/of-manager/promo-campaign" element={<ComingSoon />} />
              <Route path="/of-manager/live-streams" element={<ComingSoon />} />
              <Route path="/of-manager/posts" element={<ComingSoon />} />
              <Route path="/of-manager/stories" element={<ComingSoon />} />

              {/* Analytics */}
              <Route path="/analytics/creator-reports" element={<CreatorReports />} />
              <Route path="/analytics/overall-revenue" element={<ComingSoon />} />
              <Route path="/analytics/chatter-stats" element={<ComingSoon />} />
              <Route path="/analytics/live-stats" element={<ComingSoon />} />

              {/* Messaging */}
              <Route path="/messaging/creator-messages" element={<ComingSoon />} />
              <Route path="/messaging/fans-list" element={<ComingSoon />} />
              <Route path="/messaging/fans-notes" element={<ComingSoon />} />
              <Route path="/messaging/mass-messages" element={<ComingSoon />} />
              <Route path="/messaging/lists" element={<ComingSoon />} />
              <Route path="/messaging/auto-welcome" element={<ComingSoon />} />

              {/* Employees */}
              <Route path="/employees/chatters" element={<ComingSoon />} />
              <Route path="/employees/managers" element={<ComingSoon />} />
              <Route path="/employees/shift-manager" element={<ComingSoon />} />
              <Route path="/employees/auto-chatter" element={<ComingSoon />} />

              {/* Growth */}
              <Route path="/growth/keyword-tracking" element={<ComingSoon />} />
              <Route path="/growth/share-for-share" element={<ComingSoon />} />

              {/* Creators */}
              <Route path="/creators" element={<ComingSoon />} />

              {/* Settings */}
              <Route path="/settings" element={<Settings />} />

              {/* Help & Support */}
              <Route path="/help-support" element={<HelpSupport />} />
            </Routes>
          </Content>
        </Layout>

        {/* Floating Action Button */}
        <div className="fab">
          <img src={chatbotIcon} alt="Chatbot" className="fab-icon" />
        </div>
      </Layout>
    </DataProvider>
  );
}

export default App;
