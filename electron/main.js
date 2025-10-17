const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;
const userDataPath = app.getPath('userData');
const dataDir = path.join(userDataPath, 'data');

// ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    backgroundColor: '#ffffff',
  });

  // Load the app
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await ensureDataDir();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// get default data
ipcMain.handle('get-default-data', async () => {
  try {
    const defaultPath = path.join(__dirname, '../src/data/default.json');
    const data = await fs.readFile(defaultPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load default data:', error);
    return null;
  }
});

// save uploaded data
ipcMain.handle('save-uploaded-data', async (event, data, filename) => {
  try {
    const filePath = path.join(dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    // save current selection
    const settingsPath = path.join(userDataPath, 'settings.json');
    const settings = { currentDataFile: filename };
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));

    return { success: true };
  } catch (error) {
    console.error('Failed to save data:', error);
    return { success: false, error: error.message };
  }
});

// get current data file
ipcMain.handle('get-current-data-file', async () => {
  try {
    const settingsPath = path.join(userDataPath, 'settings.json');
    const settingsData = await fs.readFile(settingsPath, 'utf8');
    const settings = JSON.parse(settingsData);
    return settings.currentDataFile || 'default.json';
  } catch (error) {
    return 'default.json'; // fallback to default
  }
});

// set current data file
ipcMain.handle('set-current-data-file', async (event, filename) => {
  try {
    const settingsPath = path.join(userDataPath, 'settings.json');
    const settings = { currentDataFile: filename };
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Failed to save current data file setting:', error);
    return { success: false, error: error.message };
  }
});

// load saved data
ipcMain.handle('load-saved-data', async (event, filename) => {
  try {
    if (filename === 'default.json') {
      const defaultPath = path.join(__dirname, '../src/data/default.json');
      const data = await fs.readFile(defaultPath, 'utf8');
      return JSON.parse(data);
    }

    const filePath = path.join(dataDir, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load saved data:', error);
    return null;
  }
});

// list saved data files
ipcMain.handle('list-saved-files', async () => {
  try {
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    return ['default.json', ...jsonFiles];
  } catch (error) {
    console.error('Failed to list files:', error);
    return ['default.json'];
  }
});

// open file dialog
ipcMain.handle('open-file-dialog', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const data = await fs.readFile(filePath, 'utf8');
      return { success: true, data: JSON.parse(data) };
    }

    return { success: false };
  } catch (error) {
    console.error('Failed to open file:', error);
    return { success: false, error: error.message };
  }
});


