require('dotenv').config();

module.exports = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    winiston:{
      logpath:'.//logs//'
    },
    auth: {
      jwt_secret: process.env.JWT_SECRET,
      jwt_expiresin: process.env.JWT_EXPIRES_IN || '1d',
      saltRounds: 10,
      refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || 'VmVyeVBvd2VyZnVsbFNlY3JldA==',
      refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRES_IN || '2d', // 2 days
    },
   
  };