const router = require('express').Router();
const { ProductController } = require('../../controllers');
const {isAuthenticated,isRoleAllowed}=require('../../middlewares/auth.middleware')
const {checkExisted}=require('../../middlewares/product.middleware')
const multer = require('multer');

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,__basedir+'/uploads/')
    },
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+'-'+Date.now()+'-'+file.originalname)
    }
})

const csvFilter=(req,file,cb)=>{
    if(file.mimetype.includes('csv')){
        cb(null,true)
    }else{
        cb('Please upload only csv file.',false)
    }
}

const upload = multer({ storage: storage,fileFilter:csvFilter});



router.post('/createProduct',isAuthenticated,isRoleAllowed("ADMIN","VENDOR"),checkExisted('category_id','Category'),checkExisted('brand_id','Brand'),ProductController.createProduct)
router.post('/getProducts',isAuthenticated,isRoleAllowed("ADMIN","VENDOR"),(req,res,next)=>ProductController.getUserProduct(req,res,next,false))
router.post('/bulkUpload',isAuthenticated,isRoleAllowed("ADMIN","VENDOR"),upload.single('file'),ProductController.bulkProductUpload)
router.post('/getAllProducts',isAuthenticated,upload.single('file'),(req,res,next)=>ProductController.getUserProduct(req,res,next,true))
module.exports = router;