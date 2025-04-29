class TransactionPaginationManager {
    constructor() {
        this._transactionTable = document.querySelector('.content-table table');
        this._emptyResult = document.querySelector('.content-table .empty-result');
        this._transactionTableBody = document.querySelector('.content-table table tbody');
        this._optionItem = document.getElementById('option-item');
        this._prevStartBtn = document.querySelector('.pre-start-btn');
        this._prevBtn = document.querySelector('.pre-btn');
        this._pageNumberContainer = document.querySelector('.page-number-container');
        this._nextBtn = document.querySelector('.next-btn');
        this._nextEndBtn = document.querySelector('.next-end-btn');

        this._transactions = null;
        this._itemsPerPage = null;
        this._totalPage = 0;
        this._curPage = 1;

        this._optionItem.addEventListener('change', () => this.updateItemsPerPage());

        this._prevStartBtn.addEventListener('click', () => this.goToPage('start'));
        this._prevBtn.addEventListener('click', () => this.prevPage());
        this._nextBtn.addEventListener('click', () => this.nextPage());
        this._nextEndBtn.addEventListener('click', () => this.goToPage('end'));
    }

    updateItemsPerPage() {
        this._itemsPerPage = parseInt(this._optionItem.value);
        this._transactions = Array.from(this._transactionTableBody.children).filter((item) => {
            return !item.classList.contains('hidden');
        });
        this._totalPage = Math.max(1, Math.ceil(this._transactions.length / this._itemsPerPage));
        this._curPage = 1;
        this.assignPages();

        if (this._transactions.length === 0) {
            this._transactionTable.style.display = 'none';
            this._emptyResult.style.display = 'flex';
        } else {
            this._transactionTable.style.display = '';
            this._emptyResult.style.display = 'none';
        }

        this.updatePaginationUI();
    }

    assignPages() {
        this._transactions.forEach((item, index) => {
            item.dataset.page = Math.floor(index / this._itemsPerPage) + 1;
        });
    }

    updatePaginationUI() {
        this._prevBtn.disabled = this._curPage === 1;
        this._prevStartBtn.disabled = this._curPage === 1;
        this._nextBtn.disabled = this._curPage === this._totalPage;
        this._nextEndBtn.disabled = this._curPage === this._totalPage;
        this.renderPageNumbers();
        this.updateVisibleItems();
    }

    renderPageNumbers() {
        this._pageNumberContainer.innerHTML = '';

        const maxVisibleButtons = 5;
        const halfRange = Math.floor(maxVisibleButtons / 2);
        let startPage = Math.max(1, this._curPage - halfRange);
        let endPage = Math.min(this._totalPage, startPage + maxVisibleButtons - 1);

        if (endPage - startPage < maxVisibleButtons - 1) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }

        if (startPage > 1) {
            this.createPageButton(1);
            if (startPage > 2) {
                this._pageNumberContainer.appendChild(this.createEllipsis());
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            this.createPageButton(i);
        }

        if (endPage < this._totalPage) {
            if (endPage < this._totalPage - 1) {
                this._pageNumberContainer.appendChild(this.createEllipsis());
            }
            this.createPageButton(this._totalPage);
        }

        if (this._totalPage === 0) {
            this.createPageButton(1);
        }

        this.updatePageNumbers();
    }

    createPageButton(pageNumber) {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('page-number-btn');
        button.textContent = pageNumber;
        button.addEventListener('click', () => this.goToPage(pageNumber));
        this._pageNumberContainer.appendChild(button);
    }

    createEllipsis() {
        const ellipsis = document.createElement('div');
        ellipsis.classList.add('pagination-ellipsis');
        ellipsis.textContent = '...';
        return ellipsis;
    }

    updatePageNumbers() {
        const buttons = document.querySelectorAll('.page-number-btn');

        buttons.forEach((button) => {
            if (parseInt(button.textContent) === this._curPage) {
                button.classList.add('current-page');
            } else {
                button.classList.remove('current-page');
            }
        });
    }

    updateVisibleItems() {
        Array.from(this._transactionTableBody.children).forEach((item) => {
            item.style.display = item.dataset.page == this._curPage ? 'table-row' : 'none';
            if (item.classList.contains('hidden')) item.style.display = 'none';
        });
    }

    nextPage() {
        if (this._curPage < this._totalPage) {
            this._curPage++;
            this.updatePaginationUI();
        }
    }

    prevPage() {
        if (this._curPage > 1) {
            this._curPage--;
            this.updatePaginationUI();
        }
    }

    goToPage(page) {
        if (page === 'start') page = 1;
        if (page === 'end') page = this._totalPage;

        this._curPage = page;
        this.updatePaginationUI();
    }
}

export default TransactionPaginationManager;
