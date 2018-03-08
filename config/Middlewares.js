module.exports = {
  /**
   * These are list of additional/customized middlewares will be used in the app
   * If you want to override or define a new middleware,
   * just put the implementation in app/middlewares folder
   * Then put the name in this array
   */
  before: [
    'cookieParser',
    'bodyParser',
    'bodyMultipart',
    'www',
    'passportInit',
    'passportSession'
  ],
  after: [
    // Nothing
  ],
}
