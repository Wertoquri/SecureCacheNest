import CryptoJS from 'crypto-js';
import LZString from 'lz-string';

const SimpleStorage = (function () {
    const memoryCache = {};
    const history = {};
    const MAX_STORAGE_SIZE = 5000;
    const channel = new BroadcastChannel('storage-sync');
    const eventListeners = {
        set: [],
        remove: [],
        clear: []
    };

    function serialize(data) {
        return JSON.stringify(data);
    }

    function deserialize(data) {
        return data ? JSON.parse(data) : null;
    }

    function compressData(data) {
        return LZString.compressToUTF16(serialize(data));
    }

    function decompressData(data) {
        return deserialize(LZString.decompressFromUTF16(data));
    }

    function encrypt(data, secret) {
        return CryptoJS.AES.encrypt(data, secret).toString();
    }

    function decrypt(data, secret) {
        const bytes = CryptoJS.AES.decrypt(data, secret);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    function triggerEvent(event, data) {
        if (eventListeners[event]) {
            eventListeners[event].forEach(callback => callback(data));
        }
    }

    function on(event, callback) {
        eventListeners[event].push(callback);
    }

    function setItem(key, value, options = {}) {
        const { expiry, compress, encrypt, secret } = options;
        let storedValue = serialize(value);

        if (encrypt && secret) {
            storedValue = encrypt(storedValue, secret);
        }
        if (compress) {
            storedValue = compressData(storedValue);
        }

        const item = {
            value: storedValue,
            expiry: expiry ? new Date().getTime() + expiry : null
        };
        localStorage.setItem(key, serialize(item));
        triggerEvent('set', { key, value });
    }

    function getItem(key, options = {}) {
        const { decompress, encrypt, secret } = options;
        const item = deserialize(localStorage.getItem(key));
        if (!item) return null;

        if (item.expiry && new Date().getTime() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }

        let value = item.value;
        if (decompress) {
            value = decompressData(value);
        }
        if (encrypt && secret) {
            value = decrypt(value, secret);
        }

        return deserialize(value);
    }

    function removeItem(key) {
        localStorage.removeItem(key);
        triggerEvent('remove', { key });
    }

    function clearStorage() {
        localStorage.clear();
        triggerEvent('clear', {});
    }

    async function syncWithGoogleDrive(authToken, data) {
        const url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=media";
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log("Data successfully synced with Google Drive");
        } else {
            console.error("Error syncing with Google Drive");
        }
    }

    function setSessionTimeout(timeoutInMinutes) {
        setTimeout(() => {
            clearStorage();
            console.log('Session ended, data cleared');
        }, timeoutInMinutes * 60 * 1000);
    }

    async function setItemIndexedDB(key, value) {
        const db = await openIndexedDB();
        const tx = db.transaction('store', 'readwrite');
        tx.objectStore('store').put(value, key);
        return tx.complete;
    }

    async function getItemIndexedDB(key) {
        const db = await openIndexedDB();
        const tx = db.transaction('store');
        const store = tx.objectStore('store');
        return store.get(key);
    }

    async function openIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('SimpleStorage', 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                db.createObjectStore('store');
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Stores encrypted data
    function setItemEncrypted(key, value, secret) {
        const encryptedValue = encrypt(serialize(value), secret);
        localStorage.setItem(key, encryptedValue);
        triggerEvent('set', { key, value });
    }

    // Retrieves and decrypts data
    function getItemDecrypted(key, secret) {
        const item = localStorage.getItem(key);
        if (!item) return null;
        const decryptedValue = decrypt(item, secret);
        return deserialize(decryptedValue);
    }

    // Caching
    function setItemWithCache(key, value) {
        memoryCache[key] = value;
        localStorage.setItem(key, serialize(value));
        triggerEvent('set', { key, value });
    }

    function getItemWithCache(key) {
        return memoryCache[key] || getItem(key);
    }

    // Records change history
    function setItemWithHistory(key, value) {
        if (!history[key]) history[key] = [];
        history[key].push({ value, timestamp: new Date() });
        setItem(key, value);
    }

    // Retrieves change history
    function getHistory(key) {
        return history[key] || [];
    }

    // Limits the number of stored items
    function setItemWithLimit(key, value, limit) {
        const storedItems = JSON.parse(localStorage.getItem(key)) || [];
        if (storedItems.length >= limit) {
            storedItems.shift(); // Removes the oldest item
        }
        storedItems.push(value);
        localStorage.setItem(key, serialize(storedItems));
    }

    // Cleans items based on priority
    function cleanStorageByPriority(priorityKey) {
        const items = Object.keys(localStorage);
        items.sort((a, b) => {
            // Determine priority based on keys or some criteria
            return localStorage.getItem(a).length - localStorage.getItem(b).length;
        });
        items.forEach(key => {
            if (key !== priorityKey) {
                localStorage.removeItem(key);
            }
        });
    }

    // Copies data from LocalStorage to SessionStorage
    function copyFromLocalToSession(key) {
        const value = localStorage.getItem(key);
        if (value) {
            sessionStorage.setItem(key, value);
        }
    }

    // Copies data from SessionStorage to LocalStorage
    function copyFromSessionToLocal(key) {
        const value = sessionStorage.getItem(key);
        if (value) {
            localStorage.setItem(key, value);
        }
    }

    // Synchronizes with the server via API
    async function syncWithServer(apiEndpoint, method = 'GET', body = null) {
        const response = await fetch(apiEndpoint, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        return response.json();
    }

    // Backs up data as a file
    function backupData(filename) {
        const data = localStorage.getItem('your-key'); // Change to the required key
        const blob = new Blob([data], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename || 'backup.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Restores data from a file
    function restoreData(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const data = event.target.result;
            localStorage.setItem('your-key', data); // Change to the required key
        };
        reader.readAsText(file);
    }

    // Synchronizes changes between tabs
    function setItemWithSync(key, value) {
        localStorage.setItem(key, value);
        channel.postMessage({ key, value });
    }

    channel.onmessage = function(event) {
        const { key, value } = event.data;
        localStorage.setItem(key, value);
        triggerEvent('set', { key, value });
    };

    return {
        setItem, // Stores data in LocalStorage with support for encryption and compression
        getItem, // Retrieves data from LocalStorage with support for decryption and decompression
        removeItem, // Removes a specific item from LocalStorage
        clearStorage, // Clears the entire LocalStorage
        syncWithGoogleDrive, // Synchronizes data with Google Drive for backup
        setSessionTimeout, // Sets a session timeout after which the storage is cleared
        setItemIndexedDB, // Stores data in IndexedDB
        getItemIndexedDB, // Retrieves data from IndexedDB
        on, // Registers events for set, remove, and clear
        triggerEvent, // Triggers set, remove, clear events
        setItemEncrypted, // Stores encrypted data in LocalStorage
        getItemDecrypted, // Retrieves and decrypts data from LocalStorage
        setItemWithCache, // Stores data in memory for quick access (caching)
        getItemWithCache, // Retrieves data from memory (cache)
        setItemWithHistory, // Records change history of data
        getHistory, // Retrieves change history for a specific key
        setItemWithLimit, // Limits the number of stored items
        cleanStorageByPriority, // Cleans items based on priority
        copyFromLocalToSession, // Copies data from LocalStorage to SessionStorage
        copyFromSessionToLocal, // Copies data from SessionStorage to LocalStorage
        syncWithServer, // Synchronizes with the server via API
        backupData, // Backs up data as a file
        restoreData, // Restores data from a file
        setItemWithSync // Synchronizes data changes between tabs using BroadcastChannel
    };
})();
