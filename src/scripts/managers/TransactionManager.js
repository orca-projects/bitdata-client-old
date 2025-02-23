import { TRANSACTION_STORE } from '@constant/dbConstant';

class TransactionManager {
    constructor(dbManager, filterObserverManager, binanceUid) {
        this._dbManager = dbManager;
        this._storeName = TRANSACTION_STORE;

        this._filterObserverManager = filterObserverManager;

        this._binanceUid = binanceUid;
        this._transactionData = null;

        this._transactionTable = document.querySelector('.content-table table tbody');
    }

    async init() {
        try {
            const data = await this._dbManager.select(this._storeName, this._binanceUid);

            if (!data) return;

            this._transactionData = data.transactions;

            this._transactionTable.innerHTML = '';

            Object.entries(this._transactionData).forEach(([positionId, positionData]) => {
                const transaction = new TransactionBase(positionId, positionData);

                this._transactionTable.appendChild(transaction.getRow());

                if (this._filterObserverManager) this._filterObserverManager.subscribe(transaction);
            });
        } catch (error) {
            console.error('Failed to get transactions:', error);
        }
    }

    async saveTransaction(transactions) {
        try {
            const transactionData = {
                binanceUid: this._binanceUid,
                transactions: transactions,
            };

            const merged = Object.assign(this._transactionData || {}, transactionData);

            await this._dbManager.insert(this._storeName, merged);
        } catch (error) {
            console.error('Failed to save transactions:', error);
        }
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

        this._row = this.getRow();
    }

    getRow() {
        if (this._row) {
            return this._row;
        }

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

    filter(filterData) {
        if (!this.checkDateFilter(filterData)) return false;
        if (!this.checkWinloseFilter(filterData)) return false;
        if (!this.checkSymbolFilter(filterData)) return false;

        return true;
    }

    checkDateFilter(filterData) {
        const dateData = filterData.date;

        if (!dateData) {
            return true;
        }

        const [start, end] = dateData.split(' ~ ');

        const startDate = new Date(start);
        const endDate = new Date(end);
        const currentDate = new Date(this._positionClosed.split(' ')[0].replace(/-/g, '/'));

        return currentDate >= startDate && currentDate <= endDate;
    }

    checkWinloseFilter(filterData) {
        const winloseData = filterData.winlose;

        if (!winloseData) {
            return true;
        }

        if (winloseData === 'all') {
            return true;
        }

        return winloseData === this._winlose;
    }

    checkSymbolFilter(filterData) {
        const symbolData = filterData.symbol;

        if (!symbolData) {
            return true;
        }

        try {
            const regex = new RegExp(symbolData, 'i');
            return regex.test(this._symbol);
        } catch (error) {
            console.error('Invalid regex pattern:', error);
            return false;
        }
    }

    showRow() {
        this._row.classList.remove('hidden');
    }

    hideRow() {
        this._row.classList.add('hidden');
    }
}

export default TransactionManager;
