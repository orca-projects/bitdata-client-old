import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';

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
