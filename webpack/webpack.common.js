const path = require("path");

module.exports = {
  mode: "none",
  entry: {
    app: path.resolve(process.cwd(), "src/index.ts"),
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
    path: path.resolve(process.cwd(), "build"),
    libraryTarget: "umd",
    library: "sc",
  },
};
