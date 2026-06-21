import { SERVER_URL } from '/src/scripts/constants/apiConstant.js';
import RequestSender from '/src/scripts/libraries/RequestSender.js';

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
