'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Category.hasMany(models.Product,{
        foreignKey:'category_id'
      })
    }
  }
  Category.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement:true
    },
    category_name:{type: DataTypes.STRING,allowNull:false}
  }, {
    sequelize,
    timestamps:true,
    underscrored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName:'categories',
    modelName: 'Category',
  });
  return Category;
};