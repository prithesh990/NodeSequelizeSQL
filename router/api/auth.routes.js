 const router = require('express').Router();
 const {checkRolesExisted}=require('../../middlewares/auth.middleware')

 const {AuthController}=require('../../controllers')

 router.post('/signup',checkRolesExisted,AuthController.signUp);

 router.post('/login',AuthController.login)
 router.post('/refreshToken',AuthController.refreshToken)



 module.exports = router;