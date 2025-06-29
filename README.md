"scripts": {
    "server": "npm run watch --prefix server",
    "client": "npm run dev --prefix client",
    "watch": "npm run server & npm run client",
    "install-server": "npm install --prefix server",
    "install-client": "npm install --prefix client",
    "install": "npm run install-server && npm run install-client",
    "test": "npm run test --prefix server && npm run test --prefix client"
  },
