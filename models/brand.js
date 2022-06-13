'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Brand extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Brand.hasMany(models.Product,{
        foreignKey:'brand_id'
      })
    }
  }
  Brand.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement:true
    },
    brand_name: {type: DataTypes.STRING,allowNull:false}
  }, {
    sequelize,
    timestamps:true,
    underscrored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName:'brands',
    modelName: 'Brand',
  });
  return Brand;
};