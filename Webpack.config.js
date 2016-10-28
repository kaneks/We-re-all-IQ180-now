/**
 * Created by Kaneks on 10/28/2016 AD.
 */
var config = {
    entry: './public/js/MyReactScript.js',

    output: {
        path:'./public/js',
        filename: 'bundle.js',
    },
    
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',

                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    }
}

module.exports = config;