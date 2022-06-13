
const BaseController = require("./BaseController");
const { Op } = require("sequelize");
const RequestHandler = require("../utils/requestHandler");
const Logger = require("../utils/logger")
const {User,role,auth,sequelize}=require('../models')
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
class UserController extends BaseController {

    /**
     * 
     * to get all the customers and vendors with filter and search
     * @param {Request} req 
     * @param {Response} res 
     * @returns 
     */
    static async getAllCustomersAndVendors(req,res){
        try{
           const filter=req.query.filter
           const search=req.query.search
           let filterConditionforRole={}
           let filterconditionForCity={}
           let searchQuery={}

            /**
             * for filter based on role vendor and find by location
             */
           if(filter){
            // filterConditionforRole.role_name="VENDOR"
            filterconditionForCity.city=sequelize.where(sequelize.fn('LOWER', sequelize.col('city')), 'LIKE', '%' + filter + '%')

           }
             /**
             * for search using columns name,email,phone_number
             */
           if(search){
                searchQuery[Op.or]=
                    {
                        email:sequelize.where(sequelize.fn('LOWER', sequelize.col('User.email')), 'LIKE', '%' + search + '%'),
                        name:sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + search + '%'),
                        phone_number:sequelize.where(sequelize.fn('LOWER', sequelize.col('phone_number')), 'LIKE', '%' + search + '%'),
                    }
                
           }
          
        

            const users= await super.getList(req,"auth",   {
                where:{
                    role_id:{
                      [Op.ne] :req.decoded.role_id},
                    
                },
                attributes: {exclude:['password','last_login_date','role_id','user_id']},
                include:[
                  
                    {
                        model:role,
                        where:filterConditionforRole
                    },
                    {
                        model:User,
                        
                        where:{...filterconditionForCity,...searchQuery},
                        attributes:{exclude:['created_at','updated_at']}
                    }
                ],
               
    
    
                
            })

            return requestHandler.sendSuccess(res, 'User Data Extracted')([ ...users ]);
        }
        catch(err){
            return requestHandler.sendError(req, res, err);
        }
    }
}

module.exports = UserController;
