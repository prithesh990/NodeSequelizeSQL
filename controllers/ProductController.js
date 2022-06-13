const BaseController = require("./BaseController");
const { Op } = require("sequelize");
const RequestHandler = require("../utils/requestHandler");
const Logger = require("../utils/logger");
const Joi = require("joi");
const {Product}=require('../models')
const _ = require("lodash");


const csv = require('csv-validator');

const { sequelize } = require("../models");
var fs = require('fs');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);



class ProductController extends BaseController {
  /**
   * To create product
   * @param {Request} req
   * @param {Response} res
   */
  static async createProduct(req, res) {
    try {
      const schema = Joi.object({
        product_name: Joi.string().min(2).max(255).required(),
        price: Joi.number().required(),
        brand_id: Joi.number().required(),
        category_id: Joi.number().min(1).required(),
        user_id: Joi.string().required(),
      });

      const { error } = schema.validate(req.body);
      if (error)
        requestHandler.validateJoi(
          error,
          400,
          "Bad Request",
          error ? error.details[0].message : ""
        );

      const createdProduct = await super.create(req, "Product", req.body);

      if (!_.isNull(createdProduct)) {
        requestHandler.sendSuccess(res, "Product created successfully", 201)();
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
   * To get user product
   * @param {Request} req
   * @param {Response} res
   * @returns
   */

  static async getUserProduct(req, res,next,showAll) {
    console.log("next",showAll)
    showAll=showAll || false
    try {
      const { user_id } = req.decoded;
      const search = req.body.search;
      const filter = req.body.filter;
      let searchQuery = {};
      let filterQuery = {};
      let priceFilter = {};
      const schema = Joi.object({
        page: Joi.number(),
        page_size: Joi.number(),
        filter: Joi.object({
          category_id: Joi.number(),
          brand_id: Joi.number(),
          price: Joi.string().valid("low to high", "high to low"),
        }),
        search: Joi.string(),
      });

      const { error } = schema.validate(req.body);
      if (error)
        requestHandler.validateJoi(
          error,
          400,
          "Bad Request",
          error ? error.details[0].message : ""
        );

      if (search) {
        searchQuery = {
          product_name: sequelize.where(
            sequelize.fn("LOWER", sequelize.col("product_name")),
            "LIKE",
            "%" + search + "%"
          ),
        };
      }

      if (!_.isNull(filter)) {
        const payload = _.omit(filter, ["price"]);
        _.forOwn(payload, (value, key) => {
          filterQuery = {
            ...filterQuery,
            [key]: value,
          };
        });
        if (_.has(filter, "price")) {
          priceFilter = {
            order: sequelize.literal(
              `price ${filter.price == "low to high" ? "ASC" : "DESC"}`
            ),
          };
        }
      }

      const query={
      
        ...searchQuery,
        ...filterQuery,
      }

      if(!showAll){
        query['user_id']=user_id
      }

      console.log(query)

      const products = await super.getList(req, "Product", {
        where: query,
        ...priceFilter,
      });
      return requestHandler.sendSuccess(
        res,
        "Products Data Extracted"
      )([...products]);
    } catch (err) {
      return requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Bulk product upload for vendor and admin
   * @param {Request} req 
   * @param {Response} res 
   */

  static async bulkProductUpload(req,res){
    try{
      if(req.file==undefined){
     return requestHandler.throwError(400, 'Bad Request', 'Please upload a CSV File')();
      }
     
      let filePath=__basedir+'/uploads/'+req.file.filename;
      const headers = {
        product_name: '', // any string
        price: 1.0, // any number
        brand_id:1,
        category_id:1,
        user_id: '' // add '_' as first character of the key to indicate as optional
    };
    
      const jsonArray=await csv(filePath,headers);
     
      if(!jsonArray){
        return requestHandler.sendError(req, res, err);
      }
      console.log("jsonarray",jsonArray)
      
     const product=await Product.bulkCreate(jsonArray,{validate:true})
     console.log(product)

     if (!_.isNull(product)) {
      requestHandler.sendSuccess(res, "Product uploaded successfully", 201)();
    } else {
      requestHandler.throwError(
        422,
        "Unprocessable Entity",
        "unable to process the contained instructions"
      )();
    }
    }
    catch(err){
      return requestHandler.sendError(req, res, err);
    }

  }


}

module.exports = ProductController;
