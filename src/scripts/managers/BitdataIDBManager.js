import { IDB_NAME, TRANSACTION_STORE } from '@constant/dbConstant';

class BitdataIDBManager {
    constructor() {
        this._db = null;
        this._dbVersion = 1;
        this._dbName = IDB_NAME;
    }

    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this._dbName, this._dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(TRANSACTION_STORE)) {
                    db.createObjectStore(TRANSACTION_STORE, { keyPath: 'binanceUid' });
                }
            };

            request.onsuccess = (event) => {
                this._db = event.target.result;
                resolve(this._db);
            };

            request.onerror = (event) => {
                reject(`IndexedDB open error: ${event.target.errorCode}`);
            };
        });
    }

    insert(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this._db) {
                return reject('Database is not opened.');
            }
            const transaction = this._db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve('Data inserted successfully.');
            request.onerror = () => reject('Insert failed.');
        });
    }

    select(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this._db) {
                return reject('Database is not opened.');
            }
            const transaction = this._db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);

            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject('Select failed.');
        });
    }

    delete(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this._db) {
                return reject('Database is not opened.');
            }
            const transaction = this._db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(`Delete failed: ${event.target.error}`);
        });
    }

    closeDB() {
        if (this._db) {
            this._db.close();
            this._db = null;
        }
    }
}

export default BitdataIDBManager;
