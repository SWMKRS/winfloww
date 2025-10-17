import { createContext, useContext, useState, useEffect } from 'react';
import { loadTransactionData, getEmptyData, calculateNotificationData } from './dataProcessor';
import sampleData from './dummy_upload.json';

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

  // load sample data on mount
  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // use imported sample data
      const processed = await loadTransactionData(sampleData);
      const notificationData = calculateNotificationData(sampleData);
      setTransactionData(sampleData);
      setProcessedData(processed);
      setNotificationData(notificationData);
    } catch (err) {
      console.error('Error loading sample data:', err);
      setError('Failed to load sample data');
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
  };

  const updateNotificationData = (newNotificationData) => {
    setNotificationData(newNotificationData);
  };

  const value = {
    transactionData,
    processedData,
    isLoading,
    error,
    notificationData,
    loadCustomData,
    loadSampleData,
    clearData,
    updateNotificationData
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
