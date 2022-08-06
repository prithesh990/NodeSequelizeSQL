const express=require("express")
const bodyParser=require("body-parser")
const cors=require('cors')
const config = require("./config/appconfig");
const app = express();
const PORT = config.PORT;
const {sequelize}=require("./models")
// const corsOptions = {
//     origin: "http://localhost:8081"
//   };

  global.__basedir=__dirname


  app.set('db', require('./models/index'));
  app.use(cors());
  app.set('config', config); 

  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(require('./router'));

  app.get('/',()=>{
    console.log('here')
  })

  async function main(){
    try{
    await sequelize.sync()
    }
    catch(err){
      console.log(err)
    }
  }

  main()

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});