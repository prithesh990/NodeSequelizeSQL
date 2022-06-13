'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Category,{
        foreignKey:'category_id'
      })
      Product.belongsTo(models.Brand,{
        foreignKey:'brand_id'
      })
      Product.belongsTo(models.User,{
        foreignKey:'user_id'
      })
    }
  }
  Product.init({
      id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement:true
    },
    product_name: {type: DataTypes.STRING,allowNull:false},
    price: {type:DataTypes.DOUBLE,allowNull:false,validate:{min:1}}
  }, {
    sequelize,
    underscrored: true,
    timestamps:true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName:'products',
    modelName: 'Product',
  });
  return Product;
};