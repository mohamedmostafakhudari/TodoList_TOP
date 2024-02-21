const path = require("path");
const Handlebars = require("handlebars");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const HtmlBundlerPlugin = require("html-bundler-webpack-plugin");

module.exports = {
	entry: "./src/app/main.js",
	plugins: [
		new HtmlWebpackPlugin({
			title: "My Todo List",
			template: "./src/index.html",
			filename: "index.html",
			inject: true,
		}),
	],
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "dist"),
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.hbs$/,
				loader: "handlebars-loader",
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader", "postcss-loader"],
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: "asset/resource",
				generator: {
					filename: "assets/img/[name].[hash:8][ext]",
				},
			},
		],
	},
};
