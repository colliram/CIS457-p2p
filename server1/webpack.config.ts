import { Configuration } from 'webpack'
import * as webpackNodeExternals from 'webpack-node-externals'
import * as path from 'path'

const config: Configuration = {
    mode: 'development',
    entry: path.join(__dirname, 'src/index.ts'),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    target: 'node',
    externals: [ webpackNodeExternals() ],
    resolve: {
        extensions: ['.ts']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader'
                }
            }
        ]
    }
}

export default [
    config
]