import { ConverterLib } from '/src/scripts/libraries/ConverterLib.js';
import { CookieLib } from '/src/scripts/libraries/CookieLib.js';

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

            const url = this.params
                ? `${this.url}?${new URLSearchParams(this.params)}`
                : this.url;

            const response = await fetch(url, {
                method: this.method,
                headers: this.headers,
                body: this.data ? JSON.stringify(this.data) : undefined,
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const responseData = await response.json();
            return ConverterLib.convertObjectToCamel(responseData);
        } catch (error) {
            throw new Error(error.message || 'Request failed');
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
