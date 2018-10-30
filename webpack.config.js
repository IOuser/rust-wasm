const path = require('path')
const WriteAssetsWebpackPlugin = require('write-assets-webpack-plugin');

module.exports = {
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        compress: true,
        port: 9000,
    },
    entry: './src/main',
    mode: 'development',
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.wasm', '.mjs', '.js', '.jsx', '.json'],
        alias: {
            'rust-lib': path.join(__dirname, './src/lib.rs'),
            'rust-mem': path.join(__dirname, './target/wasm32-unknown-unknown/release/rust_wasm_tests_bg'),
        }
    },
    output: {
        path: path.resolve(__dirname, './public/code'),
        filename: 'bundle.js',
    },
    module: {
        strictExportPresence: true,
        rules: [
            {
                test: /\.glsl$/,
                use: 'raw-loader',
            },
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                },
            },
            // TODO: Add worker loader static config
            // {
            //     test: /\.worker\.ts$/,
            //     use: [
            //         { loader: 'worker-loader' },
            //     ],
            // },
            {
                test: /\.rs$/,
                use: {
                    loader: 'rust-native-wasm-loader',
                    options: {
                        release: true,
                        gc: true,
                        wasmBindgen: {
                            // nodejs: true,
                            // wasm2es6js: true,
                            typescript: true,
                        },
                    },
                }
            }
        ]
    },
    plugins: [
        new WriteAssetsWebpackPlugin()
    ],
}
