module.exports = {
    apps: [
        {
            name: 'bitdata',
            script: './app.js',
            watch: true,
            env_development: {
                NODE_ENV: 'development',
                PORT: 3000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 8000,
            },
        },
    ],
};
