import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';

const callback = async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
            throw new Error('Authorization code is missing');
        }
        if (!state) {
            throw new Error('Authorization state is missing');
        }

        const response = await new RequestSender().setUrl(`${SERVER_URL}/authn/login/kakao/callback/`).setMethod('post').setData({ code, state }).send();

        const redirectUrl = getRedirectByMemberState(response);
        window.location.href = redirectUrl;
    } catch (error) {
        console.error('Callback Error:', error.message || 'Internal Server Error');
        alert(error.message || 'An error occurred. Please try again.');
    }
};

const getRedirectByMemberState = (response) => {
    if (!response.isMember) {
        return '/join';
    }

    return '/collect';
};

callback();
