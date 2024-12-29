const ConverterLib = {
    convertSnakeToCamel: (str) =>
        str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase()),

    convertCamelToSnake: (str) =>
        str.replace(/([A-Z])/g, (match) => "_" + match.toLowerCase()),

    convertObjectToCamel: function (json) {
        if (typeof json !== "object" || json === null) {
            throw new Error("Input must be a non-null object");
        }

        if (Array.isArray(json)) {
            return json.map((item) => this.convertObjectToCamel(item));
        }

        const converted = {};
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const newKey = this.convertSnakeToCamel(key);
                const value = json[key];

                if (typeof value === "object" && value !== null) {
                    converted[newKey] = this.convertObjectToCamel(value);
                } else {
                    converted[newKey] = value;
                }
            }
        }

        return converted;
    },

    convertObjectToSnake: function (json) {
        if (typeof json !== "object" || json === null) {
            throw new Error("Input must be a non-null object");
        }

        if (Array.isArray(json)) {
            return json.map((item) => this.convertObjectToSnake(item));
        }

        const converted = {};
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const newKey = this.convertCamelToSnake(key);
                const value = json[key];

                if (typeof value === "object" && value !== null) {
                    converted[newKey] = this.convertObjectToSnake(value);
                } else {
                    converted[newKey] = value;
                }
            }
        }

        return converted;
    },
};

export { ConverterLib };
