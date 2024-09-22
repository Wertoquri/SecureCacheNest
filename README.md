# SecureCacheNest

**SecureCacheNest** is a lightweight and secure JavaScript library for storing data in LocalStorage and IndexedDB. It simplifies the process of storing, encrypting, compressing, and synchronizing data on the client side.

## Table of Contents

1. [Purpose](#purpose)
2. [Requirements](#requirements)
3. [Installation Instructions](#installation-instructions)
   - [Via npm](#via-npm)
   - [Via CDN](#via-cdn)
4. [Usage Examples](#usage-examples)
   - [Full Example](#full-example)
   - [Saving Data](#saving-data)
   - [Retrieving Data](#retrieving-data)
   - [Removing Data](#removing-data)
   - [Clearing Storage](#clearing-storage)
   - [Synchronizing with Google Drive](#synchronizing-with-google-drive)
   - [Saving to IndexedDB](#saving-to-indexeddb)
   - [Retrieving from IndexedDB](#retrieving-from-indexeddb)
   - [Caching Data](#caching-data)
   - [History Management](#history-management)
   - [Data Backup and Restore](#data-backup-and-restore)
   - [Syncing Between Tabs](#syncing-between-tabs)
5. [Configuration](#configuration)
   - [Encryption](#encryption)
   - [Compression](#compression)
   - [Setting Expiration](#setting-expiration)
6. [Conclusion](#conclusion)

## Purpose

The library provides:
- A simple API for saving and retrieving data.
- Support for data encryption for security.
- Data compression for saving space.
- Synchronization with Google Drive and support for IndexedDB.

## Requirements

To use **SecureCacheNest**, you need the following libraries:

- **CryptoJS**: For data encryption.
- **LZString**: For data compression.

## Installation Instructions

### Via npm

Install the library and its dependencies using npm:

```bash
npm install secure-cache-nest crypto-js lz-string
```

## Via CDN
To use via CDN, add these lines to your HTML file:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js"></script>
<script src="path/to/secure-cache-nest.js"></script>
```
 
## Usage Examples

### Full Example
Here's a complete example demonstrating all functions of the library:

```javascript

// Initialize the library
const storage = SecureCacheNest;

// Data to be stored
const userData = { name: 'Alice', age: 28 };

// Saving data with encryption and compression
storage.setItem('user', userData, { 
    expiry: 60000,   // Expires in 60 seconds
    compress: true, 
    encrypt: true, 
    secret: 'mySecret' 
});

// Retrieving data
const retrievedUser = storage.getItem('user', { 
    decompress: true, 
    encrypt: true, 
    secret: 'mySecret' 
});
console.log(retrievedUser); // { name: 'Alice', age: 28 }

// Removing data
storage.removeItem('user');

// Checking if the data is removed
const deletedUser = storage.getItem('user');
console.log(deletedUser); // null

// Clearing all storage
storage.clearStorage();

// Synchronizing with Google Drive
// Replace 'yourAuthToken' and 'yourData' with actual values
// storage.syncWithGoogleDrive('yourAuthToken', yourData);

// Saving to IndexedDB
storage.setItemIndexedDB('userIndexedDB', userData);

// Retrieving from IndexedDB
storage.getItemIndexedDB('userIndexedDB').then(data => {
    console.log(data); // { name: 'Alice', age: 28 }
});

```
## Saving Data
```JavaScript
storage.setItem('key', { name: 'John', age: 30 }, { expiry: 60000, compress: true, encrypt: true, secret: 'mySecret' });
```
## Retrieving Data
```javascript
const user = storage.getItem('key', { decompress: true, encrypt: true, secret: 'mySecret' });
console.log(user); // { name: 'John', age: 30 }

```
## Removing Data
```javascript
storage.removeItem('key');

```
## Clearing Storage
```javascript
storage.clearStorage();

```
## Synchronizing with Google Drive
```javascript
storage.syncWithGoogleDrive('yourAuthToken', yourData);

```
## Saving to IndexedDB
```javascript
storage.getItemIndexedDB('key').then(data => {
    console.log(data); // { name: 'Jane', age: 25 }
});

```
## Retrieving from IndexedDB
```javascript
storage.getItemIndexedDB('key').then(data => {
    console.log(data); // { name: 'Jane', age: 25 }
});

```
## Caching Data
```javascript
storage.setItemWithCache('cacheKey', { name: 'Cached Data' });
const cachedData = storage.getItemWithCache('cacheKey');
console.log(cachedData); // { name: 'Cached Data' }

```

## History Management
```javascript
storage.setItemWithHistory('historyKey', { action: 'created' });
const history = storage.getHistory('historyKey');
console.log(history); // [{ action: 'created', timestamp: Date }]

```

## Data Backup and Restore
```javascript
// Backup data
storage.backupData('backup.json');

// Restore data from a file (assuming you have a file input to get the file)
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    storage.restoreData(file);
});

```

## Syncing Between Tabs
```javascript
storage.setItemWithSync('tabKey', { data: 'This data syncs between tabs.' });

```

### Configuration

## Encryption

- To encrypt data, use the encrypt parameter and pass a secret key via the secret parameter:
```Javascript
storage.setItem('key', data, { encrypt: true, secret: 'yourSecret' });
```
## Compression
- To compress data before saving, use the compress parameter:
```Javascript
storage.setItem('key', data, { compress: true });

```
## Setting Expiration
- You can set an expiration time for the data using the expiry parameter in milliseconds:
```Javascript
storage.setItem('key', data, { expiry: 300000 }); // 5 minutes

```
