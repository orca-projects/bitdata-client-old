import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';
import BitdataIDBManager from '@manager/BitdataIDBManager';
import ProfileManager from '@manager/ProfileManager';
import TransactionManager from '@manager/TransactionManager';

// for test start
const fetchTransaction = async () => {
    try {
        const response = await new RequestSender().setUrl(`${SERVER_URL}/history/`).setMethod('GET').send();

        return response;
    } catch (error) {
        console.error('API 데이터 로드 오류:', error);
    }
};

const test = async () => {
    const response = await fetchTransaction();

    const binanceUid = response.binanceUid;
    const transactions = response.transactions;

    const dbManager = new BitdataIDBManager();
    await dbManager.openDB();

    const transactionsManager = new TransactionManager(dbManager, binanceUid);
    await transactionsManager.saveTransaction(transactions);
};
// for test end

const initTransaction = async () => {
    const dbManager = new BitdataIDBManager();
    await dbManager.openDB();

    const profileManager = new ProfileManager();
    await profileManager.init();

    const binanceUid = profileManager.getBinanceUid();

    const transactionsManager = new TransactionManager(dbManager, binanceUid);
    await transactionsManager.init();

    transactionsManager.renderTransaction();
};

(async () => {
    await test();
    await initTransaction();
})();
