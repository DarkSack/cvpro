module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", ".impeccable"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "19.0" } },
  plugins: ["react-refresh"],
  rules: {
    "react/jsx-no-target-blank": "off",
    "react/prop-types": "off",
  },
  overrides: [
    {
      // Sin esto ESLint solo miraba .js: el código real (.ts/.tsx) no se revisaba.
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["plugin:@typescript-eslint/recommended"],
      rules: {
        "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      },
    },
  ],
};
