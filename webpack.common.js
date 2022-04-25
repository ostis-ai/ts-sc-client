const path = require("path");
const outputPath = path.resolve(__dirname, "build");

module.exports = {
  mode: "none",
  entry: {
    app: "./src/index.ts",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "fonts/",
            },
          },
        ],
      },
    ],
  },
  plugins: [],
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".css"],
  },
  externalsPresets: { node: true },
  output: {
    filename: "sc.js",
    path: outputPath,
    libraryTarget: "umd",
    library: "sc",
  },
};
