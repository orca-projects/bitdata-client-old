import './join.css';

import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';

const $checkAllCheckBox = document.querySelector('#check-all-checkbox');
const $termsOfServiceCheckBox = document.querySelector(
    '#terms-of-service-checkbox'
);
const $fullTermsOfServiceBtn = document.querySelector('.full-terms-of-service');
const $privacyPolicyCheckbox = document.querySelector(
    '#privacy-policy-checkbox'
);
const $fullPrivacyPolicyBtn = document.querySelector('.full-privacy-policy');
const $ageConfirmationCheckbox = document.querySelector(
    '#age-confirmation-checkbox'
);
const $ageConfirmationNoticeBtn = document.querySelector(
    '.age-confirmation-notice'
);
const $termsOfServiceModal = document.querySelector('.terms-of-service-modal');
const $termsOfServiceModalCloseBtn = document.querySelector(
    '.terms-of-service-modal .close-btn'
);
const $termsOfServiceModalAgreeBtn = document.querySelector(
    '.terms-of-service-modal .agree-btn'
);
const $privacyPolicyModal = document.querySelector('.privacy-policy-modal');
const $privacyPolicyModalCloseBtn = document.querySelector(
    '.privacy-policy-modal .close-btn'
);
const $privacyPolicyeModalAgreeBtn = document.querySelector(
    '.privacy-policy-modal .agree-btn'
);
const $ageConfirmationModal = document.querySelector('.age-confirmation-modal');
const $ageConfirmationModalCloseBtn = document.querySelector(
    '.age-confirmation-modal .close-btn'
);
const $ageConfirmationModalAgreeBtn = document.querySelector(
    '.age-confirmation-modal .agree-btn'
);
const $nextBtn = document.querySelector('.next-btn');

const activeNextBtn = function () {
    if (
        $termsOfServiceCheckBox.checked &&
        $privacyPolicyCheckbox.checked &&
        $ageConfirmationCheckbox.checked
    ) {
        $checkAllCheckBox.checked = true;
        $nextBtn.classList.add('active');
    } else {
        $checkAllCheckBox.checked = false;
        $nextBtn.classList.remove('active');
    }
};

const check = function (checkBox) {
    checkBox.checked = true;
    activeNextBtn();
};

$checkAllCheckBox.addEventListener('click', function () {
    if (!$checkAllCheckBox.checked) {
        $termsOfServiceCheckBox.checked = false;
        $privacyPolicyCheckbox.checked = false;
        $ageConfirmationCheckbox.checked = false;
        $nextBtn.classList.remove('active');
    } else {
        $termsOfServiceCheckBox.checked = true;
        $privacyPolicyCheckbox.checked = true;
        $ageConfirmationCheckbox.checked = true;
        $nextBtn.classList.add('active');
    }
});

$termsOfServiceCheckBox.addEventListener('click', function () {
    activeNextBtn();
});
$fullTermsOfServiceBtn.addEventListener('click', function () {
    $termsOfServiceModal.classList.remove('hidden');
});
$termsOfServiceModalCloseBtn.addEventListener('click', function () {
    $termsOfServiceModal.classList.add('hidden');
});
$termsOfServiceModalAgreeBtn.addEventListener('click', function () {
    $termsOfServiceModal.classList.add('hidden');
    check($termsOfServiceCheckBox);
});

$privacyPolicyCheckbox.addEventListener('click', function () {
    activeNextBtn();
});
$fullPrivacyPolicyBtn.addEventListener('click', function () {
    $privacyPolicyModal.classList.remove('hidden');
});
$privacyPolicyModalCloseBtn.addEventListener('click', function () {
    $privacyPolicyModal.classList.add('hidden');
});
$privacyPolicyeModalAgreeBtn.addEventListener('click', function () {
    $privacyPolicyModal.classList.add('hidden');
    check($privacyPolicyCheckbox);
});

$ageConfirmationCheckbox.addEventListener('click', function () {
    activeNextBtn();
});
$ageConfirmationNoticeBtn.addEventListener('click', function () {
    $ageConfirmationModal.classList.remove('hidden');
});
$ageConfirmationModalCloseBtn.addEventListener('click', function () {
    $ageConfirmationModal.classList.add('hidden');
});
$ageConfirmationModalAgreeBtn.addEventListener('click', function () {
    $ageConfirmationModal.classList.add('hidden');
    check($ageConfirmationCheckbox);
});

const join = async () => {
    try {
        await new RequestSender()
            .setUrl(`${SERVER_URL}/authn/join/`)
            .setMethod('get')
            .send();

        window.location.href = 'onboarding';
    } catch (error) {
        console.error(
            'Callback Error:',
            error.message || 'Internal Server Error'
        );
        alert(error.message || 'An error occurred. Please try again.');
    }
};

$nextBtn.addEventListener('click', async () => {
    if ($nextBtn.classList.contains('active')) {
        await join();
    }
});
