const express = require('express');
const { Login ,Signup , GetUserData , getUserDataBySteftoId , addRemarks , GetAllRemarks , UpdatePhoneNumber , PaidFullAmount   , NotificationControl  , GetAllNotification , SigupFrom , Promise_Callback , Logout , TriggerScraping}  = require('./../controller/controller')


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

router.post('/admin/trigger-scrape', TriggerScraping);    //currently this api is not connect with any part of project , use for future is scarpt the data of any website using this call integrate with chatbox api.

module.exports = router;
