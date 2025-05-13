const Pool = require("./../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const SECRET_KEY = "your_secret_key";
const redis = require("./../config/redis.connection");

require("dotenv").config();
const { scrapeProjectData } = require('./../utils/scraper'); // Path check karein



const moment = require("moment-timezone"); // Import moment-timezone

const Login = async (req, res) => {
  try {
    const { employee, password, userType } = req.body; // Include userType in the request body

    let user;

    // Step 1: Check if the user is a "senior" or "agent"
    if (userType === "senior") {
      // Authenticate from the team leader table (searchapp_teamleader_user)
      const [rows] = await Pool.promise().query(
        "SELECT * FROM searchapp_teamleader_user WHERE employee_code = ?",
        [employee]
      );

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid team leader employee code",
        });
      }

      user = rows[0];
    } else if (userType === "agent") {
      // Authenticate from the agent table (searchapp_customuser)
      const [rows] = await Pool.promise().query(
        "SELECT * FROM searchapp_customuser WHERE employee_code = ?",
        [employee]
      );

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid agent employee code",
        });
      }

      user = rows[0];
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    // Step 2: Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid employee code or password",
      });
    }

    // Step 3: Get current time in IST (India Standard Time)
    const lastLogin = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"); // Using moment-timezone for IST

    // If the user is an agent, create a new session record
    if (userType === "agent") {
      await Pool.promise().query(
        "INSERT INTO agent_sessions (agent_id, login_time) VALUES (?, ?)",
        [user.id, lastLogin]
      );
    }

    // Step 4: Update the last login for the agent in searchapp_customuser table
    await Pool.promise().query(
      "UPDATE searchapp_customuser SET last_login = ?, is_active = 1 WHERE id = ?",
      [lastLogin, user.id]
    );

    // Step 5: Generate JWT token
    const token = jwt.sign(
      { id: user.id, employee_code: user.employee_code, email: user.email },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        employee_code: user.employee_code,
        last_login: lastLogin,
      },
    });
  } catch (err) {
    console.error("Database query failed: " + err.stack);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error in Login" });
  }
};

// const Login = async (req, res) => {
//   try {
//     const { employee, password, userType } = req.body; // Include userType in the request body

//     let user;

//     // Step 1: Check if the user is a "senior" or "agent"
//     if (userType === "senior") {
//       // Authenticate from the team leader table (searchapp_teamleader_user)
//       const [rows] = await Pool.promise().query(
//         "SELECT * FROM searchapp_teamleader_user WHERE employee_code = ?",
//         [employee]
//       );

//       if (rows.length === 0) {
//         return res.status(401).json({
//           success: false,
//           message: "Invalid team leader employee code",
//         });
//       }

//       user = rows[0];
//     } else if (userType === "agent") {
//       // Authenticate from the agent table (searchapp_customuser)
//       const [rows] = await Pool.promise().query(
//         "SELECT * FROM searchapp_customuser WHERE employee_code = ?",
//         [employee]
//       );

//       if (rows.length === 0) {
//         return res.status(401).json({
//           success: false,
//           message: "Invalid agent employee code",
//         });
//       }

//       user = rows[0];
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user type",
//       });
//     }

//     // Step 2: Compare the provided password with the hashed password in the database
//     const passwordMatch = await bcrypt.compare(password, user.password);

//     if (!passwordMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid employee code or password",
//       });
//     }

//     // Step 3: Update last login time for agent
//     //const lastLogin = new Date().toISOString().slice(0, 19).replace("T", " ");
//     const lastLogin = new Date();

//     // If the user is an agent, create a new session record
//     if (userType === "agent") {
//       await Pool.promise().query(
//         "INSERT INTO agent_sessions (agent_id, login_time) VALUES (?, ?)",
//         [user.id, lastLogin]
//       );
//     }

//     // Step 4: Update the last login for the agent in searchapp_customuser table
//     await Pool.promise().query(
//       "UPDATE searchapp_customuser SET last_login = ?, is_active = 1 WHERE id = ?",
//       [lastLogin, user.id]
//     );

//     // Step 5: Generate JWT token
//     const token = jwt.sign(
//       { id: user.id, employee_code: user.employee_code, email: user.email },
//       SECRET_KEY,
//       { expiresIn: "24h" }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         employee_code: user.employee_code,
//         last_login: lastLogin,
//       },
//     });
//   } catch (err) {
//     console.error("Database query failed: " + err.stack);
//     res
//       .status(500)
//       .json({ success: false, message: "Internal Server Error in Login" });
//   }
// };

const GetUserData = async (req, res) => {
  try {
    const datadecorder = req.user;
    const employee_id = datadecorder.employee_code;

    // console.log("Employee_id",employee_id);

    const [rows] = await Pool.promise().query(
      "SELECT * FROM searchapp_axis_cc WHERE AssignedTo = ?",
      [employee_id]
    );

    res.status(201).json(rows);
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error in GetUserData",
      });
  }
};

const getUserDataBySteftoId = async (req, res) => {
  try {
    const { stefto_id } = req.query; // Extract stefto_id from URL

    console.log("Id ", stefto_id);

    const [rows] = await Pool.promise().query(
      "SELECT * FROM searchapp_axis_cc WHERE SteftoNo = ?",
      [stefto_id]
    );

    if (!rows || rows.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No records found" }); // ✅ Return to prevent further execution
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error in GetUserDataById",
      });
  }
};

const addRemarks = async (req, res) => {
  try {
    console.log("Add remarks endpoint hit");

    const { remarks, remarksId, stefto_id } = req.body;

    if (!remarks || !stefto_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const datadecorder = req.user;
    const employee_id = datadecorder.employee_code;

    const newRemark = {
      employee_id: remarksId ? `IMS${remarksId}` : employee_id,
      remarks: remarks,
      currentdate: new Date().toISOString().split("T")[0],
    };

    // Get existing remarks
    const [existingRows] = await Pool.promise().query(
      "SELECT remarks FROM searchapp_axis_cc WHERE SteftoNo = ?",
      [stefto_id]
    );

    let remarksList = [];
    if (existingRows.length > 0 && existingRows[0].remarks) {
      try {
        remarksList = JSON.parse(existingRows[0].remarks);
        if (!Array.isArray(remarksList)) {
          remarksList = [];
        }
      } catch (error) {
        console.error("Error parsing existing remarks:", error);
        remarksList = [];
      }
    }

    // Append the new remark
    remarksList.push(newRemark);
    const updatedRemarks = JSON.stringify(remarksList);

    // Update database with new remarks list
    const [result] = await Pool.promise().query(
      `UPDATE searchapp_axis_cc 
             SET remarks = ? 
             WHERE SteftoNo = ?`,
      [updatedRemarks, stefto_id]
    );

    if (result.affectedRows > 0) {
      console.log("Update successful");
      return res.status(200).json({
        message: "Remarks updated successfully",
        data: newRemark,
      });
    } else {
      console.log("No rows affected");
      return res.status(404).json({ message: "Stefto record not found" });
    }
  } catch (error) {
    console.error("Error in addRemarks:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const GetAllRemarks = async (req, res) => {
  try {
    const { stefto_id } = req.query;
    console.log("GEt stefto id in remakrs", stefto_id);

    const [rows] = await Pool.promise().query(
      "select remarks from searchapp_axis_cc where steftoNo = ?",
      [stefto_id]
    );

    if (!rows || rows.length == 0) {
      return res
        .status(404)
        .json({ status: false, message: "No Remarks Found" });
    }

    res.status(200).json({
      status: true,
      message: "Successfully fetch data",
      data: JSON.parse(rows[0].remarks),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const UpdatePhoneNumber = async (req, res) => {
  try {
    const { stefto_id } = req.params;

    const { updatedNumber } = req.body;

    console.log("phone number is ", updatedNumber);
    console.log("Stefto id is ", stefto_id);

    const [rows] = await Pool.promise().query(
      "update searchapp_axis_cc set Updated_Number  = ? where steftoNo = ? ",
      [updatedNumber, stefto_id]
    );

    if (!rows || rows.length == 0) {
      return res
        .status(404)
        .json({ status: false, message: "No Remarks Found" });
    }

    res
      .status(201)
      .json({
        success: true,
        message: "Phone Number Get Updated Successfully",
      });

    res.status(201).json({ message: "update phone " });
  } catch (err) {}
};

const PaidFullAmount = async (req, res) => {
  try {
    //return res.status(201).json({message : "Paid amaount"})

    const { stefto_id } = req.params;
    const { amount } = req.body;

    console.log("Stefto Id ", stefto_id);
    console.log("Full amount", amount);

    if (!stefto_id || !amount) {
      res
        .status(404)
        .json({
          scuccess: false,
          message: "Stefto Id and Customer paid amount is required",
        });
    }

    const [existingRows] = await Pool.promise().query(
      "SELECT Fully_Paid_Amount FROM searchapp_axis_cc WHERE SteftoNo = ?",
      [stefto_id]
    );

    const FullAmoutList = [];

    if (existingRows.length > 0 && existingRows[0].Fully_Paid_Amount > 0) {
      try {
        remarksList = JSON.parse(existingRows[0].remarks);
        console.log(typeof remarksList);
        console.log("reamrk set", remarksList);
        // if (!Array.isArray(remarksList)) {
        //     remarksList = [];
        // }
      } catch (error) {
        // console.error("Error parsing existing remarks:", error);
        // remarksList = [];
      }
    }

    const data = {
      amount: amount,
      date: new Date(),
      status: "Fully Paid",
    };

    FullAmoutList.push(data);
    const listofdata = JSON.stringify(FullAmoutList);
    console.log("actual data", listofdata);
    console.log("data", data);

    const [rows] = await Pool.promise().query(
      "update searchapp_axis_cc set Fully_Paid_Amount  = ? where steftoNo = ? ",
      [listofdata, stefto_id]
    );

    if (!rows || rows.length == 0) {
      res.status(404).json({ success: false, message: "Data is insufficent" });
    }

    res.status(201).json({ scuccess: true, message: "Amount is paid" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error in Paid Amount",
      });
  }
};

const NotificationControl = async (req, res) => {
  try {
    const { status, selectedDate, currenttime, custId, stefto_id } = req.body;

    console.log("custId in backend ", custId);
    const datadecorder = req.user;
    const employee_code = datadecorder.employee_code;

    console.log("stefto id", stefto_id);

    if (!status || !selectedDate || !currenttime || !stefto_id) {
      console.log("Something is missing");
      return res
        .status(400)
        .json({ message: "Please select status, date, and time" });
    }

    const [hours, minutes] = currenttime.split(":").map(Number);
    const expirationDate = new Date(
      `${selectedDate}T${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}:00+05:30`
    );
    const expirationTimestamp = Math.floor(expirationDate.getTime() / 1000);
    const currentUnixTime = Math.floor(Date.now() / 1000);

    const now = new Date();
    const currentIST = new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Kolkata",
    })
      .format(now)
      .replace(",", "");

    console.log("Current IST Time:", currentIST);
    console.log("Expiration Timestamp:", expirationTimestamp);
    console.log("Current Unix Timestamp:", currentUnixTime);

    if (expirationTimestamp <= currentUnixTime) {
      return res.status(400).json({
        success: false,
        message: "Expiration time must be in the future",
      });
    }

    const formattedDate = [
      expirationDate.getFullYear(),
      String(expirationDate.getMonth() + 1).padStart(2, "0"),
      String(expirationDate.getDate()).padStart(2, "0"),
    ].join("-");

    const notification = {
      status: status,
      isactive: true,
      selectedDate: formattedDate,
      currenttime,
      expiresAt: expirationTimestamp,
      custId: custId,
    };

    //   console.log("notificatoin is ",notification);
    console.log("stefto id is ", stefto_id);

    if (
      notification.status === "Call back" ||
      notification.status === "Promise to Pay"
    ) {
      const [savecall_log] = await Pool.promise().query(
        `SELECT notifications FROM searchapp_axis_cc WHERE steftoNo = ?`,
        [stefto_id]
      );

      let remarksList = [];
      if (savecall_log.length > 0 && savecall_log[0].notifications) {
        try {
          remarksList = JSON.parse(savecall_log[0].notifications);
          if (!Array.isArray(remarksList)) {
            remarksList = []; // If parsed data is not an array, reset it to an empty array
          }
        } catch (err) {
          console.error("Error parsing existing remarks:", err);
          remarksList = []; // Reset to an empty array in case of an error
        }
      }

      if (remarksList.length > 0) {
        remarksList.forEach((item, index) => {
          console.log(`Each item at index ${index}:`, item);
        });
      } else {
        console.log("No remarks to process.");
      }

      // Append the new notification to the list
      remarksList.push(notification);

      // Convert the list back to a string
      const updatedRemarks = JSON.stringify(remarksList);

      console.log("Updated remarks data: ", updatedRemarks);

      // Update the notifications column with the new list
      const [update_row] = await Pool.promise().query(
        "UPDATE searchapp_axis_cc SET notifications = ? WHERE steftoNo = ?",
        [updatedRemarks, stefto_id]
      );

      if (update_row.affectedRows > 0) {
        console.log("Record updated successfully");
      } else {
        console.log("No changes made to the record");
      }
    }

    //🔹 Store notifications in Redis under "CrmNotification:<employee_code>"
    const redisKey = `CrmNotification:${employee_code}`;
    await redis.zadd(
      redisKey,
      expirationTimestamp,
      JSON.stringify(notification)
    );

    // 🔹 Auto-remove expired notifications every minute

    setInterval(async () => {
      const currentUnixTimeNow = Math.floor(Date.now() / 1000);
      await redis.zremrangebyscore(redisKey, "-inf", currentUnixTimeNow);
      console.log(
        `Removed expired notifications from Redis for ${employee_code} at:`,
        currentUnixTimeNow
      );
    }, 60000);

    res.status(200).json({
      success: true,
      message: "Notification added with auto-expiry",
      expiration: expirationTimestamp,
      istTime: currentIST,
    });
  } catch (error) {
    console.error("Error in NotificationControl:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ----------------------------------------------------------------------------------------------------------------------------------

const GetAllNotification = async (req, res) => {
  try {
    const decorderdata = req.user;
    const employee_code = decorderdata.employee_code;

    const istToday = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    const redisKey = `CrmNotification:${employee_code}`;
    const currentUnixTime = Math.floor(Date.now() / 1000);

    // Cleanup expired notifications
    await redis.zremrangebyscore(redisKey, "-inf", currentUnixTime);

    // Get all notifications
    const notifications = await redis.zrange(redisKey, 0, -1, "WITHSCORES");

    const todayNotifications = [];

    for (let i = 0; i < notifications.length; i += 2) {
      try {
        const notificationData = JSON.parse(notifications[i]);
        const expirationTimestamp = parseInt(notifications[i + 1], 10);

        // Convert expiration timestamp to IST date
        const expirationDate = new Date(expirationTimestamp * 1000);
        const istExpirationDate = expirationDate.toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        });

        // Compare with today's date

        console.log("Date", istExpirationDate);
        console.log("Today Date", istToday);

        if (istExpirationDate === istToday) {
          todayNotifications.push({
            ...notificationData,
            expiresAt: expirationTimestamp,
            istExpiration: expirationDate.toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour12: false,
            }),
          });
        }
      } catch (error) {
        console.error("Error parsing notification:", error);
      }
    }

    res.status(200).json({
      success: true,
      message: "Today's notifications retrieved successfully",
      data: todayNotifications,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "GetAll Notification Internal Server Error",
      });
  }
};

const SigupFrom = async (req, res) => {
  console.log("call signup from here");
  try {
    const {
      employee_code,
      email,
      full_name,
      password,
      userType,
      reported_to_,
      team_leader_password,
    } = req.getall;

    const salt = 10;
    const hashpassword = await bcrypt.hash(password, salt);
    const registration_date = new Date().toISOString().split("T")[0];

    if (userType === "senior") {
      await Pool.promise().query(
        "INSERT INTO searchapp_teamleader_user (employee_code,email,full_name,password,registration_date) VALUES (?,?,?,?,?)",
        [employee_code, email, full_name, hashpassword, registration_date]
      );

      return res.status(201).json({
        message: "Team Leader registered successfully",
        data: {
          employee_code,
          email,
          full_name,
        },
      });
    }

    if (userType === "agent") {
      // Step 1: Check if team leader exists
      const [rows] = await Pool.promise().query(
        "SELECT * FROM searchapp_teamleader_user WHERE employee_code = ?",
        [reported_to_]
      );

      if (rows.length === 0) {
        return res.status(400).json({
          message: "Invalid team leader employee code",
        });
      }

      const teamLeader = rows[0];

      // Step 2: Compare passwords
      const isPasswordValid = await bcrypt.compare(
        team_leader_password,
        teamLeader.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Incorrect team leader password",
        });
      }

      // If team leader is verified, register agent
      await Pool.promise().query(
        "INSERT INTO searchapp_customuser (employee_code, email, username, password, reported_to, registration_date) VALUES (?, ?, ?, ?, ?, ?)",
        [
          employee_code,
          email,
          full_name,
          hashpassword,
          reported_to_,
          registration_date,
        ]
      );

      return res.status(201).json({
        message: "Agent registered successfully",
        data: {
          employee_code,
          email,
          full_name,
          reported_to_,
        },
      });
    }
  } catch (error) {
    console.error("Signup error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const Promise_Callback = async (req, res) => {
  try {
    const { employee_code } = req.user;

    const [listofstefto] = await Pool.promise().query(
      `SELECT SteftoNo  FROM searchapp_axis_cc  where AssignedTo = ? `,
      [employee_code]
    );

    let allStefto_id = [];

    listofstefto.forEach((item) => {
      allStefto_id.push(item.SteftoNo);
    });

    const placeholders = allStefto_id.map(() => "?").join(",");

    const [rows] = await Pool.promise().query(
      `SELECT notifications FROM searchapp_axis_cc WHERE steftoNo IN (${placeholders})`,
      allStefto_id
    );

    let allNotifications = [];

    let count_promise = 0;
    let count_callback = 0;

    // Ab har row ka notification parse karenge
    for (const row of rows) {
      if (row.notifications) {
        try {
          const parsedNotifications = JSON.parse(row.notifications);
          if (Array.isArray(parsedNotifications)) {
            for (const item of parsedNotifications) {
              if (item.status === "Call back") {
                count_callback += 1;
              }
              if (item.status === "Promise to Pay") {
                count_promise += 1;
              }
            }
            allNotifications = allNotifications.concat(parsedNotifications);
          }
        } catch (error) {
          console.error("Error parsing notifications:", error);
        }
      }
    }

    console.log("Final Notifications List:", allNotifications);

    const data = {
      Promises_pay: count_promise,
      Callback: count_callback,
    };

    return res.status(201).json({ success: true, message: data });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};





const Logout = async (req, res) => {
  const { employee_code } = req.user;

  console.log("come here in logout");
  try {
    let userId;
    let sessionId;

    // Get session details including login_time
    const [sessionRows] = await Pool.promise().query(
      "SELECT id, agent_id, login_time FROM agent_sessions WHERE agent_id = (SELECT id FROM searchapp_customuser WHERE employee_code = ?) AND logout_time IS NULL",
      [employee_code]
    );

    if (sessionRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active session found for this agent",
      });
    }

    sessionId = sessionRows[0].id;
    userId = sessionRows[0].agent_id;
    const loginTime = sessionRows[0].login_time;

    // Update user's active status to inactive
    await Pool.promise().query(
      "UPDATE searchapp_customuser SET is_active = 0 WHERE employee_code = ?",
      [employee_code]
    );

    // Capture current time for logout in IST (India Standard Time)
    const logoutTime = moment()
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss");

    // Calculate the total time spent and store in HH:MM:SS format
    await Pool.promise().query(
      `UPDATE agent_sessions 
       SET logout_time = ?, 
           total_time = SEC_TO_TIME(TIMESTAMPDIFF(SECOND, ?, ?)) 
       WHERE id = ?`,
      [logoutTime, loginTime, logoutTime, sessionId]
    );

    return res.status(200).json({
      success: true,
      message: "Agent logged out successfully, session updated",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during logout" });
  }
};


// const Logout = async (req, res) => {
//   const { employee_code } = req.user;

//   console.log("come here in logout");
//   try {
//     let userId;
//     let sessionId;

//     // Get session details including login_time
//     const [sessionRows] = await Pool.promise().query(
//       "SELECT id, agent_id, login_time FROM agent_sessions WHERE agent_id = (SELECT id FROM searchapp_customuser WHERE employee_code = ?) AND logout_time IS NULL",
//       [employee_code]
//     );

//     if (sessionRows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No active session found for this agent",
//       });
//     }

//     sessionId = sessionRows[0].id;
//     userId = sessionRows[0].agent_id;
//     const loginTime = sessionRows[0].login_time;

//     // Update user's active status to inactive
//     await Pool.promise().query(
//       "UPDATE searchapp_customuser SET is_active = 0 WHERE employee_code = ?",
//       [employee_code]
//     );

//     // Capture current time for logout
//     const currentTime = new Date();

//     // Calculate the total time spent and store in HH:MM:SS format
//     await Pool.promise().query(
//       `UPDATE agent_sessions 
//        SET logout_time = ?, 
//            total_time = SEC_TO_TIME(TIMESTAMPDIFF(SECOND, ?, ?)) 
//        WHERE id = ?`,
//       [currentTime, loginTime, currentTime, sessionId]
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Agent logged out successfully, session updated",
//     });
//   } catch (error) {
//     console.error("Error during logout:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server error during logout" });
//   }
// };




const TriggerScraping = async (req, res) => {
  console.log("Scraping trigger request received...");
  try {
      const scrapedContent = await scrapeProjectData(); // Scraper function call karein
      console.log(scrapedContent);

      if (scrapedContent) {
          console.log("Scraping safal. Content length:", scrapedContent.length);

          // ** AGLA KADAM: RAG ke liye Processing **
          // Yahan par aapko 'scrapedContent' ko process karna hoga:
          // 1. Chunking: Text ko chhote tukdon mein baantein.
          // 2. Embedding: Har chunk ka vector embedding banayein.
          // 3. Storage: Chunks aur embeddings ko vector database (Pinecone, ChromaDB, etc.) mein store karein.

          // Abhi ke liye, hum sirf success message bhej rahe hain.
          // Example Placeholder:
          // await processAndStoreForRAG(scrapedContent);

          res.status(200).json({
              success: true,
              message: 'Scraping safaltapoorvak poora hua. Content RAG ke liye process kiya ja sakta hai.',
              data : scrapedContent
              // dataLength: scrapedContent.length // Optional: Length bhej sakte hain
          });
      } else {
           console.error("Scraping fail hui ya koi content nahi mila.");
           res.status(500).json({ success: false, message: 'Scraping fail hui ya koi content nahi lauta.' });
      }
  } catch (error) {
      console.error("Scraping controller mein error:", error);
      res.status(500).json({ success: false, message: 'Scraping process ke dauran internal server error.', error: error.message });
  }
};



module.exports = {
  Login,
  Logout,

  GetUserData,
  getUserDataBySteftoId,
  addRemarks,
  GetAllRemarks,
  UpdatePhoneNumber,
  PaidFullAmount,
  NotificationControl,
  GetAllNotification,
  SigupFrom,
  Promise_Callback,
  TriggerScraping
};


////geminekey : AIzaSyDBVXJhcidMg1VvRv1VPWKoDSpTr7OAejs