function maskingShowBtn(inputField, eyeBtn) { // [보기/숨기기] 버튼 눌렸을 때
    inputField.type = 'text';
    eyeBtn.classList.add('private');

    document.addEventListener('mouseup', () => {
        inputField.type = 'password';
        eyeBtn.classList.remove('private');
    }, {once: true});
}

export {maskingShowBtn};