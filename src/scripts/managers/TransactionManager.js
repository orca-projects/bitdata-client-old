import { STORE_TRNASACTION } from '@constant/dbConstant';

class TransactionManager {
    constructor(dbManager, binanceUid) {
        this._dbManager = dbManager;
        this._storeName = STORE_TRNASACTION;
        this._binanceUid = binanceUid;
        this._transaction = null;
        this._updated = null;
    }

    async init() {
        try {
            const data = await this._dbManager.select(
                this._storeName,
                this._binanceUid
            );

            this._transaction = data.transaction;
            this._updated = data.updated;
        } catch (error) {
            console.error('Failed to get transaction:', error);
        }
    }

    async saveTransaction(transaction) {
        try {
            const data = {
                binanceUid: this._binanceUid,
                transaction: transaction,
                updated: Date.now(),
            };
            await this._dbManager.insert(this._storeName, data);
        } catch (error) {
            console.error('Failed to save transaction:', error);
        }
    }

    getTransaction() {
        return this._transaction;
    }

    getUpdated() {
        return this._updated;
    }

    renderTransaction() {
        const transactionTableSelector = '.content-table table tbody';
        const $table = document.querySelector(transactionTableSelector);
        console.log($table);
    }
}

export default TransactionManager;
