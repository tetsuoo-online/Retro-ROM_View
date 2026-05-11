const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs   = require('fs');
const { spawn } = require('child_process');
const { pathToFileURL } = require('url');

// ─── WINDOW ──────────────────────────────────────────────────────────────────
let mainWin = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 900,
    minWidth: 900, minHeight: 600,
    title: 'Retro-ROM View',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
	  sandbox: false,
	  webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadFile('index.html');
  win.webContents.on('before-input-event', (event, input) => {
   if (input.type === 'keyDown' && input.key === 'F5') {
     win.webContents.reload();
     event.preventDefault();
   }
  });
  win.maximize();
  mainWin = win;
  win.on('closed', () => { mainWin = null; });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ─── ROM SCAN ────────────────────────────────────────────────────────────────
const ROM_EXTS = /\.(zip|7z|chd|rom|bin|img|iso)$/i;

function scanFolder(dirPath) {
  const results = [];
  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (ROM_EXTS.test(entry.name)) {
        let size = 0;
        try { size = fs.statSync(fullPath).size; } catch {}
        const nameNoExt = entry.name.replace(/\.[^.]+$/, '');
        results.push({
          name:      entry.name,
          nameNoExt,
          ext:       entry.name.split('.').pop().toLowerCase(),
          size,
          path:      fullPath,
        });
      }
    }
  }
  walk(dirPath);
  return results;
}

// ─── IPC ─────────────────────────────────────────────────────────────────────

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled || !result.filePaths.length) return null;
  const folderPath = result.filePaths[0];
  const folderName = path.basename(folderPath);
  const files = scanFolder(folderPath);
  return { folderPath, folderName, files };
});

ipcMain.handle('scan-folder', async (e, folderPath) => {
  try {
    const stat = fs.statSync(folderPath);
    if (!stat.isDirectory()) return null;
  } catch { return null; }
  const folderName = path.basename(folderPath);
  const files = scanFolder(folderPath);
  return { folderPath, folderName, files };
});

ipcMain.handle('select-dat', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'DAT / XML', extensions: ['xml', 'dat'] }],
  });
  if (result.canceled || !result.filePaths.length) return null;
  const filePath = result.filePaths[0];
  const content = fs.readFileSync(filePath, 'utf8');
  return { fileName: path.basename(filePath), filePath, content };
});

ipcMain.handle('read-file', async (e, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { fileName: path.basename(filePath), filePath, content };
  } catch { return null; }
});

ipcMain.handle('trash-files', async (e, paths) => {
  const errors = [];
  for (const p of paths) {
    try { await shell.trashItem(p); }
    catch (err) { errors.push({ path: p, error: err.message }); }
  }
  return { errors };
});

ipcMain.handle('delete-files', async (e, paths) => {
  const errors = [];
  for (const p of paths) {
    try { fs.unlinkSync(p); }
    catch (err) { errors.push({ path: p, error: err.message }); }
  }
  return { errors };
});

ipcMain.handle('reveal-file', async (e, filePath) => {
  shell.showItemInFolder(filePath);
});

ipcMain.handle('open-file', async (e, filePath) => {
  await shell.openPath(filePath);
});

ipcMain.handle('save-list', async (e, content) => {
  const result = await dialog.showSaveDialog({
    defaultPath: 'roms_a_supprimer.txt',
    filters: [{ name: 'Texte', extensions: ['txt'] }],
  });
  if (result.canceled || !result.filePath) return false;
  fs.writeFileSync(result.filePath, content, 'utf8');
  return true;
});

// ─── SÉLECTION EXÉCUTABLE ÉMULATEUR ─────────────────────────────────────────
ipcMain.handle('select-emulator-exe', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Exécutables', extensions: ['exe', 'bat', 'sh', 'AppImage', ''] },
    ],
  });
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

// ─── LANCEMENT ÉMULATEUR ─────────────────────────────────────────────────────
function sendToConsole(line) {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.webContents.send('console-line', line);
  }
}

ipcMain.handle('launch-emulator', async (e, { exePath, resolvedArgs }) => {
  try {
    const args = (resolvedArgs || []).filter(Boolean);
    sendToConsole('▶ ' + exePath + ' ' + args.join(' '));
    const child = spawn(exePath, args, { detached: false, stdio: ['ignore', 'pipe', 'pipe'], cwd: path.dirname(exePath) });
    child.stdout.on('data', d => d.toString().split('\n').forEach(l => l && sendToConsole(l)));
    child.stderr.on('data', d => d.toString().split('\n').forEach(l => l && sendToConsole(l)));
    child.on('error', err => sendToConsole('❌ Erreur spawn: ' + err.message));
    child.on('close', code => sendToConsole('⏹ Processus terminé (code ' + code + ')'));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// ─── SETTINGS ────────────────────────────────────────────────────────────────
const SETTINGS_PATH = path.join(__dirname, 'config/settings.json');

function readSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8')); }
  catch { return {}; }
}

function writeSettings(patch) {
  const current = readSettings();
  const merged  = { ...current, ...patch };
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

ipcMain.handle('load-settings', () => readSettings());
ipcMain.handle('save-settings', (e, patch) => writeSettings(patch));

// ─── GAME PREFS ──────────────────────────────────────────────────────────────
const GAME_PREFS_PATH = path.join(__dirname, 'config/games.json');

ipcMain.handle('load-game-prefs', () => {
  try { return JSON.parse(fs.readFileSync(GAME_PREFS_PATH, 'utf8')); }
  catch { return {}; }
});
ipcMain.handle('save-game-prefs', (e, prefs) => {
  fs.writeFileSync(GAME_PREFS_PATH, JSON.stringify(prefs, null, 2), 'utf8');
  return true;
});

// ─── READ ZIP CONTENTS ────────────────────────────────────────────────────────
function parseZipContents(buf) {
  const len = buf.length;
  if (len < 22) return { error: 'Fichier trop petit' };

  // Find End of Central Directory signature: 0x06054b50
  let eocdOffset = -1;
  const maxBack = Math.min(len - 22, 65535 + 22);
  for (let i = len - 22; i >= len - 22 - maxBack && i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocdOffset = i; break; }
  }
  if (eocdOffset === -1) return { error: 'Signature EOCD introuvable — pas un ZIP valide' };

  let cdCount  = buf.readUInt16LE(eocdOffset + 10);
  let cdOffset = buf.readUInt32LE(eocdOffset + 16);

  // ZIP64 fallback
  if (cdCount === 0xFFFF || cdOffset === 0xFFFFFFFF) {
    const loc = eocdOffset - 20;
    if (loc >= 0 && buf.readUInt32LE(loc) === 0x07064b50) {
      const eocd64Off = Number(buf.readBigUInt64LE(loc + 8));
      if (eocd64Off >= 0 && eocd64Off + 56 <= len && buf.readUInt32LE(eocd64Off) === 0x06064b50) {
        cdCount  = Number(buf.readBigUInt64LE(eocd64Off + 32));
        cdOffset = Number(buf.readBigUInt64LE(eocd64Off + 48));
      }
    }
  }

  const entries = [];
  let pos = cdOffset;
  for (let i = 0; i < cdCount && pos + 46 <= len; i++) {
    if (buf.readUInt32LE(pos) !== 0x02014b50) break;
    const crc32    = buf.readUInt32LE(pos + 16);
    let compSz     = buf.readUInt32LE(pos + 20);
    let uncompSz   = buf.readUInt32LE(pos + 24);
    const nameLen  = buf.readUInt16LE(pos + 28);
    const extraLen = buf.readUInt16LE(pos + 30);
    const cmtLen   = buf.readUInt16LE(pos + 32);
    const name     = buf.slice(pos + 46, pos + 46 + nameLen).toString('utf8');
    // ZIP64 extended info
    if (uncompSz === 0xFFFFFFFF || compSz === 0xFFFFFFFF) {
      const eStart = pos + 46 + nameLen, eEnd = eStart + extraLen;
      let ep = eStart;
      while (ep + 4 <= eEnd) {
        const hid = buf.readUInt16LE(ep), dSz = buf.readUInt16LE(ep + 2);
        if (hid === 0x0001) {
          let off = ep + 4;
          if (uncompSz === 0xFFFFFFFF && off + 8 <= eEnd) { uncompSz = Number(buf.readBigUInt64LE(off)); off += 8; }
          if (compSz   === 0xFFFFFFFF && off + 8 <= eEnd) { compSz   = Number(buf.readBigUInt64LE(off)); }
          break;
        }
        ep += 4 + dSz;
      }
    }
    if (!name.endsWith('/')) {
      entries.push({ name, crc: crc32.toString(16).padStart(8, '0'), size: uncompSz, compSize: compSz });
    }
    pos += 46 + nameLen + extraLen + cmtLen;
  }
  return { entries };
}

ipcMain.handle('read-zip-contents', async (e, filePath) => {
  try {
    const buf = fs.readFileSync(filePath);
    return parseZipContents(buf);
  } catch (err) {
    return { error: err.message };
  }
});

// ─── FIND SNAP ────────────────────────────────────────────────────────────────
ipcMain.handle('find-snap', async (e, shortName) => {
  const snapDir = path.join(__dirname, 'snap');
  if (!fs.existsSync(snapDir)) return { noFolder: true };
  const exts = [
    { ext: 'png',  mime: 'image/png'  },
    { ext: 'jpg',  mime: 'image/jpeg' },
    { ext: 'jpeg', mime: 'image/jpeg' },
    { ext: 'webp', mime: 'image/webp' },
  ];
  for (const { ext, mime } of exts) {
    const p = path.join(snapDir, shortName + '.' + ext);
    if (fs.existsSync(p)) {
      try {
        const buf = fs.readFileSync(p);
        return `data:${mime};base64,${buf.toString('base64')}`;
      } catch { return null; }
    }
  }
  return null;
});