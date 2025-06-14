import './index.css';

const $scrollSection = document.querySelector('.scroll-section');
const $scrollSectionItems = document.querySelectorAll('.scroll-section .section-item');
const $paginationBtn = document.querySelectorAll('.pagination button');

let curSectionIndex = 0;
let isPlayAnimation = false;
const animationPlayTime = 2000;

let touchStartY = 0;

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

function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;

    if (!isPlayAnimation) {
        if (deltaY > 30 && curSectionIndex + 1 < $scrollSectionItems.length) {
            scrollAnimationStart(() => scrollToIndex(curSectionIndex + 1));
        } else if (deltaY < -30 && curSectionIndex - 1 >= 0) {
            scrollAnimationStart(() => scrollToIndex(curSectionIndex - 1));
        }
    }
}

window.addEventListener('wheel', scrollEvent, { passive: false });
window.addEventListener('touchstart', handleTouchStart, { passive: false });
window.addEventListener('touchend', handleTouchEnd, { passive: false });

updatePaginationBtn();

for (let index = 0; index < $paginationBtn.length; index++) {
    $paginationBtn[index].addEventListener('click', () => {
        clickPaginationBtn(index);
    });
}
