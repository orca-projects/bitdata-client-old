import './styles/faq.css';

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

// $exitModalExitReason.addEventListener('input', inputExitReason);

$exitModalSubmitBtn.addEventListener('click', (event) => {
    if (!$exitModalSubmitBtn.classList.contains('active')) {
        event.preventDefault();
    }
});

$exitModalFrm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitEixt();
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

function submitEixt() {
    window.location.href = '/exit';
}
