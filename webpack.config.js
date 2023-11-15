const path = require("path");
const FileManagerPlugin = require("filemanager-webpack-plugin");

module.exports = {
  mode: "development",
  target: "node",
  entry: "./src/index.ts",
  resolve: {
    alias: Object.fromEntries(
      [
        "handlers",
        "api",
        "utils",
        "constatns",
        "core",
        "interfaces",
        "player",
      ].map((item) => [item, path.resolve(__dirname, `src/${item}/`)])
    ),
    extensions: [".ts"],
  },
  module: {
    rules: [
      {
        test: [/\.ts$/],
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
    ],
  },
  plugins: [
    new FileManagerPlugin({
      events: {
        onStart: {
          delete: ["build"],
        },
        onEnd: {
          copy: [{ source: "public", destination: "build/public" }],
        },
      },
    }),
  ],
  output: {
    path: path.join(__dirname, "/build"),
    filename: "app.js",
    libraryTarget: "this",
  },
  stats: "errors-only",
};
