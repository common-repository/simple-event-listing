var path = require( 'path' );
var webpack = require( 'webpack' );
var NODE_ENV = process.env.NODE_ENV || 'development';
var ExtractTextPlugin = require( 'extract-text-webpack-plugin' );


// This file is written in ES5 because it is run via Node.js and is not transpiled by babel. We want to support various versions of node, so it is best to not use any ES6 features even if newer versions support ES6 features out of the box.
var webpackConfig = {

	// Entry points point to the javascript module that is used to generate the script file.
	// The key is used as the name of the script.
	entry: {
		admin: './src/admin.js'
	},
	output: {
		path: path.join( __dirname, 'build' ),
		filename: "[name].js"
	},
	externals: {
		WP_API_Settings: 'WP_API_Settings'
	},
	devtool: '#source-map',
	module: {

		// Webpack loaders are applied when a resource is matches the test case
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader:'babel'
			},
			{
				test: /\.scss$/,
				loaders: [
					ExtractTextPlugin.extract( 'style-loader', 'css!sass' ),
					'css-loader?importLoaders=1',
          'postcss-loader?sourceMap=inline'
				]
			},
			{
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      },			{
				test: /\.json$/,
				loader: 'json-loader'
			},
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader'
      }		]
	},
	resolve: {
		extensions: [ '', '.js', '.jsx' ],
		modulesDirectories: [ 'node_modules', 'src' ]
	},
	node: {
		fs: "empty",
		process: true
	},

	plugins: [
		new webpack.DefinePlugin({

			// NODE_ENV is used inside React to enable/disable features that should only
			// be used in development
			'process.env': {
				NODE_ENV: JSON.stringify( NODE_ENV )
			}
		}),
		new ExtractTextPlugin( '[name].css' )
	]
};

if ( NODE_ENV === 'production' ) {

	// When running in production, we want to use the minified script so that the file is smaller
	webpackConfig.plugins.push( new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false
		}
	}) );
}

module.exports = webpackConfig;
