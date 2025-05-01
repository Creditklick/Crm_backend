const express = require('express');


const {
  PayFullAmount,
  PayPartially,
  SettlementAmount,
  CibilCleanUpAmount,
  GetAllPaymentHistory,
  GetAllPaymentDetail,
  getAllTosPos,
  GetTotalTosPos,
  getAgentsReportedTo,
  Agent_PaymentHistory
} = require("./../controller/controllersecond");

const {getAgentController , getverifypaymentdetail , agent_payment , GetMiddlewareAccess } =  require('./../middleware/middleware');



const router_controller = express.Router();




router_controller.post('/api/payment/:stefto_id/Paid_Full_Amount',PayFullAmount);


router_controller.post('/api/payment/:stefto_id/Paid_Partial_Amount',PayPartially);


router_controller.post('/api/payment/:stefto_id/Settlement_Amount',SettlementAmount);


router_controller.post('/api/payment/:stefto_id/CibilCleanUp_Amount',CibilCleanUpAmount);


router_controller.get('/api/payment/:stefto_id/GetPayment_History',GetAllPaymentHistory);



router_controller.get('/api/payment/getamount/', getverifypaymentdetail , GetAllPaymentDetail);










/*Todo List of fetch from Payment_Status */
router_controller.get('/api/tos/pos/gateway/settlement',GetMiddlewareAccess,(req,res)=>{
  //  getAllTosPos(req,res,`Settlement_Amount IS NOT NULL AND Settlement_Amount <> 0`)
  getAllTosPos(req, res, `p.Settlement_Amount IS NOT NULL AND p.Settlement_Amount <> 0`);
});


router_controller.get('/api/tos/pos/gateway/fullypaid',GetMiddlewareAccess,(req,res)=>{
   // getAllTosPos(req,res,`Fully_Paid_Amount IS NOT NULL AND Fully_Paid_Amount <> 0`)
   getAllTosPos(req, res, `p.Fully_Paid_Amount IS NOT NULL AND p.Fully_Paid_Amount <> 0`);
})





router_controller.get('/api/tos/pos/gateway/cibilcleanup',GetMiddlewareAccess,(req,res)=>{
   // getAllTosPos(req,res,`Cibil_Cleanup IS NOT NULL AND  Cibil_Cleanup <> 0`)
   getAllTosPos(req, res, `p.Cibil_Cleanup IS NOT NULL AND p.Cibil_Cleanup <> 0`);
})

router_controller.get('/api/tos/pos/gateway/partiallypaid',GetMiddlewareAccess,(req,res)=>{
    // getAllTosPos(req,res,`Partially_Paid_Amount IS NOT NULL AND  Partially_Paid_Amount <> 0`)
    getAllTosPos(req, res, `p.Partially_Paid_Amount IS NOT NULL AND p.Partially_Paid_Amount <> 0`);
})



router_controller.get('/api/tos/pos/gateway/totoltospos',GetTotalTosPos);

router_controller.get("/senior/getAgentsReportedTo", getAgentController,  getAgentsReportedTo);




router_controller.get('/senior/api/v1/notification/',agent_payment,Agent_PaymentHistory);





module.exports = router_controller;