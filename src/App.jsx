import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CreatorReports from './pages/CreatorReports';
import './styles/App.css';

const { Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header />
        <Content style={{
          margin: 0,
          height: '100vh',
          overflow: 'auto',
          background: '#f5f5f5'
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/creator-reports" element={<CreatorReports />} />
            {/* Add more routes as needed */}
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;

