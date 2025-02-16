import { SERVER_URL } from '@constant/apiConstant';

import { ConverterLib } from '@library/ConverterLib';
import RequestSender from '@library/RequestSender';

class ProfileManager {
    constructor() {
        this._storageKey = 'bitdata_user_profile';
        this._username = '';
        this._isConnected = false;
        this._apiKey = '';
        this._binanceUid = '';
    }

    async init() {
        const data = await this.loadData();
        this._username = data.username || '';
        this._isConnected = data.isConnected || false;
        this._apiKey = data.apiKey || '';
        this._binanceUid = data.binanceUid || '';

        return this;
    }

    async loadData() {
        let data = this.fetchLocalStorageData();

        if (!data || Object.keys(data).length === 0) {
            data = await this.fetchApiData();
        }

        return data;
    }

    fetchLocalStorageData() {
        try {
            const jsonData = JSON.parse(localStorage.getItem(this._storageKey));
            return jsonData ? ConverterLib.convertObjectToCamel(jsonData) : {};
        } catch (error) {
            console.error('로컬스토리지 데이터 로드 오류:', error);
            return {};
        }
    }

    async fetchApiData() {
        try {
            const response = await new RequestSender()
                .setUrl(`${SERVER_URL}/user/profile/`)
                .setMethod('GET')
                .send();

            const profileData = response.profile;

            this.saveData(profileData);
            return profileData;
        } catch (error) {
            console.error('API 데이터 로드 오류:', error);
            return {};
        }
    }

    saveData(data) {
        try {
            const convertedData = ConverterLib.convertObjectToSnake(data);
            localStorage.setItem(
                this._storageKey,
                JSON.stringify(convertedData)
            );

            this._username = data.username || '';
            this._isConnected = data.isConnected || false;
            this._apiKey = data.apiKey || '';
            this._binanceUid = data.binanceUid || '';
        } catch (error) {
            console.error('로컬스토리지 데이터 저장 오류:', error);
        }
    }

    getUsername() {
        return this._username;
    }

    isConnected() {
        return Boolean(this._isConnected);
    }

    getApiKey() {
        return this._apiKey;
    }

    getBinanceUid() {
        return Number(this._binanceUid);
    }
}

export default ProfileManager;
