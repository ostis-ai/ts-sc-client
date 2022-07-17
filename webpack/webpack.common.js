const path = require("path");

module.exports = {
  mode: "none",
  entry: {
    app: path.resolve(process.cwd(), "src/index.ts"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [],
  resolve: {
    extensions: [".ts", ".js"],
  },
  externalsPresets: { node: true },
  output: {
    filename: "sc.js",
    path: path.resolve(process.cwd(), "build"),
    libraryTarget: "umd",
    library: "sc",
    globalObject: "this",
  },
};
