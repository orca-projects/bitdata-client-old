import './collect.css';

import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';
import ProfileManager from '@manager/ProfileManager';

document.addEventListener('DOMContentLoaded', collectHistory);

async function collectHistory() {
    try {
        const request = new RequestSender()
            .setUrl(`${SERVER_URL}/user/collect/`)
            .setMethod('GET')
            .send();

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
    const $statusImage = document.querySelector('.status-image');
    const $statusText = document.querySelector('.status');
    const $noticeText = document.querySelector('.notice');

    if ($statusImage) {
        $statusImage.innerHTML = `<img src="/assets/images/notice_icon.png" alt="Warning Icon">`;
    }

    if ($statusText) {
        $statusText.innerHTML = `데이터 수집 불가`;
        $statusText.classList.add('fail');
    }

    if ($noticeText) {
        $noticeText.innerHTML = `바이낸스 계정 연동 상태를 확인해주세요!`;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));

    window.location.href = '/setting';
}
