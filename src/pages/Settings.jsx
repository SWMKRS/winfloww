import { useState } from 'react';
import { Card, Upload, Button, message, Table, Space, Tag } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';

import { useData } from '../data/DataContext';
import './Settings.css';

function Settings() {
  const { transactionData, processedData, isLoading, loadCustomData, loadSampleData } = useData();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 'default',
      name: 'Sample Data',
      timestamp: new Date('2025-10-15T22:09:53Z'),
      isDefault: true,
      isActive: !!transactionData
    }
  ]);

  const validateSchema = (jsonData) => {
    const requiredFields = ['metadata', 'transactions'];
    const requiredMetadata = ['userName', 'utcOffset', 'operationalStatus'];

    // check top-level structure
    for (const field of requiredFields) {
      if (!(field in jsonData)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // check metadata structure
    for (const field of requiredMetadata) {
      if (!(field in jsonData.metadata)) {
        throw new Error(`Missing required metadata field: ${field}`);
      }
    }

    // check transactions array
    if (!Array.isArray(jsonData.transactions)) {
      throw new Error('transactions must be an array');
    }

    // check first transaction structure
    if (jsonData.transactions.length > 0) {
      const tx = jsonData.transactions[0];
      const requiredTxFields = ['id', 'timestamp', 'channel', 'creatorAlias'];
      // check for either new structure (amount) or old structure (grossAmount, netAmount)
      const hasAmount = 'amount' in tx;
      const hasOldStructure = 'grossAmount' in tx && 'netAmount' in tx;

      if (!hasAmount && !hasOldStructure) {
        throw new Error('Transaction must have either "amount" field or "grossAmount"/"netAmount" fields');
      }

      for (const field of requiredTxFields) {
        if (!(field in tx)) {
          throw new Error(`Missing required transaction field: ${field}`);
        }
      }
    }

    return true;
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // validate schema
      validateSchema(jsonData);

      // load the data
      await loadCustomData(file);

      // add to uploaded files list
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        timestamp: new Date(),
        isDefault: false,
        isActive: true
      };

      setUploadedFiles(prev => [
        ...prev.map(f => ({ ...f, isActive: false })), // deactivate others
        newFile
      ]);

      message.success('Data loaded successfully!');
    } catch (err) {
      message.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUseFile = async (file) => {
    if (file.isDefault) {
      await loadSampleData();
    } else {
      // would need to reload from stored file
      message.info('File reload functionality not implemented yet');
    }

    setUploadedFiles(prev =>
      prev.map(f => ({ ...f, isActive: f.id === file.id }))
    );
  };

  const handleDownloadFile = (file) => {
    if (file.isDefault) {
      // download the processed data with calculated fields
      const dataToDownload = {
        metadata: processedData.metadata,
        transactions: transactionData?.transactions || []
      };

      const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.toLowerCase().replace(/\s+/g, '-') + '.json';
      link.click();

      URL.revokeObjectURL(url);
    } else {
      message.info('Download functionality not implemented yet');
    }
  };

  const handleDeleteFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    message.success('File deleted');
  };

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <span style={{ fontWeight: record.isActive ? 600 : 400 }}>
            {text}
          </span>
          {record.isActive && <Tag color="green">Active</Tag>}
          {record.isDefault && <Tag color="blue">Default</Tag>}
        </Space>
      )
    },
    {
      title: 'Uploaded',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => timestamp.toLocaleString(),
      width: 200
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleUseFile(record)}
            disabled={record.isActive}
          >
            Use
          </Button>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadFile(record)}
          >
            Download
          </Button>
          {!record.isDefault && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteFile(record.id)}
            >
              Delete
            </Button>
          )}
        </Space>
      ),
      width: 200
    }
  ];

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.json',
    beforeUpload: (file) => {
      handleFileUpload(file);
      return false;
    },
    showUploadList: false
  };

  return (
    <div className="settings-page">
      <Card title="Data Files" className="settings-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>

          {/* File Table */}
          <Table
            columns={columns}
            dataSource={uploadedFiles}
            rowKey="id"
            pagination={false}
            rowClassName={(record) => record.isDefault ? 'default-file-row' : ''}
            size="small"
          />

          {/* Upload Section */}
          <Card size="small" title="Upload New File">
            <Upload {...uploadProps} disabled={uploading || isLoading}>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                loading={uploading}
                size="large"
              >
                Upload JSON File
              </Button>
            </Upload>
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              Files are validated for proper schema before upload
            </div>
          </Card>
        </Space>
      </Card>
    </div>
  );
}

export default Settings;