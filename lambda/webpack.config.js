module.exports = {
    entry: "./app.js",
    output: {
                path: "./",
                library: "[name]",
                libraryTarget: "commonjs2",
                filename: "index.js"
            },
    target: "node",
    module: {
        loaders: [
        {
            test: /\.js$/,
            loader: 'babel',
            query: {
                presets: ['es2015'],
                plugins: ['syntax-flow', 'transform-flow-strip-types']
            }
        },
        {
            test: /\.json$/,
            loader: 'json'
        }
        ]
    }
};
