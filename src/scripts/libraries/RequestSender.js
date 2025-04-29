import axios from 'axios';
import { ConverterLib } from '@library/ConverterLib';
import { CookieLib } from '@library/CookieLib';

class RequestSender {
    constructor() {
        this.url = '';
        this.method = 'GET';
        this.headers = {
            'Content-Type': 'application/json',
        };
        this.params = null;
        this.data = null;
    }

    setUrl(url) {
        this.url = url;
        return this;
    }

    setMethod(method) {
        this.method = method.toUpperCase();
        return this;
    }

    setHeaders(headers) {
        this.headers = { ...this.headers, ...headers };
        return this;
    }

    setParams(params) {
        this.params = params;
        return this;
    }

    setData(data) {
        this.data = data;
        return this;
    }

    async send() {
        try {
            await this.requestSetup();

            const response = await axios({
                url: this.url,
                method: this.method,
                headers: this.headers,
                params: this.params,
                data: this.data,
                withCredentials: true,
            });

            const convertedResponse = ConverterLib.convertObjectToCamel(response.data);

            if (convertedResponse.state !== 'success') {
                throw new Error(convertedResponse.message);
            }

            return convertedResponse;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Request failed');
        }
    }

    async requestSetup() {
        if (this.isPost()) {
            await this.setHeadersCsrfToken();

            this.data = this.data ? ConverterLib.convertObjectToSnake(this.data) : undefined;
        } else {
            this.params = this.params ? ConverterLib.convertObjectToSnake(this.params) : undefined;
        }
    }

    isPost() {
        return this.method === 'POST';
    }

    async setHeadersCsrfToken() {
        this.setHeaders({ 'X-CSRFToken': await CookieLib.getCSRFToken() });
    }
}

export default RequestSender;
