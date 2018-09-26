module.exports = {
    "extends": "eslint:recommended",
    "parserOptions": {
      "import/extensions": "off",
      "ecmaVersion": 8,
      "sourceType": "module",
      "ecmaFeatures": {
        "jsx": true,
        "experimentalObjectRestSpread": true
      }
    },
    "plugins": [
      "react"
    ],
    "rules": {
      "import/extensions": "off",
      "import/no-unresolved": "off",
      "semi": 2,
      "no-undef": 0,
      "no-console": 0,
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error"
    }
};