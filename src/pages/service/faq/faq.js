import './styles/faq.css';

import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';

import { checkAuthorization } from '@library/CommonLib.js';
import { logout } from '@library/ServiceCommonLib.js';

window.addEventListener('pageshow', async () => {
    await checkAuthorization('API_KEY');
});

const $faqs = document.querySelectorAll('.faq');
const $exitBtn = document.querySelector('.exit-btn');

const $exitModal = document.querySelector('.exit');
const $exitModalCloseBtn = document.querySelector('.exit .close-btn');
const $exitModalFrm = document.querySelector('.exit .exit-reason-frm');
const $exitModalExitReason = document.querySelector('#exit-reason');
const $exitModalSubmitBtn = document.querySelector('.exit .submit-exit-btn');

for (const faq of $faqs) {
    const $expandArrowBtn = faq.querySelector('.expand-arrow-btn');

    $expandArrowBtn.addEventListener('click', expandAnswer);
}

$exitBtn.addEventListener('click', openExitModal);

$exitModalCloseBtn.addEventListener('click', closeExitModal);

$exitModalExitReason.addEventListener('input', inputExitReason);

$exitModalSubmitBtn.addEventListener('click', (event) => {
    if (!$exitModalSubmitBtn.classList.contains('active')) {
        event.preventDefault();
    }
});

$exitModalFrm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const result = await submitEixt();

    if (!result) {
        return;
    }

    window.location.href = '/exit';
});

function expandAnswer() {
    const $expandArrowBtnImg = this.querySelector('img');
    const $answerBlock = this.closest('.faq').querySelector('.answer-block');

    $expandArrowBtnImg.src = '/assets/images/button/triangle-up.png';
    $answerBlock.classList.remove('hidden');

    this.removeEventListener('click', expandAnswer);
    this.addEventListener('click', collapseAnswer);
}

function collapseAnswer() {
    const $expandArrowBtnImg = this.querySelector('img');
    const $answerBlock = this.closest('.faq').querySelector('.answer-block');

    $expandArrowBtnImg.src = '/assets/images/button/triangle-down.png';
    $answerBlock.classList.add('hidden');

    this.removeEventListener('click', collapseAnswer);
    this.addEventListener('click', expandAnswer);
}

function openExitModal() {
    document.body.style.overflow = 'hidden';
    $exitModal.classList.remove('hidden');
}

function closeExitModal() {
    document.body.style.overflow = 'auto';
    $exitModal.classList.add('hidden');

    $exitModalExitReason.value = '';
    $exitModalSubmitBtn.classList.remove('active');
}

function inputExitReason() {
    if ($exitModalExitReason.value == '') {
        $exitModalSubmitBtn.classList.remove('active');
    } else {
        $exitModalSubmitBtn.classList.add('active');
    }
}

async function submitEixt() {
    const withdrawReason = $exitModalExitReason.value;

    try {
        const response = await new RequestSender()
            .setUrl(`${SERVER_URL}/user/withdraw/`)
            .setMethod('POST')
            .setData({
                withdrawReason: withdrawReason,
            })
            .send();

        const result = response.result;

        return result;
    } catch (error) {
        console.error(error);
        return false;
    }
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
