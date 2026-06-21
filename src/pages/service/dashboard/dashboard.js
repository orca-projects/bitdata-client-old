import { checkAuthorization } from '/src/scripts/libraries/CommonLib.js';
import { logout } from '/src/scripts/libraries/ServiceCommonLib.js';

window.addEventListener('pageshow', async () => {
    await checkAuthorization('LOGIN');
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
