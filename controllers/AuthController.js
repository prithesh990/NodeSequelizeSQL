const RequestHandler = require("../utils/requestHandler");
const Logger = require("../utils/logger");
const Joi = require("joi");
const { Op } = require("sequelize");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const BaseController = require("./BaseController");
const config = require("../config/appconfig");
const bcrypt = require("bcrypt");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class AuthController extends BaseController {
  /**
   * For User signup
   * @param {Request} req
   * @param {Response} res
   */
  static async signUp(req, res) {
    try {
      const { email, name, phone_number, password, role_id,address,city } = req.body;

      //To check for request body validation
      const schema = Joi.object({
        email: Joi.string().email().required(),
        name: Joi.string().min(2).max(255).required(),
        phone_number: Joi.string()
          .length(10)
          .pattern(/^[0-9]+$/)
          .required(),
        role_id: Joi.number().required(),
        address:Joi.string().min(2).max(255),
        city:Joi.string().min(2).max(255)
      });

      const { error } = schema.validate({ email, name, phone_number, role_id,address,city });
      if (error)
        requestHandler.validateJoi(
          error,
          400,
          "Bad Request",
          error ? error.details[0].message : ""
        );

      const options = {
        where: {
          [Op.or]: [{ email: email }, { phone_number: phone_number }],
        },
      };
      const user = await super.getByCustomOptions(req, "User", options);

      //to check if user present
      if (user) {
        requestHandler.throwError(
          400,
          "Bad Request",
          "Email and phone number already existed"
        )();
      }

      const hashedPass = bcrypt.hashSync(password, config.auth.saltRounds);

      // data.password = hashedPass;
      const createdUser = await super.create(req, "User", {
        email,
        name,
        phone_number,
        address,
        city
      })

      const createdAuth = await super.create(req, "auth", {
        email,
        password: hashedPass,
        role_id,
        user_id: createdUser.id,
      });

      if (!_.isNull(createdUser)) {
        requestHandler.sendSuccess(res, "User created successfully", 201)();
      } else {
        requestHandler.throwError(
          422,
          "Unprocessable Entity",
          "unable to process the contained instructions"
        )();
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }
  /**
   * For user login
   * @param {Request} req 
   * @param {Response} res 
   */

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      });
      const { error } = schema.validate({
        email,
        password,
      });

      if (error)
        requestHandler.validateJoi(
          error,
          400,
          "bad Request",
          error ? error.details[0].message : ""
        );

      const options = {
        where: { email },
      };
      const authData = await super.getByCustomOptions(req, "auth", options);
      //check for email id present
      if (!authData) {
        requestHandler.throwError(
          400,
          "bad request",
          "invalid email address"
        )();
      }

      await bcrypt.compare(password, authData.password).then(
        requestHandler.throwIf(
          (r) => !r,
          400,
          "incorrect",
          "failed to login bad credentials"
        ),
        requestHandler.throwError(500, "bcrypt error")
      );

      //to update last login date
      const data = {
        last_login_date: new Date(),
      };
      req.params.id = authData.id;
      await super.updateById(req, "auth", data);

      const payload = _.omit(authData.dataValues, [
        "created_at",
        "updated_at",
        "last_login_date",
        "password",
        "id",
      ]);

      //to get the role _info from role table
      const {dataValues:{id,role_name}} = await authData.getRole();

      const token = jwt.sign({...payload,role_name}, config.auth.jwt_secret, {
        expiresIn: config.auth.jwt_expiresin,
        algorithm: "HS512",
      });
      const refreshToken = jwt.sign(
        
        {...payload,role_name},
        
        config.auth.refresh_token_secret,
        {
          expiresIn: config.auth.refresh_token_expiresin,
        }
      );

      /**
       * This log is important to get all the accessor functions
       */
      // console.log(Object.keys(authData.__proto__));

     
		

      const response = {
        status: "Logged in",
        token,
        refreshToken,
      };

  
      requestHandler.sendSuccess(
        res,
        "User logged in Successfully"
      )({ role_id:id,role_name,token, refreshToken });
    } catch (error) {
      requestHandler.sendError(req, res, error);
    }
  }

  /**
   * To generate refresh token
   * @param {Request} req 
   * @param {Response} res 
   */

  static async refreshToken(req, res) {
		try {
			const data = req.body;
			if (_.isNull(data)) {
				requestHandler.throwError(400, 'bad request', 'please provide the refresh token in request body')();
			}
			const schema = Joi.object({
				refreshToken: Joi.string().required(),
			});
			const { error } = schema.validate({ refreshToken: req.body.refreshToken });
      if(error)
			requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

    

     

			if (data.refreshToken) {
        jwt.verify(data.refreshToken, config.auth.refresh_token_secret, (err, decoded) => {
        
         
         const payload= _.omit(decoded, [
           "iat",
           "exp"
          ]);

         
          
          if (err) {
          
            requestHandler.throwError(401, 'Unauthorized', 'please provide a valid token ,your token might be expired')();
          }
          const token = jwt.sign(payload, config.auth.jwt_secret, { expiresIn: config.auth.jwt_expiresin, algorithm: 'HS512' });
          const response = {
            token,
          };
          requestHandler.sendSuccess(res, 'new token is generated', 200)(response);
        });
			
			} else {
				requestHandler.throwError(400, 'bad request', 'no refresh token present in header')();
			}
		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
	}
}

module.exports = AuthController;
