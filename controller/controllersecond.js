const Pool = require("./../config/db");
const { JsonWebTokenError } = require("jsonwebtoken");
const PayFullAmount = async (req, res) => {
  try {
    const { stefto_id } = req.params;
    const { amount } = req.body;
    if (!stefto_id) {
      res.status(404).json({ success: false, message: "Amount is Required" });
    }

    const [paymenthistory] = await Pool.promise().query(
      "select  Payment_History from Payment_Status where steftoNo = ? ",
      [stefto_id]
    );

    if (paymenthistory.length == 0 || !paymenthistory) {
      await Pool.promise().query(
        "INSERT INTO Payment_Status (stefToNo, Fully_Paid_Amount,Partially_Paid_Amount,Settlement_Amount , Cibil_Cleanup , Payment_History) VALUES (?, ? , ? , ? , ? , ? )",
        [stefto_id, null, null, null, null, null, JSON.stringify([])] // Assuming an empty array for history
      );
    }

    let listofdata = [];
    if (paymenthistory.length > 0 && paymenthistory[0].Payment_History) {
      try {
        listofdata = JSON.parse(paymenthistory[0].Payment_History);
        if (!Array.isArray(listofdata)) {
          listofdata = [];
        }
      } catch (error) {
        listofdata = [];
        return res
          .status(500)
          .json({ success: false, message: "Internal type Convention Error" });
      }
    }
    const data = {
      date: new Date(),
      amount: amount,
      status: "Fully Paid",
    };

    listofdata.push(data);

    const actualdata = JSON.stringify(listofdata);
    const [rows] = await Pool.promise().query(
      "update Payment_Status set  Fully_Paid_Amount = ? ,  Payment_History = ?  where SteftoNo = ? ",
      [amount, actualdata, stefto_id]
    );
    if (!rows || rows.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "Data Not Found" });
    }

    return res
      .status(201)
      .json({ success: true, message: "PayFullAmount call Successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error " });
  }
};

const PayPartially = async (req, res) => {
  try {
    const { stefto_id } = req.params;
    const { amount } = req.body;
    console.log("Amount ", amount);
    console.log("partically payment ", stefto_id);

    if (!stefto_id || !amount) {
      return res
        .status(404)
        .json({ success: false, message: "Amount is Required" });
    }

    const [paymenthistory] = await Pool.promise().query(
      "select Payment_History from Payment_Status where steftoNo = ?  ",
      [stefto_id]
    );

    if (paymenthistory.length == 0 || !paymenthistory) {
      await Pool.promise().query(
        "INSERT INTO Payment_Status (stefToNo, Fully_Paid_Amount,Partially_Paid_Amount,Settlement_Amount , Cibil_Cleanup , Payment_History) VALUES (?, ? , ? , ? , ? , ? )",
        [stefto_id, null, null, null, null, null, JSON.stringify([])]
      );
    }

    let listofdata = [];
    if (paymenthistory.length > 0 && paymenthistory[0].Payment_History) {
      try {
        listofdata = JSON.parse(paymenthistory[0].Payment_History);
        if (!Array.isArray(listofdata)) {
          listofdata = [];
        }
      } catch (error) {
        listofdata = [];
        return res
          .status(500)
          .json({ success: false, message: "Internal type Convention Error" });
      }
    }

    const data = {
      date: new Date(),
      amount: amount,
      status: "Partially",
    };

    listofdata.push(data);
    const actualdata = JSON.stringify(listofdata);

    console.log("List of data", listofdata);
    console.log("Payment history", paymenthistory);

    const [partiallypayment] = await Pool.promise().query(
      "update Payment_Status set Partially_Paid_Amount  =  COALESCE(Partially_Paid_Amount,0) + ? , Payment_History = ? where steftoNo = ? ",
      [amount, actualdata, stefto_id]
    );

    if (!partiallypayment || partiallypayment.length == 0) {
      return res
        .status(404)
        .json({ message: false, message: "Data Not Found" });
    }

    return res
      .status(201)
      .json({
        success: true,
        message: "Partially Payment Successfullly",
        date: partiallypayment[0],
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const SettlementAmount = async (req, res) => {
  try {
    const { stefto_id } = req.params;
    const { amount } = req.body;
    if (!stefto_id) {
      res.status(404).json({ success: false, message: "Amount is Required" });
    }

    const [paymenthistory] = await Pool.promise().query(
      "select  Payment_History from Payment_Status where steftoNo = ? ",
      [stefto_id]
    );

    if (paymenthistory.length == 0 || !paymenthistory) {
      await Pool.promise().query(
        "INSERT INTO Payment_Status (stefToNo, Fully_Paid_Amount,Partially_Paid_Amount,Settlement_Amount , Cibil_Cleanup , Payment_History) VALUES (?, ? , ? , ? , ? , ? )",
        [stefto_id, null, null, null, null, null, JSON.stringify([])]
      );
    }

    let listofdata = [];
    if (paymenthistory.length > 0 && paymenthistory[0].Payment_History) {
      try {
        listofdata = JSON.parse(paymenthistory[0].Payment_History);
        if (!Array.isArray(listofdata)) {
          listofdata = [];
        }
      } catch (error) {
        listofdata = [];
        return res
          .status(500)
          .json({ success: false, message: "Internal type Convention Error" });
      }
    }
    const data = {
      date: new Date(),
      amount: amount,
      status: "Settlement Amount",
    };

    listofdata.push(data);

    const actualdata = JSON.stringify(listofdata);
    const [rows] = await Pool.promise().query(
      "update Payment_Status set  Settlement_Amount = ? ,  Payment_History = ?  where SteftoNo = ? ",
      [amount, actualdata, stefto_id]
    );
    if (!rows || rows.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "Data Not Found" });
    }

    return res
      .status(201)
      .json({ success: true, message: "Settlement Amount Successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error " });
  }
};

const CibilCleanUpAmount = async (req, res) => {
  try {
    const { stefto_id } = req.params;
    const { amount } = req.body;
    if (!stefto_id) {
      res.status(404).json({ success: false, message: "Amount is Required" });
    }

    const [paymenthistory] = await Pool.promise().query(
      "select  Payment_History from Payment_Status where steftoNo = ? ",
      [stefto_id]
    );

    if (paymenthistory.length == 0 || !paymenthistory) {
      await Pool.promise().query(
        "INSERT INTO Payment_Status (stefToNo, Fully_Paid_Amount,Partially_Paid_Amount,Settlement_Amount , Cibil_Cleanup , Payment_History) VALUES (?, ? , ? , ? , ? , ? )",
        [stefto_id, null, null, null, null, null, JSON.stringify([])]
      );
    }

    let listofdata = [];
    if (paymenthistory.length > 0 && paymenthistory[0].Payment_History) {
      try {
        listofdata = JSON.parse(paymenthistory[0].Payment_History);
        if (!Array.isArray(listofdata)) {
          listofdata = [];
        }
      } catch (error) {
        listofdata = [];
        return res
          .status(500)
          .json({ success: false, message: "Internal type Convention Error" });
      }
    }
    const data = {
      date: new Date(),
      amount: amount,
      status: "CibilCleanUp",
    };

    listofdata.push(data);

    const actualdata = JSON.stringify(listofdata);
    const [rows] = await Pool.promise().query(
      "update Payment_Status set  Cibil_Cleanup = ? ,  Payment_History = ?  where SteftoNo = ? ",
      [amount, actualdata, stefto_id]
    );
    if (!rows || rows.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "Data Not Found" });
    }

    return res
      .status(201)
      .json({ success: true, message: "Cibil Clean up Amount Successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error " });
  }
};

const GetAllPaymentHistory = async (req, res) => {
  try {
    const { stefto_id } = req.params;

    if (!stefto_id) {
      return res
        .status(404)
        .json({ success: false, message: "SteftoId is Not Found" });
    }

    const [payment_history_notifi] = await Pool.promise().query(
      "select Payment_History from Payment_Status where steftoNo = ? ",
      [stefto_id]
    );

    if (payment_history_notifi.length == 0 || !payment_history_notifi) {
      await Pool.promise().query(
        "INSERT INTO Payment_Status (stefToNo, Fully_Paid_Amount,Partially_Paid_Amount,Settlement_Amount , Cibil_Cleanup , Payment_History) VALUES (?, ? , ? , ? , ? , ? )",
        [stefto_id, null, null, null, null, null, JSON.stringify([])]
      );
    }

    console.log("Call payment history");
    return res
      .status(201)
      .json({
        success: true,
        data: JSON.parse(payment_history_notifi[0].Payment_History),
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const GetAllPaymentDetail = async (req, res) => {
  const employee_code = req.user.employee_code;
  console.log("employee name ", employee_code);

  try {
    const [getAllSteftoId] = await Pool.promise().query(
      "SELECT SteftoNo FROM searchapp_axis_cc WHERE AssignedTo = ?",
      [employee_code]
    );

    const stefto_array = Array.isArray(getAllSteftoId)
      ? getAllSteftoId.map((item) => item.SteftoNo)
      : [];

    if (stefto_array.length === 0) {
      return res.status(200).json({
        success: true,
        message: {
          Full_Paid_: 0,
          Partially_Paid_: 0,
          Settlement_: 0,
          Cibil_Cleanup_: 0,
          totalRecoverAmount_: "0",
        },
      });
    }

    const placeholders = stefto_array.map(() => "?").join(",");

    const [result] = await Pool.promise().query(
      `
  SELECT 
    SUM(Fully_Paid_Amount) AS Full_Paid_, 
    SUM(Partially_Paid_Amount) AS Partially_Paid_, 
    SUM(Settlement_Amount) AS Settlement_, 
    SUM(Cibil_Cleanup) AS Cibil_Cleanup_
  FROM Payment_Status 
  WHERE SteftoNo IN (${placeholders})
  `,
      stefto_array
    );

    const totalRecoverAmount =
      Number(result[0].Full_Paid_ || 0) +
      Number(result[0].Partially_Paid_ || 0) +
      Number(result[0].Settlement_ || 0) +
      Number(result[0].Cibil_Cleanup_ || 0);

    const summary = {
      Full_Paid_: result[0].Full_Paid_ || 0,
      Partially_Paid_: result[0].Partially_Paid_ || 0,
      Settlement_: result[0].Settlement_ || 0,
      Cibil_Cleanup_: result[0].Cibil_Cleanup_ || 0,
      totalRecoverAmount_: String(totalRecoverAmount),
    };

    return res.status(201).json({ success: true, message: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getAllTosPos = async (req, res, filterquery) => {
  try {
    const { employee_code } = req.user;
    let listing_stefto = [];
    const [list_of_stefto] = await Pool.promise().query(
      "Select SteftoNo from searchapp_axis_cc where AssignedTo = ? ",
      [employee_code]
    );

    list_of_stefto.forEach((item) => {
      listing_stefto.push(item.SteftoNo);
    });

    if (listing_stefto.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No assigned Stefto numbers found for the user.",
      });
    }

    const [result] = await Pool.promise().query(
      `SELECT 
          SUM(s.Total_outs) AS totalTos, 
          SUM(s.PRINCIPLE_OUTSTANDING) AS totalPos
       FROM Payment_Status p
       INNER JOIN searchapp_axis_cc s ON p.SteftoNo = s.steftoNo
       WHERE ${filterquery} 
         AND s.SteftoNo IN (?)`,
      [listing_stefto]
    );

    if (!result || result.length === 0 || result[0].totalTos === null) {
      return res.status(404).json({
        success: false,
        message:
          "No matching TOS/POS data found for the assigned Stefto numbers.",
      });
    }

    return res.status(200).json({
      success: true,
      message: {
        totalTos: result[0].totalTos,
        totalPos: result[0].totalPos,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: err.message,
    });
  }
};

const GetTotalTosPos = async (req, res) => {
  try {
    const [alltospos] = await Pool.promise().query(`
            SELECT SteftoNo 
            FROM Payment_Status 
            WHERE Settlement_Amount IS NOT NULL and Settlement_Amount <> 0
               OR Fully_Paid_Amount IS NOT NULL and Fully_Paid_Amount <> 0
               OR Partially_Paid_Amount IS NOT NULL and Partially_Paid_Amount <> 0
               OR Cibil_Cleanup IS NOT NULL and Cibil_Cleanup <> 0
        `);

    if (alltospos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No relevant payment status data found",
      });
    }

    let totalTos = 0;
    let totalPos = 0;
    let processedSteftoNos = new Set();

    for (let i = 0; i < alltospos.length; i++) {
      const CurrentStefto = alltospos[i].SteftoNo;

      if (processedSteftoNos.has(CurrentStefto)) {
        continue;
      }

      processedSteftoNos.add(CurrentStefto);

      const [currentrow] = await Pool.promise().query(
        `SELECT Total_outs as tos, PRINCIPLE_OUTSTANDING as pos 
                 FROM searchapp_axis_cc 
                 WHERE steftoNo = ?`,
        [CurrentStefto]
      );

      if (currentrow.length === 0) {
        continue;
      }

      for (let j = 0; j < currentrow.length; j++) {
        totalTos += parseFloat(currentrow[j].tos);
        totalPos += parseFloat(currentrow[j].pos);
      }
    }

    return res.status(201).json({
      success: true,
      message: {
        totalTos: totalTos,
        totalPos: totalPos,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: err.message,
    });
  }
};

const getAgentsReportedTo = async (req, res) => {
  console.log("call in backend for senior", req.user);
  const reported_to = req.user.employee_code;

  console.log("Report Name ", reported_to);

  if (!reported_to) {
    return res.status(400).json({ message: "Employee code is required" });
  }

  try {
    const [rows] = await Pool.promise().query(
      "SELECT * FROM searchapp_customuser WHERE reported_to = ?",
      [reported_to]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No agents found for this user" });
    }

    const result = rows.map((item) => ({
      username: item?.username,
      employee_code: item?.employee_code,
      registration_date: item?.registration_date,
      is_active: item?.is_active,
      last_login: item?.last_login,
    }));

    return res.json(result);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const Agent_PaymentHistory = async (req, res) => {
  console.log("call this ");

  try {
    const { employee_code } = req.query;

    console.log("employee code", employee_code);

    const [agent_payment_history] = await Pool.promise().query(
      `SELECT SteftoNo  FROM searchapp_axis_cc  where AssignedTo = ? `,
      [employee_code]
    );

    let setAllSteftoId = [];

    if (agent_payment_history.length === 0 || !agent_payment_history) {
      return res.status(401).json({ success: false, message: "No Data Found" });
    }

    agent_payment_history.forEach((item) => {
      setAllSteftoId.push(item.SteftoNo);
    });

    const placeholders = setAllSteftoId.map(() => "?").join(",");

    const [result] = await Pool.promise().query(
      `select Payment_History from Payment_Status where SteftoNo in (${placeholders})`,
      setAllSteftoId
    );

    let paymentlist = [];
    result.forEach((item) => {
      if (item.Payment_History != null) {
        try {
          const parsed = JSON.parse(item.Payment_History);
          paymentlist = paymentlist.concat(parsed); // flatten the parsed array
        } catch (err) {
          console.error(
            "Invalid JSON in Payment_History:",
            item.Payment_History
          );
        }
      }
    });

    return res.json(paymentlist);
  } catch (err) {
    return res
      .status(500)
      .json({ success: true, message: "Internal server error" });
  }
};

module.exports = {
  PayFullAmount,
  PayPartially,
  SettlementAmount,
  CibilCleanUpAmount,
  GetAllPaymentHistory,
  GetAllPaymentDetail,
  getAllTosPos,
  GetTotalTosPos,
  getAgentsReportedTo,
  Agent_PaymentHistory,
};
