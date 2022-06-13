const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('../config/appconfig');
const RequestHandler = require('../utils/requestHandler');
const Logger = require('../utils/logger');
const { auth, role } = require("../models");


const logger = new Logger();
const requestHandler = new RequestHandler(logger);
/**
 * To verify token is valid or not
 * @param {Request} req 
 * @param {Response} res 
 * @param {*} next 
 */
 const verifyToken=(req, res, next)=> {
	try {
		if (_.isUndefined(req.headers.authorization)) {
           
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}
		const Bearer = req.headers.authorization.split(' ')[0];

		if (!Bearer || Bearer !== 'Bearer') {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}

		const token = req.headers.authorization.split(' ')[1];

		if (!token) {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}

		// verifies secret and checks exp
		jwt.verify(token, config.auth.jwt_secret, (err, decoded) => {
			if (err) {
				requestHandler.throwError(401, 'Unauthorized', 'please provide a valid token ,your token might be expired')();
			}
			req.decoded = decoded;
			next();
		});
	} catch (err) {
		requestHandler.sendError(req, res, err);
	}
}

/**
 * To check if role existed in the Roles table
 * @param {Request} req 
 * @param {Response} res 
 * @param {*} next 
 * @returns 
 */

const checkRolesExisted = async(req, res, next) => {
	try{
	if (req.body.role_id) {
	const roles=await role.findOne({
			where:{
				id:req.body.role_id
			}
		})

		
		if(roles){
			next()
			return
		}
	
		requestHandler.throwError(401, 'Failed', 'Role does not exist')();
	  
	}
  
	next();
}
catch(err){
	requestHandler.sendError(req, res, err);
}
  };

  
/**
 * To check if the role is allowed or not
 * @param  {...string} role 
 * @returns 
 */
const isRoleAllowed = (...role) => {
return (req, res, next) => {
	
    const {role_name}=req?.decoded
	
    
  
   try{
          if (role.includes(role_name)) {
            next();
            return
          }

          requestHandler.throwError(401, 'Unauthorized', 'Access denied')();
        }
        catch(err){
            requestHandler.sendError(req, res, err);
        }
        
  
      
      
    
  }
}

module.exports={
    isAuthenticated:verifyToken,
    isRoleAllowed,
	checkRolesExisted
}