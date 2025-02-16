import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';
import BitdataIDBManager from '@manager/BitdataIDBManager';
import ProfileManager from '@manager/ProfileManager';
import TransactionManager from '@manager/TransactionManager';

// for test start
const fetchTransaction = async () => {
    try {
        const response = await new RequestSender()
            .setUrl(`${SERVER_URL}/history/`)
            .setMethod('GET')
            .send();

        return response;
    } catch (error) {
        console.error('API 데이터 로드 오류:', error);
    }
};

const test = async () => {
    const response = await fetchTransaction();

    const binanceUid = response.binanceUid;
    const transaction = response.transaction;

    const dbManager = new BitdataIDBManager();
    await dbManager.openDB();

    const transactionManager = new TransactionManager(dbManager, binanceUid);
    await transactionManager.saveTransaction(transaction);
};
// for test end

const initTransaction = async () => {
    const dbManager = new BitdataIDBManager();
    await dbManager.openDB();

    const profileManager = new ProfileManager();
    await profileManager.init();

    const binanceUid = profileManager.getBinanceUid();

    const transactionManager = new TransactionManager(dbManager, binanceUid);
    await transactionManager.init();

    transactionManager.renderTransaction();
};

(async () => {
    // await test();
    await initTransaction();
})();
