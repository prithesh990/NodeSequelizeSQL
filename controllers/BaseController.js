const _ = require('lodash');
const RequestHandler = require('../utils/requestHandler');
const Logger = require('../utils/logger');
const logger = new Logger();
const errHandler = new RequestHandler(logger);
class BaseController {
	constructor(options) {
		this.limit = 20;
		this.options = options;
		
	}

    /**
    * Get an element by it's id .
    *  @param {Request} req 
    * @param  {String} modelName 
    * @return a Promise
	* @return an err if an error occur
    */
	static async getById(req, modelName) {
		const reqParam = req.params.id;
		let result;
		try {
			result = await req.app.get('db')[modelName].findByPk(reqParam).then(
				errHandler.throwIf(r => !r, 404, 'not found', 'Resource not found'),
				errHandler.throwError(500, 'sequelize error ,Something went wrong with either the data base connection or schema'),
			);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

    /**
     * Get an element by options defined custom
     * @param {Request} req 
     * @param  {String} modelName 
     * @param {Object} options 
     * @returns {Promise}
     */
	static async getByCustomOptions(req, modelName, options) {
		let result;
		try {
			result = await req.app.get('db')[modelName].findOne(options);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

    /**
     * Delete an element by Id
     * @param {Request} req 
     * @param  {String} modelName 
     * @returns {Promise}
     * @return an err if an error occur
     */

	static async deleteById(req, modelName) {
		const reqParam = req.params.id;
		let result;
		try {
			result = await req.app.get('db')[modelName].destroy({
				where: {
					id: reqParam,
				},
			}).then(
				errHandler.throwIf(r => r < 1, 404, 'not found', 'No record matches the Id provided'),
				errHandler.throwError(500, 'sequelize error'),
			);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

    /**
     * Create an element
     * @param {Request} req 
     * @param {String} modelName 
     * @param data 
     * @returns =
     */

	static async create(req, modelName, data) {
		let obj = data;
		if (_.isUndefined(obj)) {
			obj = req.body;
		}
		let result;
		try {
		
			result = await req.app.get('db')[modelName].build(obj).save().then(
				errHandler.throwIf(r => !r, 500, 'Internal server error', 'something went wrong couldnt save data'),
				errHandler.throwError(500, 'sequelize error'),

			).then(
				savedResource => Promise.resolve(savedResource),
			);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}


       /**
     * update an element by ID
     * @param {Request} req 
     * @param {String} modelName 
     * @param data 
     * @returns {Promise|Error}
     * @return an err if an error occur
     */
    

	static async updateById(req, modelName, data) {
		const recordID = req.params.id;
		let result;

		try {
			result = await req.app.get('db')[modelName]
				.update(data, {
					where: {
						id: recordID,
					},
				}).then(
					errHandler.throwIf(r => !r, 500, 'Internal server error', 'something went wrong couldnt update data'),
					errHandler.throwError(500, 'sequelize error'),

				).then(
					updatedRecored => Promise.resolve(updatedRecored),
				);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

    /**
     * 
     * @param {Request} req 
     * @param {String} modelName 
     * @param  data 
     * @param {Object} options 
     * @returns 
     */

	static async updateByCustomWhere(req, modelName, data, options) {
		try {
			result = await req.app.get('db')[modelName]
				.update(data, {
					where: options,
				}).then(
					errHandler.throwIf(r => !r, 500, 'Internal server error', 'something went wrong couldnt update data'),
					errHandler.throwError(500, 'sequelize error'),

				).then(
					updatedRecored => Promise.resolve(updatedRecored),
				);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

    /**
     * To get all element
     * @param {Request} req 
     * @param {String} modelName 
     * @param {Object} options 
     * @returns 
     */
	static async getList(req, modelName, options) {
		const page = req.query.page || req.body.page;
		const page_size=req.query.page_size || req.body.page_size
		let limit=20

		let results;
	
		try {
			if (_.isUndefined(options)) {
				options = {};
			}

			if (parseInt(page, 10)) {
				if (page === 0) {
					options = _.extend({}, options, {});
				} else {
					
					options = _.extend({}, options, {
						offset: (+page_size||limit) * (page - 1),
						limit: (+page_size||limit),
					});
				}
			} else {
				options = _.extend({}, options, {}); // extend it so we can't mutate
			}

			results = await req.app.get('db')[modelName]
				.findAll(options)
				.then(
					errHandler.throwIf(r => !r, 500, 'Internal server error', 'something went wrong while fetching data'),
					errHandler.throwError(500, 'sequelize error'),
				).then(result => Promise.resolve(result));
		} catch (err) {
			console.log('herer')
			return Promise.reject(err);
		}
		return results;
	}
}
module.exports = BaseController;