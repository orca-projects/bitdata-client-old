import { SERVER_URL } from '@constant/apiConstant';

const checkAuthorization = async () => {
    try {
        const response = await fetchAuthorization();
        if (response.ok) {
            return;
        }

        const data = await response.json();
        const state = data.state;

        switch (state) {
            case 'ALLOWED':
                return;

            case 'NEED_API_KEY':
                alert('API 키가 등록되어 있지 않습니다. 키 등록 페이지로 이동합니다.');
                window.location.href = '/onboarding';
                return;

            case 'UNAUTHORIZED':
            default:
                alert('접근 권한이 없습니다. 메인 페이지로 이동합니다.');
                window.location.href = '/';
        }
    } catch (error) {
        alert('인증 과정에서 문제가 발생했습니다. 메인 페이지로 이동합니다.');
        window.location.href = '/';
    }
};

const fetchAuthorization = async () => {
    try {
        const response = await fetch(`${SERVER_URL}/authz/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response;
    } catch (error) {
        return error;
    }
};

export { checkAuthorization };
