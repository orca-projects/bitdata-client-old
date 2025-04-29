class TransactionFilterObserverManager {
    constructor() {
        this._transactions = [];
    }

    init() {
        this._transactions = [];
    }

    subscribe(transaction) {
        this._transactions.push(transaction);
    }

    notify(filterData) {
        this._transactions.forEach((transaction) => {
            if (transaction.filter(filterData)) {
                transaction.showRow();
            } else {
                transaction.hideRow();
            }
        });
    }
}

export default TransactionFilterObserverManager;
