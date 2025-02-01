import './onboarding.css';

import {
    checkInputValue,
    noticeInputField,
    checkActive,
} from '/src/components/key-input-field.js';
import { maskingShowBtn } from '/src/components/eye-button.js';

import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';

const $apiManagementFrm = document.querySelector('#api-management-frm'); // API Management 폼
const $apiKeyInputField = document.querySelector('#api-key'); // api-key 입력란
const $secretKeyInputField = document.querySelector('#secret-key'); // secret-key 입력란
const $secretKeyInputFieldEyeBtn = document.querySelector('.eye'); // [보기/숨기기] 버튼
const $startBtn = document.querySelector('.start-btn'); // [시작하기] 버튼

$apiKeyInputField.addEventListener('input', (event) => {
    // api-key 입력란 값 입력시
    checkInputValue(event); // 영문과 숫자가 아닌 문자가 포함되어 있는지 검사 후 빈문자열로 대체
    noticeInputField($apiKeyInputField);
    checkActive($apiKeyInputField, $secretKeyInputField, $startBtn); // api-key 입력란과 secret-key 입력란에 값이 있을 경우 활성화
});

$secretKeyInputField.addEventListener('input', (event) => {
    // secret-key 입력란 값 입력시
    checkInputValue(event); // 영문과 숫자가 아닌 문자가 포함되어 있는지 검사 후 빈문자열로 대체
    noticeInputField($secretKeyInputField);
    checkActive($apiKeyInputField, $secretKeyInputField, $startBtn); // api-key 입력란과 secret-key 입력란에 값이 있을 경우 활성화
});

$secretKeyInputFieldEyeBtn.addEventListener('mousedown', () => {
    // [보기/숨기기] 버튼 마스킹
    maskingShowBtn($secretKeyInputField, $secretKeyInputFieldEyeBtn);
});

// [시작하기] 버튼
$startBtn.addEventListener('click', (event) => {
    // 활성화 상태가 아니라면 제출하지 않음
    if (!$startBtn.classList.contains('active')) {
        event.preventDefault();
    }
});

// API Management 폼 이벤트 제출 이벤트
$apiManagementFrm.addEventListener('submit', async (event) => {
    event.preventDefault(); // 기존 제출 동작 비활성화
    await spendApiKey();
});

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

        window.location.href = '/collect';
    } catch (error) {
        console.error(
            'Callback Error:',
            error.message || 'Internal Server Error'
        );
        alert(error.message || 'An error occurred. Please try again.');
    }
}
