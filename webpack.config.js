const path = require('path')
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = {
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        compress: true,
        // open: true,
        // openPage: 'index.html',
        port: 9000,
    },
    entry: './src/main.js',
    mode: 'development',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, './public/code'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.rs$/,
                use: [
                    {
                        loader: 'wasm-loader',
                    },
                    {
                        loader: 'rust-native-wasm-loader',
                        options: {
                            gc: true,
                            release: true,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new WriteFilePlugin(),
    ],
}
