import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';

const checkNextStep = async () => {
    try {
        const response = await fetch(`${SERVER_URL}/authn/next-step/`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to fetch next step');

        const data = await response.json();
        return data.data.next_step;
    } catch (error) {
        console.error('next-step API 에러:', error.message);
        return 'collect'; // 기본값
    }
};


const logout = async function () {
    const result = await fetchLogout();
    return result;
};

const fetchLogout = async function () {
    try {
        const response = await new RequestSender().setUrl(`${SERVER_URL}/authn/logout`).setMethod('GET').send();
        return response.result;
    } catch (error) {
        return false;
    }
};

export { logout };
export { checkNextStep };
