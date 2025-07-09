import { SERVER_URL } from '@constant/apiConstant';

const checkAuthorization = async (type) => {
    try {
        const url = getAuthorizationUrl(type);
        const response = await fetchAuthorization(url);

        if (!response.ok) {
            throw new Error('Invalid response');
        }

        const data = await response.json();
        const state = data.state;

        switch (state) {
            case 'ALLOWED':
                return;

            case 'NEED_API_KEY':
                alert('API 키가 등록되어 있지 않습니다. 키 등록 페이지로 이동합니다.');
                window.location.href = '/onboarding';
                break;

            case 'UNAUTHORIZED':
            default:
                alert('접근 권한이 없습니다. 로그인 페이지로 이동합니다.');
                window.location.href = '/login';
        }
    } catch (error) {
        alert('인증 과정에서 문제가 발생했습니다. 로그인 페이지로 이동합니다.');
        window.location.href = '/login';
    }
};

const getAuthorizationUrl = (type) => {
    let path = '/authz';

    switch (type) {
        case 'KAKAO_LOGIN':
            path += '/kakao/';
            break;

        case 'LOGIN':
            path += '/login/';
            break;

        case 'API_KEY':
            path += '/api-key/';
            break;

        default:
            throw new Error(`Unknown authorization type: ${type}`);
    }

    return SERVER_URL + path;
};

const fetchAuthorization = async (url) => {
    return await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export { checkAuthorization };
