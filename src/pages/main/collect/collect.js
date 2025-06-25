import './collect.css';

import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';
import ProfileManager from '@manager/ProfileManager';

document.addEventListener('DOMContentLoaded', collectHistory);

async function collectHistory() {
    try {
        const request = new RequestSender().setUrl(`${SERVER_URL}/user/collect/`).setMethod('GET').send();

        const timeout = new Promise((resolve) => setTimeout(resolve, 3000));

        const [response] = await Promise.all([request, timeout]);

        const profileData = response.profile;

        const profileManager = new ProfileManager();
        profileManager.saveData(profileData);

        if (profileManager.isConnected()) {
            collectionSuccess();
        } else {
            collectionFail();
        }
    } catch (error) {
        console.error('Error:', error.message);
        collectionFail();
    }
}

function collectionSuccess() {
    window.location.href = '/history';
}

async function collectionFail() {
    const collectLoading = document.querySelector('.collect.loading');
    const collectFail = document.querySelector('.collect.fail');

    collectLoading.classList.add('hidden');
    collectFail.classList.remove('hidden');

    await new Promise((resolve) => setTimeout(resolve, 3000));

    window.location.href = '/setting';
}
