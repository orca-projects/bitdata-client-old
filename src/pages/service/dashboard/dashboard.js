import './dashboard.css';
import { checkAuthorization } from '@library/CommonLib.js';
import { logout } from '@library/ServiceCommonLib.js';
import { checkNextStep } from '@library/ServiceCommonLib';


window.addEventListener('pageshow', async () => {
    await checkAuthorization('API_KEY');

    const nextStep = await checkNextStep();


    switch (nextStep) {
        case 'onboarding':
            window.location.href = '/onboarding';
            return;
        case 'setting':
            window.location.href = '/setting';
            return;
        case 'collect':
        default:
            break;
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
