const KEY_LENGTH = 64;

function checkInputValue(event) { // 영문과 숫자가 아닌 문자가 포함되어 있는지 검사 후 빈문자열로 대체
    const inputField = event.target;
    const inputValue = inputField.value;
    const pattern = /[^a-zA-Z0-9]/g; // 영문과 숫자가 아닌지 검사

    if (pattern.test(inputValue)) { // 영문과 숫자가 아닌 문자가 포함되어 있는지 검사
        inputField.value = inputValue.replace(pattern, ''); // 포함되어 있을 경우 빈칸으로 대체
    }
}

function noticeInputField(inputField) { // 입력란의 글자수가 일치하지 않을 경우 안내문구 노출
    const $notice = inputField.closest('.input-block').querySelector('.notice');

    if (inputField.value.length === 0 ||
        inputField.value.length === KEY_LENGTH
    ) {
        $notice.classList.add('hidden');
    } else {
        $notice.classList.remove('hidden');
    }
}

function checkActive(apiKeyInputField, secretKeyInputField, targetBtn) { // api-key 입력란과 secret-key 입력란에 값이 있을 경우 활성화
    if (apiKeyInputField.value.length === KEY_LENGTH &&
        secretKeyInputField.value.length === KEY_LENGTH
    ) {
        targetBtn.classList.add('active');
    } else {
        targetBtn.classList.remove('active');
    }
}

function clearInputField(apiKeyInputField, secretKeyInputField, targetBtn) {
    apiKeyInputField.value = '';
    secretKeyInputField.value = '';

    noticeInputField(apiKeyInputField); // 안내문구 숨기기
    noticeInputField(secretKeyInputField); // 안내문구 숨기기

    targetBtn.classList.remove('active'); // 타겟 버튼 비활성화
}

export {checkInputValue, noticeInputField, checkActive, clearInputField};