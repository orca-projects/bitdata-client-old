import './styles/setting.css';
import { checkAuthorization } from '@library/CommonLib.js';
import { logout } from '@library/ServiceCommonLib.js';

import { checkInputValue, noticeInputField, checkActive, clearInputField } from '/src/components/key-input-field.js';

import { maskingShowBtn } from '/src/components/eye-button.js';

import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';
import ProfileManager from '@manager/ProfileManager';

window.addEventListener('pageshow', async () => {
    await checkAuthorization('API_KEY');
});

const profileManager = new ProfileManager();

const initializeProfile = async () => {
    await profileManager.init();

    const $username = document.getElementById('profile-username');
    const $state = document.getElementById('profile-state');
    const $binanceApiKey = document.getElementById('profile-api-key');
    const $binanceUid = document.getElementById('profile-binance-uid');
    const $tooltipDefault = document.querySelector('.tooltipDefault');
    const $tooltipApiKey = document.querySelector('.api-key-info');
    const $tooltipSecretKey = document.querySelector('.secret-key-info');

    $username.innerHTML = profileManager.getUsername();

    if (profileManager.isConnected()) {

        $state.classList.add('success');
        $state.classList.remove('fail');
        $state.innerHTML = '바이낸스 계정 정상 연동';
        $binanceApiKey.innerHTML = profileManager.getApiKey();
        $binanceUid.innerHTML = profileManager.getBinanceUid();
        $tooltipDefault.classList.add('hidden');
        $tooltipApiKey.classList.remove('hidden');
        $tooltipSecretKey.classList.remove('hidden');
    }
    else if (!profileManager.getApiKey() && !profileManager.getBinanceUid()) {

        $state.classList.add('fail');
        $state.classList.remove('success');
        $state.innerHTML = '바이낸스 계정 연동 상태 확인 필요';

        $binanceApiKey.innerHTML = '';  
        $binanceUid.innerHTML = '';

        $tooltipDefault.classList.remove('hidden');
        $tooltipApiKey.classList.add('hidden');      
        $tooltipSecretKey.classList.add('hidden'); 
    }
    else {
        $state.classList.add('fail');
        $state.classList.remove('success');
        $state.innerHTML = '바이낸스 계정 연동 상태 확인 필요';
        $binanceApiKey.innerHTML = profileManager.getApiKey();
        $binanceUid.innerHTML = profileManager.getBinanceUid();
        $tooltipDefault.classList.add('hidden');
        $tooltipApiKey.classList.remove('hidden');
        $tooltipSecretKey.classList.remove('hidden');
    }
};

// 실행
initializeProfile();

const $relinkBtn = document.querySelector('.relink-btn'); // [연동 재시도] 버튼
const $settingBtn = document.querySelector('.setting-btn'); // [설정하기] 버튼

const $loadingModal = document.querySelector('.loading'); // 로딩 화면

const $binanceSettingModal = document.querySelector('.binance-setting'); // 바이낸스 계정 연동 모달
const $binanceSettingModalCloseBtn = document.querySelector('.binance-setting .close-btn'); // [닫기] 버튼
const $binanceSettingModalApifrm = document.querySelector('#api-management-frm'); // api 관리 폼
const $binanceSettingModalApiKeyInputField = document.querySelector('#api-key'); // api key 입력란
const $binanceSettingModalSecretKeyInputField = document.querySelector('#secret-key'); // secret key 입력란
const $binanceSettingModalSecretKeyInputFieldEyeBtn = document.querySelector('.eye'); // [보기/숨기기] 버튼
const $binanceSettingModalSettingBtn = document.querySelector('.save-btn'); // [설정] 버튼

$relinkBtn.addEventListener('click', relink);

$settingBtn.addEventListener('click', openBinanceModal);

$binanceSettingModalCloseBtn.addEventListener('click', closeBinanceModeal);

$binanceSettingModalApiKeyInputField.addEventListener('input', (event) => {
    // api-key 입력란 값 입력시
    checkInputValue(event); // 영문과 숫자가 아닌 문자가 포함되어 있는지 검사 후 빈문자열로 대체
    noticeInputField($binanceSettingModalApiKeyInputField);
    checkActive(
        // api-key 입력란과 secret-key 입력란에 값이 있을 경우 활성화
        $binanceSettingModalApiKeyInputField,
        $binanceSettingModalSecretKeyInputField,
        $binanceSettingModalSettingBtn
    );
});

$binanceSettingModalSecretKeyInputField.addEventListener('input', (event) => {
    // secret-key 입력란 값 입력시
    checkInputValue(event); // 영문과 숫자가 아닌 문자가 포함되어 있는지 검사 후 빈문자열로 대체
    noticeInputField($binanceSettingModalSecretKeyInputField);
    checkActive(
        // api-key 입력란과 secret-key 입력란에 값이 있을 경우 활성화
        $binanceSettingModalApiKeyInputField,
        $binanceSettingModalSecretKeyInputField,
        $binanceSettingModalSettingBtn
    );
});

$binanceSettingModalSecretKeyInputFieldEyeBtn.addEventListener('mousedown', () => {
    // [보기/숨기기] 버튼 마스킹
    maskingShowBtn($binanceSettingModalSecretKeyInputField, $binanceSettingModalSecretKeyInputFieldEyeBtn);
});

$binanceSettingModalSettingBtn.addEventListener('click', (evnet) => {
    if (!$binanceSettingModalSettingBtn.classList.contains('active')) {
        // 설정 버튼 비활성화시 제출 방지
        evnet.preventDefault();
    }
});

$binanceSettingModalApifrm.addEventListener('submit', async (event) => {
    event.preventDefault(); // 기존 제출 동작 비활성화
    await spendApiKey();
    closeBinanceModeal();
    await relink();
});

async function relink() {
    $loadingModal.classList.remove('hidden');
    await collectHistory();
    relinkResult();
}

function relinkResult() {
    $loadingModal.classList.add('hidden');
    initializeProfile();
}

function openBinanceModal() {
    // 바이낸스 계정 연동 모달 열기
    document.body.style.overflow = 'hidden'; // 뒷 배경 스크롤 방지
    $binanceSettingModal.classList.remove('hidden');
}

function closeBinanceModeal() {
    // 바이낸스 계정 연동 모달 닫기
    document.body.style.overflow = 'auto'; // 뒷 배경 스크롤 가능
    $binanceSettingModal.classList.add('hidden');
    clearInputField(
        // 모달 초기화
        $binanceSettingModalApiKeyInputField,
        $binanceSettingModalSecretKeyInputField,
        $binanceSettingModalSettingBtn
    );
}

async function spendApiKey() {
    const apiKey = document.querySelector('#api-key').value.trim();
    const secretKey = document.querySelector('#secret-key').value.trim();

    try {
        await new RequestSender()
            .setUrl(`${SERVER_URL}/user/binance-key/`)
            .setMethod('POST')
            .setData({
                apiKey: apiKey,
                secretKey: secretKey,
            })
            .send();
    } catch (error) {
        console.error('Callback Error:', error.message || 'Internal Server Error');
        alert(error.message || 'An error occurred. Please try again.');
    }
}

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

function collectionSuccess() {}

async function collectionFail() {
    const $connectedFail = document.querySelector('.modal.connected-fail');

    $connectedFail.classList.remove('hidden');

    await new Promise((resolve) => setTimeout(resolve, 3000));

    $connectedFail.classList.add('hidden');
}

// 로그아웃
const logoutBtn = document.querySelector('.logout-btn');

logoutBtn.addEventListener('click', async function () {
    const result = await logout();

    if (result) {
        window.location.href = '/';
    } else {
        alert('로그아웃에 실패 했습니다.');
    }
});
