import { useState, useEffect } from 'react';
import { Card, Upload, Button, message, Table, Space, Tag } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';

import { useData } from '../data/DataContext';
import './Settings.css';

function Settings() {
  const { transactionData, processedData, isLoading, loadCustomData, switchDataFile, currentDataFile, listSavedFiles, getFileTimestamp, deleteFile } = useData();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 'default',
      name: 'default.json',
      timestamp: new Date('2025-10-15T22:09:53Z'),
      isDefault: true,
      isActive: false
    }
  ]);

  // load saved files on mount and update active state
  useEffect(() => {
    const loadSavedFiles = async () => {
      try {
        const savedFiles = await listSavedFiles();
        const fileList = await Promise.all(savedFiles.map(async filename => ({
          id: filename === 'default.json' ? 'default' : filename,
          name: filename,
          timestamp: filename === 'default.json'
            ? new Date('2025-10-15T22:09:53Z')
            : await getFileTimestamp(filename),
          isDefault: filename === 'default.json',
          isActive: filename === currentDataFile
        })));
        setUploadedFiles(fileList);
      } catch (error) {
        console.error('Failed to load saved files:', error);
      }
    };

    loadSavedFiles();
  }, [listSavedFiles, currentDataFile]);

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
        isActive: false // will be set by useEffect
      };

      setUploadedFiles(prev => [...prev, newFile]);

      message.success('Data loaded successfully!');
    } catch (err) {
      message.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUseFile = async (file) => {
    if (file.isDefault) {
      await switchDataFile('default.json');
    } else {
      // switch to the uploaded file
      await switchDataFile(file.name);
    }
    // active state will be updated automatically by useEffect
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

  const handleDeleteFile = async (fileId) => {
    try {
      // find the file to get its name
      const file = uploadedFiles.find(f => f.id === fileId);
      if (!file) {
        message.error('File not found');
        return;
      }

      // delete from storage
      const result = await deleteFile(file.name);
      if (result.success) {
        // remove from local state
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));

        // if this was the active file, switch to default
        if (file.isActive) {
          await switchDataFile('default.json');
        }

        message.success('File deleted successfully');
      } else {
        message.error(`Failed to delete file: ${result.error}`);
      }
    } catch (error) {
      message.error(`Delete failed: ${error.message}`);
    }
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
      width: 200,
      sorter: (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      defaultSortOrder: 'descend'
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