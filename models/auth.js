'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize,Sequelize, DataTypes) => {
  class auth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      auth.belongsTo(models.role,{foreignKey:'role_id'})
      auth.belongsTo(models.User,{foreignKey:'user_id'})
    }
  }
  auth.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement:true
    },
    email: {type:DataTypes.STRING,
      allowNull:false,
      unique:true
    },
    
 
    password: {type:DataTypes.STRING,allowNull:false},
    last_login_date:{type:DataTypes.DATE,allowNull:true}
  }, {
    sequelize,
    underscrored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    modelName: 'auth',
    tableName:'auth'
  });
  return auth;
};