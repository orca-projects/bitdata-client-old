import './login.css';

import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';

const login = async () => {
    try {
        const response = await new RequestSender()
            .setUrl(`${SERVER_URL}/authn/login/kakao/`)
            .setMethod('get')
            .send();

        window.location.href = response.loginUrl;
    } catch (error) {
        console.error(
            'Login failed:',
            error.message || 'Internal Server Error'
        );
        alert(error.message || 'An error occurred. Please try again later.');
    }
};

const $kakaoLoginBtn = document.querySelector('.kakao-login-btn');
$kakaoLoginBtn.addEventListener('click', login);
