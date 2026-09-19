(function () {
  'use strict';

  const DB_NAME = 'MarkDownPublishDB';
  const DB_VERSION = 2;
  const ASSET_STORE = 'assets';
  const FILE_STORE = 'fileHistory';

  let dbPromise = null;

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(ASSET_STORE)) {
          db.createObjectStore(ASSET_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(FILE_STORE)) {
          db.createObjectStore(FILE_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Could not open local database.'));
    });
    return dbPromise;
  }

  async function withStore(storeName, mode, operation) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      let request;
      try {
        request = operation(store);
      } catch (error) {
        reject(error);
        return;
      }
      if (request && typeof request === 'object' && 'onsuccess' in request) {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Local database operation failed.'));
      } else {
        tx.oncomplete = () => resolve(request);
        tx.onerror = () => reject(tx.error || new Error('Local database transaction failed.'));
      }
    });
  }

  function makeId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  async function cacheImage(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      throw new Error('Please choose an image file.');
    }
    const item = {
      id: makeId('img'),
      name: file.name || 'image',
      type: file.type,
      size: file.size || 0,
      blob: file,
      createdAt: new Date().toISOString()
    };
    await withStore(ASSET_STORE, 'readwrite', store => store.put(item));
    return item;
  }

  async function getAsset(id) {
    if (!id) return null;
    return withStore(ASSET_STORE, 'readonly', store => store.get(id));
  }

  async function deleteAsset(id) {
    if (!id) return;
    await withStore(ASSET_STORE, 'readwrite', store => store.delete(id));
  }

  async function assetToDataUrl(id) {
    const item = await getAsset(id);
    if (!item || !item.blob) return null;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Could not read cached image.'));
      reader.readAsDataURL(item.blob);
    });
  }

  async function upsertFileHistory(entry) {
    const clean = Object.assign({
      id: makeId('file'),
      name: 'Untitled.md',
      lastOpened: new Date().toISOString(),
      handle: null,
      hasPersistentHandle: false
    }, entry || {});
    await withStore(FILE_STORE, 'readwrite', store => store.put(clean));
    return clean;
  }

  async function listFileHistory() {
    const items = await withStore(FILE_STORE, 'readonly', store => store.getAll());
    return (items || []).sort((a, b) => String(b.lastOpened || '').localeCompare(String(a.lastOpened || '')));
  }

  async function getFileHistory(id) {
    if (!id) return null;
    return withStore(FILE_STORE, 'readonly', store => store.get(id));
  }

  async function removeFileHistory(id) {
    if (!id) return;
    await withStore(FILE_STORE, 'readwrite', store => store.delete(id));
  }

  async function clearAppDatabase() {
    const db = await openDb();
    await Promise.all([ASSET_STORE, FILE_STORE].map(storeName => new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const request = tx.objectStore(storeName).clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    })));
  }

  function supportsFileSystemAccess() {
    return typeof window.showOpenFilePicker === 'function' && typeof window.showSaveFilePicker === 'function';
  }

  async function ensureHandlePermission(handle, mode) {
    if (!handle || typeof handle.queryPermission !== 'function') return false;
    const options = { mode: mode || 'read' };
    try {
      if (await handle.queryPermission(options) === 'granted') return true;
      if (typeof handle.requestPermission === 'function') {
        return (await handle.requestPermission(options)) === 'granted';
      }
    } catch (_) {}
    return false;
  }

  async function pickMarkdownFile() {
    if (!supportsFileSystemAccess()) return null;
    const handles = await window.showOpenFilePicker({
      multiple: false,
      types: [{
        description: 'Markdown documents',
        accept: {
          'text/markdown': ['.md', '.markdown'],
          'text/plain': ['.txt']
        }
      }]
    });
    const handle = handles && handles[0];
    if (!handle) return null;
    const file = await handle.getFile();
    const text = await file.text();
    const entry = await upsertFileHistory({
      id: makeId('file'),
      name: file.name,
      lastModified: file.lastModified,
      lastOpened: new Date().toISOString(),
      handle,
      hasPersistentHandle: true
    });
    return { file, text, handle, entry };
  }

  async function readHistoryFile(id) {
    const entry = await getFileHistory(id);
    if (!entry || !entry.handle) {
      throw new Error('The file is deleted/moved/renamed from the local path.');
    }
    const allowed = await ensureHandlePermission(entry.handle, 'read');
    if (!allowed) throw new Error('Permission to access this file was not granted.');
    try {
      const file = await entry.handle.getFile();
      const text = await file.text();
      entry.name = file.name;
      entry.lastModified = file.lastModified;
      entry.lastOpened = new Date().toISOString();
      await upsertFileHistory(entry);
      return { entry, file, text };
    } catch (_) {
      throw new Error('The file is deleted/moved/renamed from the local path.');
    }
  }

  async function createSaveHandle(suggestedName, mimeType, extension) {
    if (typeof window.showSaveFilePicker !== 'function') return null;
    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    return window.showSaveFilePicker({
      suggestedName,
      types: [{
        description: `${ext.slice(1).toUpperCase()} file`,
        accept: { [mimeType]: [ext] }
      }]
    });
  }

  async function writeTextToHandle(handle, content, mimeType) {
    if (!handle) throw new Error('No destination file handle was provided.');
    const writable = await handle.createWritable();
    await writable.write(new Blob([content], { type: mimeType }));
    await writable.close();
  }

  async function saveTextAs(content, suggestedName, mimeType, extension) {
    const handle = await createSaveHandle(suggestedName, mimeType, extension);
    if (!handle) return { mode: 'download' };
    await writeTextToHandle(handle, content, mimeType);
    return { mode: 'picker', handle };
  }

  window.MDPStorage = {
    cacheImage,
    getAsset,
    deleteAsset,
    assetToDataUrl,
    upsertFileHistory,
    listFileHistory,
    getFileHistory,
    removeFileHistory,
    clearAppDatabase,
    supportsFileSystemAccess,
    pickMarkdownFile,
    readHistoryFile,
    createSaveHandle,
    writeTextToHandle,
    saveTextAs
  };
})();
