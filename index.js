import './index.css';

const $scrollSection = document.querySelector('.scroll-section');
const $scrollSectionItems = document.querySelectorAll('.scroll-section .section-item');
const $paginationBtn = document.querySelectorAll('.pagination button');

let curSectionIndex = 0;
let isPlayAnimation = false;
const animationPlayTime = 2000;

function scrollEvent(e) {
    stopScroll(e);
    if (!isPlayAnimation) {
        if (e.deltaY < 0 && curSectionIndex - 1 >= 0) {
            scrollAnimationStart(() => scrollToIndex(curSectionIndex - 1));
        } else if (e.deltaY > 0 && curSectionIndex + 1 < $scrollSectionItems.length) {
            scrollAnimationStart(() => scrollToIndex(curSectionIndex + 1));
        }
    }
}

function stopScroll(e) {
    e.preventDefault();
}

function scrollAnimationStart(animation) {
    isPlayAnimation = true;
    setTimeout(() => {
        isPlayAnimation = false;
    }, animationPlayTime);
    animation();
    updatePaginationBtn();
}

function scrollToIndex(index) {
    curSectionIndex = index;
    const $screenHeight = window.innerHeight;
    $scrollSection.style.transform = `translateY(-${$screenHeight * index}px)`;
}

function updatePaginationBtn() {
    for (const btn of $paginationBtn) {
        btn.classList.remove('active');
    }
    $paginationBtn[curSectionIndex].classList.add('active');
}

function clickPaginationBtn(index) {
    if (index !== curSectionIndex) {
        scrollAnimationStart(() => scrollToIndex(index));
    }
}

window.addEventListener('wheel', scrollEvent, { passive: false });

updatePaginationBtn();

for (let index = 0; index < $paginationBtn.length; index++) {
    $paginationBtn[index].addEventListener('click', () => {
        clickPaginationBtn(index);
    });
}

import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';

const loginBtns = document.querySelectorAll('.login-join button');

for (const loginBtn of loginBtns) {
    loginBtn.addEventListener('click', async () => {
        const response = await fetchIsLogin();
        const isLogin = response.isLogin;
        const isConnected = response.isConnected;

        if (isLogin) {
            if (isConnected) {
                window.location.href = '/history';
            } else {
                window.location.href = '/setting';
            }
        } else {
            window.location.href = '/login';
        }
    });
}

const fetchIsLogin = async () => {
    try {
        const response = await new RequestSender().setUrl(`${SERVER_URL}/authn/login/state/`).setMethod('get').send();
        return response;
    } catch (error) {
        return {state: 'success', isLogin: false, isConnected: false};
    }
};
