"use strict";
const { Model } = require("sequelize");
const { Sequelize } = require(".");
const phoneValidationRegex = /\d{3}-\d{3}-\d{4}/ 
module.exports = (sequelize,Sequelize,DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /**
     * 
     * @param {*} models 
     */
    static associate(models) {
      // define association here
 
      User.hasOne(models.auth,{
        foreignKey:'user_id',
        onDelete:'CASCADE'
      })

      User.hasMany(models.Product,{
        as:'products',
        foreignKey:'user_id',
        onDelete:'CASCADE'
      })

    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{min:3,max:255}
      },
      email: { type: DataTypes.STRING, allowNull: false, unique: true,validate:{isEmail:true} },
      phone_number:{type: DataTypes.STRING,allowNull:false,unique:true},
      address:{type:DataTypes.STRING,allowNull:true,validate:{min:2,max:255}},
      city:{type:DataTypes.STRING,allowNull:true,validate:{min:1,max:255}}
    },
    {
      sequelize,
      underscrored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "users",
      modelName: "User",
    }
  );
  return User;
};
