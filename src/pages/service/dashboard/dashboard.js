import './dashboard.css';
import { checkAuthorization } from '@library/CommonLib.js';
import { logout } from '@library/ServiceCommonLib.js';

window.addEventListener('pageshow', async () => {
    const isAllowed = await checkAuthorization();
    if (!isAllowed) {
        alert('접근 권한이 없습니다. 메인 페이지로 이동합니다.');
        window.location.href = '/';
        return;
    }
});

const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async function () {
        const result = await logout();

        if (result) {
            window.location.href = '/';
        } else {
            alert('로그아웃에 실패 했습니다.');
        }
    });
}
