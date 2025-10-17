import { useState, useEffect } from 'react';
import { Card, Upload, Button, message, Table, Space, Tag, Modal } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined, CheckOutlined, ClearOutlined } from '@ant-design/icons';

import { useData } from '../data/DataContext';
import './Settings.css';

function Settings() {
  const { transactionData, processedData, isLoading, loadCustomData, switchDataFile, currentDataFile, listSavedFiles, getFileTimestamp, deleteFile, downloadFile, clearAllData } = useData();
  const [uploading, setUploading] = useState(false);
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // load saved files on mount and update active state
  useEffect(() => {
    const loadSavedFiles = async () => {
      try {
        const savedFiles = await listSavedFiles();

        // filter out duplicate default.json entries and ensure we only have one
        const uniqueFiles = savedFiles.filter((filename, index, arr) => {
          if (filename === 'default.json') {
            return arr.indexOf(filename) === index; // only keep the first occurrence
          }
          return true;
        });

        const fileList = await Promise.all(uniqueFiles.map(async (filename, index) => ({
          id: filename === 'default.json' ? 'default' : `${filename}-${index}`,
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
      // prevent uploading default.json
      if (file.name.toLowerCase() === 'default.json') {
        message.error('Cannot upload a file named "default.json". Please rename your file.');
        return;
      }

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

  const handleDownloadFile = async (file) => {
    try {
      let dataToDownload;
      let filename;

      if (file.isDefault) {
        // download the processed data with calculated fields
        dataToDownload = {
          metadata: processedData.metadata,
          transactions: transactionData?.transactions || []
        };
        filename = 'default.json';
      } else {
        // for uploaded files, load the data from storage
        const { storage } = await import('../data/storage');
        dataToDownload = await storage.loadData(file.name);
        if (!dataToDownload) {
          message.error('Failed to load file data');
          return;
        }
        filename = file.name;
      }

      const result = await downloadFile(filename, dataToDownload);

      if (result.success) {
        message.success('File downloaded successfully');
      } else {
        message.error(`Download failed: ${result.error}`);
      }
    } catch (error) {
      message.error(`Download failed: ${error.message}`);
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

  const handleClearDatabase = async () => {
    try {
      await clearAllData();
      setClearModalVisible(false);
      // reload the file list with duplicate filtering
      const savedFiles = await listSavedFiles();

      const uniqueFiles = savedFiles.filter((filename, index, arr) => {
        if (filename === 'default.json') {
          return arr.indexOf(filename) === index; // only keep the first occurrence
        }
        return true;
      });

      const fileList = await Promise.all(uniqueFiles.map(async (filename, index) => ({
        id: filename === 'default.json' ? 'default' : `${filename}-${index}`,
        name: filename,
        timestamp: filename === 'default.json'
          ? new Date('2025-10-15T22:09:53Z')
          : await getFileTimestamp(filename),
        isDefault: filename === 'default.json',
        isActive: filename === currentDataFile
      })));
      setUploadedFiles(fileList);
    } catch (error) {
      message.error(`Clear database failed: ${error.message}`);
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

          {/* Clear Database Section */}
          <Card size="small" title="Database Management">
            <Button
              danger
              icon={<ClearOutlined />}
              onClick={() => setClearModalVisible(true)}
              disabled={isLoading}
            >
              Clear All Uploaded Files
            </Button>
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              This will delete all uploaded files and switch back to default data
            </div>
          </Card>
        </Space>
      </Card>

      {/* Clear Database Confirmation Modal */}
      <Modal
        title="Clear All Uploaded Files"
        open={clearModalVisible}
        onOk={handleClearDatabase}
        onCancel={() => setClearModalVisible(false)}
        okText="Clear Database"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to clear all uploaded files?</p>
        <p>This action will:</p>
        <ul>
          <li>Delete all uploaded JSON files</li>
          <li>Switch back to the default data</li>
          <li>Cannot be undone</li>
        </ul>
      </Modal>
    </div>
  );
}

export default Settings;