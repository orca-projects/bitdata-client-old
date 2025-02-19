import { STORE_TRNASACTION } from '@constant/dbConstant';

class TransactionManager {
    constructor(dbManager, binanceUid) {
        this._dbManager = dbManager;
        this._storeName = STORE_TRNASACTION;
        this._binanceUid = binanceUid;
        this._transactions = null;
        this._updated = null;

        this._renderManager = null;
    }

    async init() {
        try {
            const data = await this._dbManager.select(this._storeName, this._binanceUid);

            this._transactions = data.transactions;
            this._updated = data.updated;

            this._renderManager = new TransactionRenderManager();
            this._renderManager.init(this._transactions);
        } catch (error) {
            console.error('Failed to get transactions:', error);
        }
    }

    async saveTransaction(transactions) {
        try {
            const data = {
                binanceUid: this._binanceUid,
                transactions: transactions,
                updated: Date.now(),
            };
            await this._dbManager.insert(this._storeName, data);
        } catch (error) {
            console.error('Failed to save transactions:', error);
        }
    }

    getTransaction() {
        return this._transactions;
    }

    getUpdated() {
        return this._updated;
    }

    renderTransaction() {
        this._renderManager.render();
    }
}

class TransactionRenderManager {
    constructor() {
        this._filterManager = new TransactionFilterManager();

        this._transactionBaseArr = [];

        this._$transactionTable = document.querySelector('.content-table table tbody');
        this._$transactionRowArr = [];
    }

    init(transactions) {
        this._$transactionTable.innerHTML = '';

        Object.entries(transactions).forEach(([positionId, transaction]) => {
            const transactionBase = new TransactionBase(positionId, transaction);
            const row = transactionBase.getRow();

            this._transactionBaseArr.push(transactionBase);
            this._$transactionTable.appendChild(row);
            this._$transactionRowArr.push(row);
        });
    }

    render() {
        const satisfiedTransactionArr = this._transactionBaseArr.reduce((satisfiedTransactionArr, transactionBase) => {
            if (this._filterManager.isSatisfied(transactionBase)) {
                satisfiedTransactionArr.push(transactionBase.getRowId());
            }

            return satisfiedTransactionArr;
        }, []);

        this._$transactionRowArr.forEach(($transactionRow) => {
            if (satisfiedTransactionArr.includes($transactionRow.id)) {
                $transactionRow.classList.remove('hidden');
            } else {
                $transactionRow.classList.add('hidden');
            }
        });
    }
}

class TransactionBase {
    constructor(positionId, transaction) {
        this._positionId = positionId;
        this._winlose = transaction.winlose;
        this._positionClosed = transaction.positionClosed;
        this._positionDuration = transaction.positionDuration;
        this._position = transaction.position;
        this._symbol = transaction.symbol;
        this._totalBuy = transaction.totalBuy;
        this._totalSell = transaction.totalSell;
        this._pnl = transaction.pnl;
        this._finalPnl = transaction.finalPnl;
        this._totalBuyFee = transaction.totalBuyFee;
        this._totalSellFee = transaction.totalSellFee;
        this._totalFundingCost = transaction.totalFundingCost;
        this._totalFee = transaction.totalFee;
        this._finalRoi = transaction.finalRoi;
        this._avgBuy = transaction.avgBuy;
        this._avgSell = transaction.avgSell;
    }

    getRow() {
        const positionClosed = this._positionClosed.replace(/ /g, '<br>');

        const row = document.createElement('tr');

        row.id = `transaction-${this._positionId}`;
        row.classList.add(this._winlose);
        row.classList.add('hidden');

        row.innerHTML = `
            <td>${positionClosed}</td>
            <td>${this._positionDuration}</td>
            <td>${this._position}</td>
            <td>${this._symbol}</td>
            <td>${this._totalBuy}</td>
            <td>${this._totalSell}</td>
            <td>${this._pnl}</td>
            <td class="final-profit">
                <span class="text">${this._finalPnl.toLocaleString()}</span>
                <div class="tooltip-content">
                    <div class="container">
                        <p>매수 체결 수수료: <span class="fee">${this._totalBuyFee}</span></p>
                        <p>매도 체결 수수료: <span class="fee">${this._totalSellFee}</span></p>
                        <p>총 펀딩 비용: <span class="funding-cost">${this._totalFundingCost}</span></p>
                        <p>수수료 총합: <span class="total-fee">${this._totalFee}</span></p>
                    </div>
                </div>
            </td>
            <td>${this._finalRoi}</td>
            <td>${this._avgBuy}</td>
            <td>${this._avgSell}</td>
            <td>
                <button type="button" class="image-memo-btn">
                    <img src="/assets/images/button/memo.png" alt="메모 버튼">
                </button>
            </td>
        `;
        return row;
    }

    isSatisfied() {
        return this._filterManager.isSatisfied();
    }

    getRowId() {
        return `transaction-${this._positionId}`;
    }

    getPositionClosed() {
        return this._positionClosed;
    }

    getWinlose() {
        return this._winlose;
    }
}

class TransactionFilterManager {
    constructor() {
        this._dateFilter = document.querySelector('input[name="data-date"]');
        this._winloseFilter = document.querySelectorAll('input[name="filter-winlose"]');
    }

    isSatisfied(transactionBase) {
        const positionClosed = transactionBase.getPositionClosed();
        const winlose = transactionBase.getWinlose();

        return this.checkDateFilter(positionClosed) && this.checkWinloseFilter(winlose);
    }

    checkDateFilter(positionClosed) {
        const [start, end] = this._dateFilter.value.split(' ~ ');

        const startDate = new Date(start);
        const endDate = new Date(end);
        const currentDate = new Date(positionClosed.split(' ')[0].replace(/-/g, '/'));

        return currentDate >= startDate && currentDate <= endDate;
    }

    checkWinloseFilter(winlose) {
        let selectedValue = 'all';

        this._winloseFilter.forEach((radio) => {
            if (radio.checked) {
                selectedValue = radio.value;
            }
        });

        if (selectedValue === 'all') {
            return true;
        }

        return selectedValue === winlose;
    }
}

export default TransactionManager;
