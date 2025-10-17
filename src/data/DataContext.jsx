import { createContext, useContext, useState, useEffect } from 'react';
import { loadTransactionData, getEmptyData, calculateNotificationData } from './dataProcessor';
import { storage } from './storage';

const DataContext = createContext();

/**
 * Provides transaction data context throughout the app
 */
export const DataProvider = ({ children }) => {
  const [transactionData, setTransactionData] = useState(null);
  const [processedData, setProcessedData] = useState(getEmptyData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notificationData, setNotificationData] = useState({ totalMessages: 0 });
  const [currentDataFile, setCurrentDataFile] = useState('default.json');

  // load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentFile = await storage.getCurrentDataFile();
      setCurrentDataFile(currentFile);

      const data = await storage.loadData(currentFile);

      if (data) {
        const processed = await loadTransactionData(data);
        const notificationData = calculateNotificationData(data);
        setTransactionData(data);
        setProcessedData(processed);
        setNotificationData(notificationData);
      } else {
        setProcessedData(getEmptyData());
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data');
      setProcessedData(getEmptyData());
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomData = async (jsonFile) => {
    try {
      setIsLoading(true);
      setError(null);

      const text = await jsonFile.text();
      const jsonData = JSON.parse(text);

      const processed = await loadTransactionData(jsonData);
      const notificationData = calculateNotificationData(jsonData);
      setTransactionData(jsonData);
      setProcessedData(processed);
      setNotificationData(notificationData);

      // save to storage
      const filename = jsonFile.name || `upload_${Date.now()}.json`;
      await storage.saveData(jsonData, filename);
      setCurrentDataFile(filename);
    } catch (err) {
      console.error('Error loading custom data:', err);
      setError('Failed to load custom data. Please check the JSON format.');
      setProcessedData(getEmptyData());
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setTransactionData(null);
    setProcessedData(getEmptyData());
    setNotificationData({ totalMessages: 0 });
    setError(null);
    setCurrentDataFile('default.json');
  };

  const updateNotificationData = (newNotificationData) => {
    setNotificationData(newNotificationData);
  };

  const switchDataFile = async (filename) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('=== switchDataFile called ===');
      console.log('Switching to file:', filename);

      const data = await storage.loadData(filename);
      console.log('Loaded data from storage:', {
        hasData: !!data,
        hasMetadata: !!data?.metadata,
        hasTransactions: !!data?.transactions,
        transactionCount: data?.transactions?.length || 0
      });

      if (data) {
        const processed = await loadTransactionData(data);
        const notificationData = calculateNotificationData(data);
        setTransactionData(data);
        setProcessedData(processed);
        setNotificationData(notificationData);
        setCurrentDataFile(filename);
        await storage.setCurrentDataFile(filename);
        console.log('Successfully switched to file:', filename);
      } else {
        setError('Failed to load selected data file');
        console.error('No data returned for file:', filename);
      }
    } catch (err) {
      console.error('Error switching data file:', err);
      setError('Failed to load selected data file');
    } finally {
      setIsLoading(false);
    }
  };

  const openFileDialog = async () => {
    try {
      const result = await storage.openFileDialog();
      if (result.success) {
        // create a mock file object for loadCustomData
        const mockFile = {
          name: `upload_${Date.now()}.json`,
          text: () => Promise.resolve(JSON.stringify(result.data))
        };
        await loadCustomData(mockFile);
      }
      return result;
    } catch (err) {
      console.error('Error opening file dialog:', err);
      return { success: false, error: err.message };
    }
  };

  const listSavedFiles = async () => {
    try {
      return await storage.listFiles();
    } catch (err) {
      console.error('Error listing files:', err);
      return ['default.json'];
    }
  };

  const getFileTimestamp = async (filename) => {
    try {
      return await storage.getFileTimestamp(filename);
    } catch (err) {
      console.error('Error getting file timestamp:', err);
      return new Date();
    }
  };

  const deleteFile = async (filename) => {
    try {
      return await storage.deleteFile(filename);
    } catch (err) {
      console.error('Error deleting file:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    transactionData,
    processedData,
    isLoading,
    error,
    notificationData,
    currentDataFile,
    loadCustomData,
    clearData,
    updateNotificationData,
    switchDataFile,
    openFileDialog,
    listSavedFiles,
    getFileTimestamp,
    deleteFile
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

/**
 * Hook to use the data context
 */
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
