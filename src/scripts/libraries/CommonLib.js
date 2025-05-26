import { SERVER_URL } from '@constant/apiConstant';
import RequestSender from '@library/RequestSender';

const checkAuthorization = async function () {
    const result = await fetchAuthorization();
    return result;
};

const fetchAuthorization = async function () {
    try {
        const response = await new RequestSender().setUrl(`${SERVER_URL}/authz/`).setMethod('GET').send();
        return response.result;
    } catch (error) {
        console.log(error);
        return false;
    }
};

export { checkAuthorization };
