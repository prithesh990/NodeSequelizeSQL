const router = require('express').Router();
router.use('/',require('./auth.routes'))
router.use('/users',require('./user.routes'))
router.use('/products',require('./product.routes'))

module.exports = router;