const CookieLib = {
    getCSRFToken: () => {
        const CSRFToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrftoken="))
            ?.split("=")[1];
        return CSRFToken;
    },
};

export { CookieLib };
