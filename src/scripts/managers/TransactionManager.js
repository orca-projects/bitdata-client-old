import { STORE_TRNASACTION } from '@constant/dbConstant';

class TransactionManager {
    constructor(dbManager, binanceUid) {
        this._dbManager = dbManager;
        this._storeName = STORE_TRNASACTION;
        this._binanceUid = binanceUid;
        this._transactions = null;
        this._updated = null;
    }

    async init() {
        try {
            const data = await this._dbManager.select(
                this._storeName,
                this._binanceUid
            );

            this._transactions = data.transactions;
            this._updated = data.updated;
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
        const transactionTableSelector = '.content-table table tbody';
        const $table = document.querySelector(transactionTableSelector);

        if (!$table) {
            console.warn('🚨 Transaction table not found in DOM.');
            return;
        }

        $table.innerHTML = '';

        if (
            !this._transactions ||
            Object.keys(this._transactions).length === 0
        ) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.setAttribute('colspan', '12');
            emptyCell.textContent = 'No transactions found.';
            emptyRow.appendChild(emptyCell);
            $table.appendChild(emptyRow);
            return;
        }

        Object.entries(this._transactions).forEach(
            ([positionId, transaction]) => {
                const row = new TransactionBase(
                    positionId,
                    transaction
                ).getRow();
                $table.appendChild(row);
            }
        );
    }
}
class TransactionBase {
    constructor(positionId, transaction) {
        this._positionId = positionId;
        this._winlose = transaction.winlose;
        this._positionClosed = transaction.psitionClosed;
        this._positionDuration = transaction.postionDuration;
        this._position = transaction.position;
        this._symbol = transaction.symbol;
        this._totalBuy = transaction.totalBuy;
        this._totalSell = transaction.totalSell;
        this._pnl = transaction.pnl;
        this._finalPnl = transaction.finalPnl;
        this._finalRoi = transaction.finalRoi;
        this._avgBuy = transaction.avgBuy;
        this._avgSell = transaction.avgSell;
    }

    getRow() {
        const positionClosed = this._positionClosed.replace(/ /g, '<br>');

        const row = document.createElement('tr');
        row.classList.add(this._winlose);

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
                        <p>매수 체결 방식: <span>시장가</span></p>
                        <p>매수 체결 수수료: <span class="fee">-5.22</span></p>
                        <p>매도 체결 방식: <span>지정가</span></p>
                        <p>매도 체결 수수료: <span class="fee">-1.45</span></p>
                        <p>총 펀딩 비용: <span class="funding-cost">12.45</span></p>
                        <p>수수료 총합: <span class="total-fee">5.78</span></p>
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
}

export default TransactionManager;
