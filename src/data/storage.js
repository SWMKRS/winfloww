/**
 * Unified storage system that works in both browser and Electron
 */
import defaultData from './default.json';

class UnifiedStorage {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electron;
  }

  /**
   * Get the current data file name
   */
  async getCurrentDataFile() {
    if (this.isElectron) {
      return await window.electron.getCurrentDataFile();
    } else {
      return localStorage.getItem('currentDataFile') || 'default.json';
    }
  }

  /**
   * Set the current data file name
   */
  async setCurrentDataFile(filename) {
    if (this.isElectron) {
      return await window.electron.setCurrentDataFile(filename);
    } else {
      localStorage.setItem('currentDataFile', filename);
    }
  }

  /**
   * Load data from a file
   */
  async loadData(filename) {
    if (this.isElectron) {
      return await window.electron.loadSavedData(filename);
    } else {
      if (filename === 'default.json') {
        // return imported default data
        return defaultData;
      } else {
        // load from localStorage
        const data = localStorage.getItem(`data_${filename}`);
        return data ? JSON.parse(data) : null;
      }
    }
  }

  /**
   * Save data to a file
   */
  async saveData(data, filename) {
    if (this.isElectron) {
      return await window.electron.saveUploadedData(data, filename);
    } else {
      // save to localStorage
      localStorage.setItem(`data_${filename}`, JSON.stringify(data));
      localStorage.setItem(`timestamp_${filename}`, new Date().toISOString());
      localStorage.setItem('currentDataFile', filename);
      return { success: true };
    }
  }

  /**
   * List available data files
   */
  async listFiles() {
    if (this.isElectron) {
      return await window.electron.listSavedFiles();
    } else {
      // get files from localStorage
      const files = ['default.json'];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('data_') && key !== 'data_default.json') {
          files.push(key.replace('data_', ''));
        }
      }
      return files;
    }
  }

  /**
   * Open file dialog (Electron only)
   */
  async openFileDialog() {
    if (this.isElectron) {
      return await window.electron.openFileDialog();
    } else {
      // return a promise that resolves to show file input
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            try {
              const text = await file.text();
              const data = JSON.parse(text);
              resolve({ success: true, data });
            } catch (error) {
              resolve({ success: false, error: error.message });
            }
          } else {
            resolve({ success: false });
          }
        };
        input.click();
      });
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filename) {
    if (this.isElectron) {
      // electron would need to implement file deletion
      return { success: false, error: 'Delete not implemented for Electron' };
    } else {
      try {
        localStorage.removeItem(`data_${filename}`);
        localStorage.removeItem(`timestamp_${filename}`);

        // if this was the current file, switch to default
        const currentFile = localStorage.getItem('currentDataFile');
        if (currentFile === filename) {
          localStorage.setItem('currentDataFile', 'default.json');
        }

        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  }

  /**
   * Get upload timestamp for a file
   */
  async getFileTimestamp(filename) {
    if (this.isElectron) {
      // electron would need to track this in settings
      return new Date();
    } else {
      const timestamp = localStorage.getItem(`timestamp_${filename}`);
      return timestamp ? new Date(timestamp) : new Date();
    }
  }

  /**
   * Get default data
   */
  async getDefaultData() {
    if (this.isElectron) {
      return await window.electron.getDefaultData();
    } else {
      return defaultData;
    }
  }
}

// export singleton instance
export const storage = new UnifiedStorage();
