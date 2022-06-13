
const config = require('../config/appconfig');
const RequestHandler = require('../utils/requestHandler');
const Logger = require('../utils/logger');
const {sequelize} = require("../models");
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

/**
 * To check the following field existed or not
 * @param {string} field 
 * @param {string} model_name 
 * @returns 
 */
const checkExisted = (field,model_name) => {
return async(req, res, next) => {
	try{
	if (req.body[field]) {
	const data=await sequelize.models[model_name].findOne({
			where:{
				id:req.body[field]
			}
		})

		
		if(data){
			next()
			return
		}
	
		requestHandler.throwError(401, 'Faied', `${field} does not exist`)();
	  
	}
  
	next();
}
catch(err){
	requestHandler.sendError(req, res, err);
}
  };
}

  module.exports={
    checkExisted
  }