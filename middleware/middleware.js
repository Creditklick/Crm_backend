const Pool = require("./../config/db");
const SECRET_KEY = "your_secret_key";
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const Logincontroller = async (req, res, next) => {
  try {
    const { employee, password } = req.body;
    console.log("employe ", employee);
    console.log("password ", password);
    if (!employee || !password) {
      return res
        .status(400)
        .json({ success: false, message: "User Id and Password is required" });
    }

    next();
  } catch (err) {
    res.status(403).json({ message: "Error in Middleware of Login" });
  }
};

//fields = ['id', 'username', 'email', 'password', 'employee_code', 'registration_date']

const Signupcontroller = async (req, res, next) => {
  try {
    const { username, email, password, employee } = req.body;
    if (!username || !email || !password || !employee) {
      return res
        .status(400)
        .json({ message: "All the feild is require necessary" });
    }

    const [rows] = await Pool.promise().query(
      "SELECT * FROM searchapp_customuser WHERE employee_code = ?",
      [employee]
    );

    if (rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Error in Middleware of Signupcontroller" });
  }
};

const GetUserDataController = async (req, res, next) => {
  try {
    // const {
    //     Name_query,
    //     Account_Number_query,
    //     Phone_Number_query,
    //     City_query,
    //     SteftoNo_query,
    //     CUSTID_query
    // } = req.query;

    // if (
    //     !Name_query &&
    //     !Account_Number_query &&
    //     !Phone_Number_query &&
    //     !City_query &&
    //     !SteftoNo_query &&
    //     !CUSTID_query &&
    //     !AssignedTo
    // ) {
    //     return res.status(400).json({ success: false, message: "At least one search parameter is required." });
    // }

    //verify token:
    const token = req.headers.authorization?.split(" ")[1];
    console.log("token is ", token);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    //decode token
    const decorder = jwt.verify(token, SECRET_KEY);
    console.log("user detials", decorder);
    req.user = decorder;

    next();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Error in Middleware of GetUserData" });
  }
};

const AddRemarksControl = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("token is ", token);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    //decode token
    const decorder = jwt.verify(token, SECRET_KEY);
    console.log("user detials", decorder);
    req.user = decorder;

    next();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Error in Middleware of GetUserData" });
  }
};

const NotificationMiddleWare = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("token is ", token);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    //decode token
    const decorder = jwt.verify(token, SECRET_KEY);
    console.log("user detials", decorder);
    req.user = decorder;

    next();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Error in Middleware of NotificationMiddleWare" });
  }
};

const GetNotificationMiddleWare = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("token is ", token);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    //decode token
    const decorder = jwt.verify(token, SECRET_KEY);
    console.log("user detials", decorder);
    req.user = decorder;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Error in Middleware of GetNotificationMiddleWare" });
  }
};

const New_Signup = async (req, res, next) => {
  const { employee_code, email, full_name, password } = req.body;
  next();
};

const validateNewSignup = [
  body("employee_code").notEmpty().withMessage("Employee code is required"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("full_name").notEmpty().withMessage("Full name is required"),
  body("userType").notEmpty().withMessage("User type is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("confirm_password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords must match"),
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Error here is ", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  req.getall = req.body;
  next();
};

const getAgentController = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("token is ", token);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    //decode token
    const decorder = jwt.verify(token, SECRET_KEY);
    console.log("user detials", decorder);
    req.user = decorder;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Token not verified" });
  }
};

const getverifypaymentdetail = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    console.log("Call here for verify");

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    //decode token
    const decorder = jwt.verify(token, SECRET_KEY);
    req.user = decorder;

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Token not verified" });
  }
};

const agent_payment = async (req, res, next) => {
  console.log("Call here");
  try {
    next();
  } catch (err) {}
};

const GetMiddlewareAccess = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("token print for todo");

    console.log("Call here for verify");

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    //decode token
    const decorder = jwt.verify(token, SECRET_KEY);
    req.user = decorder;

    console.log("token is true", req.user);

    next();
  } catch (error) {}
};

const tokenverify = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    console.log("verify token = ", token);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    //decode token
    const decorder = jwt.verify(token, SECRET_KEY);
    req.user = decorder;

    console.log("token is true", req.user);

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Token not verified" });
  }
};

module.exports = {
  Logincontroller,
  Signupcontroller,
  GetUserDataController,
  AddRemarksControl,
  NotificationMiddleWare,
  GetNotificationMiddleWare,
  New_Signup,
  validateNewSignup,
  handleValidation,
  getAgentController,
  getverifypaymentdetail,
  agent_payment,
  GetMiddlewareAccess,
  tokenverify,
};
