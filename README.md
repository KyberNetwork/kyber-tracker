# KyberTracker

## Setup environment and run the app
### Install system dependencies
- NodeJS v8+
- MariaDB v10+ (may use MySQL v5.7+ instead)

### Install NodeJS global packages
```
$ npm install -g knex pm2
```

### Checkout and install node packages from source code
```
$ git clone git@github.com:sotatek-dev/KyberTracker.git
$ cd KyberTracker
$ npm install
```

### Create environment variables settings
```
$ cp .env.example .env // Then update the valid setting values in the .env file
```

### Initialize the database schema and seeds data
```
$ npm run init-db
$ npm run seeds
```

### Run the app
```
$ npm start
```

## Code directory structure
### The `.env` file
- Store the environement variables
```
PORT=9009                     // The port that app will run in
NODE_ENV=development          // JS bundle files will be minified/compressed if the environment is production.
LOG_LEVEL=INFO                // Available options: ALL, TRACE, DEBUG, INFO, WARN, ERROR, FATAL

MYSQL_DB_HOST=127.0.0.1       // MySQL host address
MYSQL_DBNAME=kyber_tracker    // MySQL database name
MYSQL_USERNAME=root           // MySQL username
MYSQL_PASSWORD=1              // MySQL user password
```

### The `config` directory
- `config/routes/api.js`: View/add/update the API routes.
- `config/network/production`: Configuration that is related to on-chain data
- Almost don't need to touch other files.

### The `app/controllers` directory
- The first request's handler layer.

### The `app/crawlers` directory
- The process that crawls on-chain data to local database.

### The `app/models` directory
- The interface that interacts with MySQL database.

### The `app/services` directory
- The functions that will handle the main logic/business of the app

## Maintenance
### Add new token
- Add data to `config/network/production.js` file.

### Change the localization
- Update values in json files under folder `resources/lang`.
