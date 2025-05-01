const express = require('express');
const { Login ,Signup , GetUserData , getUserDataBySteftoId , addRemarks , GetAllRemarks , UpdatePhoneNumber , PaidFullAmount   , NotificationControl  , GetAllNotification , SigupFrom , Promise_Callback , Logout}  = require('./../controller/controller')


const {Logincontroller , Signupcontroller , GetUserDataController , AddRemarksControl , NotificationMiddleWare , GetNotificationMiddleWare , validateNewSignup , handleValidation , tokenverify} = require('./../middleware/middleware')


const router = express.Router();




router.post('/login',Logincontroller , Login);
// router.post('/registertl',Signupcontroller,Signup);
router.get('/getUserData',GetUserDataController,GetUserData);
router.get("/persona", getUserDataBySteftoId);
router.post('/addremarks',AddRemarksControl,addRemarks);
router.get('/remarkjson',GetAllRemarks);

router.post('/persona/:stefto_id/Update_Number',UpdatePhoneNumber);


router.post('/persona/:stefto_id/Paid_Full_Amount',PaidFullAmount);



router.post('/notification/api/v1',NotificationMiddleWare,NotificationControl);


router.get('/notification/api/v1/all',GetNotificationMiddleWare,GetAllNotification);


router.post('/signup',validateNewSignup,handleValidation,SigupFrom);



router.get('/api/header/callback_promisespay',tokenverify , Promise_Callback);

router.post('/api/user/logout',tokenverify,Logout);


// router.post( 
//   "/signup",
//   [
//     body("employee_code").notEmpty().withMessage("Employee code is required"),
//     body("email").isEmail().withMessage("Invalid email address"),
//     body("full_name").notEmpty().withMessage("Full name is required"),
//     body("password")
//       .isLength({ min: 6 })
//       .withMessage("Password must be at least 6 characters"),
//     body("confirm_password")
//       .custom((value, { req }) => value === req.body.password)
//       .withMessage("Passwords must match"),
//   ],
//   signup
// );


module.exports = router;
