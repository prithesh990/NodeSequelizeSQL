const router = require('express').Router();
const { UserController } = require('../../controllers');
const {isAuthenticated,isRoleAllowed}=require('../../middlewares/auth.middleware')

router.get('/getUsers',isAuthenticated,isRoleAllowed("ADMIN"),UserController.getAllCustomersAndVendors)

module.exports = router;