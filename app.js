import express from "express";
import session from "express-session";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

const app = express();

const PORT = process.env.PORT || 3000;
const SERVER_URL = "http://localhost:1234";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "dist")));
app.use(express.json()); // 항상 라우트 전에 선언
app.use(
    session({
        secret: "my_secret_key",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

app.get("/login/kakao", async (req, res) => {
    try {
        const response = await new RequestSender()
            .setUrl(`${SERVER_URL}/auths/login/kakao/`)
            .setMethod("GET")
            .send();

        return res.redirect(response.loginUrl);
    } catch (error) {
        return res.status(500).send(error);
    }
});

app.get("/login/kakao/auths/callback", async (req, res) => {
    const request = req.query;
    const code = request.code;
    const state = request.state;

    if (!code) {
        return res.status(400).send("Authorization code is missing");
    } else if (!state) {
        return res.status(400).send("Authorization state is missing");
    }

    try {
        const response = await new RequestSender()
            .setUrl(`${SERVER_URL}/auths/login/kakao/callback/`)
            .setMethod("POST")
            .setData({
                code,
                state,
            })
            .send();

        req.session.sessionKey = response.sessionKey;

        const redirectUrl = getRedirectByMemberState(response);
        return res.redirect(redirectUrl);
    } catch (error) {
        return res.status(500).send(error);
    }
});

function getRedirectByMemberState(response) {
    if (!response.isMember) {
        // 비회원
        return "/join";
    }
    if (!response.hasBinanceKey) {
        // 회원 > 바이낸스 키 없음
        return "/onboarding";
    }
    if (response.hasBinanceKey) {
        // 회원 > 바이낸스 키 있음
        return "/collect";
    }

    throw new Error("Unexpected member state in response");
}

app.get("/join/kakao", async (req, res) => {
    try {
        const response = await new RequestSender()
            .setUrl(`${SERVER_URL}/auths/login/kakao/consent/`)
            .setMethod("POST")
            .setSessionKey(getSessionKey(req))
            .send();

        return res.redirect("/onboarding");
    } catch (error) {
        return res.status(500).send(error.message || "Internal Server Error");
    }
});

app.post("/onboarding/keys/save", async (req, res) => {
    const apiKey = req.body.apiKey;
    const secretKey = req.body.secretKey;

    if (!apiKey) {
        return res.status(500).send("API key is null");
    }

    if (!secretKey) {
        return res.status(500).send("Secret key is null");
    }

    try {
        const response = await new RequestSender()
            .setUrl(`${SERVER_URL}/auths/onboarding/keys/save/`) // URL 설정 추가
            .setMethod("POST")
            .setSessionKey(getSessionKey(req))
            .setData({
                apiKey: apiKey,
                secretKey: secretKey,
            })
            .send();

        return res.redirect("/collect");
    } catch (error) {
        return res.status(500).send(error.message || "Internal Server Error");
    }
});

app.get("/*", (req, res) => {
    const fileName = req.params[0] ? req.params[0] : "index";
    res.sendFile(path.join(__dirname, "dist", `${fileName}.html`));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

// TODO: common js 스크립트 분리 필요
// common js
class RequestSender {
    constructor() {
        this.url = "";
        this.method = "";
        this.headers = {
            "Content-Type": "application/json",
        };
        this.data = null;
        this.sessionKey = null;
    }

    setUrl(url) {
        this.url = url;
        return this;
    }

    setMethod(method) {
        this.method = method;
        return this;
    }

    setHeaders(headers) {
        this.headers = { ...this.headers, ...headers };
        return this;
    }

    setData(data) {
        this.data = data;
        return this;
    }

    setSessionKey(sessionKey) {
        this.sessionKey = sessionKey;
        return this;
    }

    async send() {
        try {
            const requestData = this.sessionKey
                ? { ...this.data, session_key: this.sessionKey }
                : this.data;

            const convertedData = requestData && convertJson(requestData, "camelToSnake");

            const response = await axios({
                url: this.url,
                method: this.method,
                headers: this.headers,
                data: convertedData,
            });

            return convertJson(response.data, "snakeToCamel");
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                    error.message ||
                    "Request failed"
            );
        }
    }
}

function getSessionKey(req) {
    const sessionKey = req.session?.sessionKey;

    if (!sessionKey) {
        throw new Error("Session is missing");
    }

    return sessionKey;
}

function convertSnakeToCamel(str) {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

function convertCamelToSnake(str) {
    return str.replace(/([A-Z])/g, (match) => "_" + match.toLowerCase());
}

function convertJson(json, type) {
    if (typeof json !== "object" || json === null) {
        throw new Error("Input must be a non-null object");
    }

    const types = {
        camelToSnake: convertCamelToSnake,
        snakeToCamel: convertSnakeToCamel,
    };

    if (!types.hasOwnProperty(type)) {
        throw new Error(
            `Invalid type: "${type}". Supported types are: ${Object.keys(
                types
            ).join(", ")}`
        );
    }

    const convertKey = types[type];

    if (Array.isArray(json)) {
        return json.map((item) => convertJson(item, type));
    }

    const converted = {};
    for (const key in json) {
        if (Object.prototype.hasOwnProperty.call(json, key)) {
            const newKey = convertKey(key);
            const value = json[key];

            if (typeof value === "object" && value !== null) {
                converted[newKey] = convertJson(value, type);
            } else {
                converted[newKey] = value;
            }
        }
    }

    return converted;
}
