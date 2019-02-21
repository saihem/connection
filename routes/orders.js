const express = require(`express`);
const router = express.Router();

const dbConfig = require(`./dbconfig`);
const oracledb = require(`oracledb`);


/* GET franchise listings. */
router.get(`/`, (req, res) => {
  oracledb.getConnection({
    user: dbConfig.dbuser,
    password: dbConfig.dbpassword,
    connectString: dbConfig.connectString
  }, (err, connection) => {
    if (err) {
      res.send(err);
      doRelease(connection);
      return;
    }
    connection.execute(`SELECT * FROM ORDERS_DATA`, [], (err, result) => {
      if (err) {
        res.send(err);
        doRelease(connection);
        return;
      }
      let resultArray = result.rows.map((row) => {
        let rowObj = {};
        result.metaData.forEach((item, index) => {
          let keyName = item.name;
          rowObj[keyName] = row[index];
        });
        return rowObj;
      });
      res.send(resultArray);
      doRelease(connection);
    });
  });
});

/* POST orders data. */
router.post(`/`, (req, res) => {

  let ORDER_ID = req.body.ORDER_ID;
  let ORDER_DATE = req.body.ORDER_DATE;
  let ORDER_TIME = req.body.ORDER_TIME;
  let ORDER_TIMESTAMP = req.body.ORDER_TIMESTAMP;
  let LOYALTY_PROGRAM = req.body.LOYALTY_PROGRAM;
  let CUST_ID = req.body.CUST_ID;
  let ORDER_PHONE_NUMBER = req.body.ORDER_PHONE_NUMBER;
  let ORDER_TYPE = req.body.ORDER_TYPE;
  let STORE_ID = req.body.STORE_ID;
  let AMOUNT = req.body.AMOUNT;

  if (!ORDER_ID || !ORDER_DATE || !ORDER_TIME || !ORDER_TIMESTAMP || !LOYALTY_PROGRAM || !CUST_ID || !ORDER_PHONE_NUMBER || !ORDER_TYPE || !STORE_ID || !AMOUNT) {
    res.status(400).send(`Required data missing from request body.`);
    return;
  }

  oracledb.getConnection({
    user: dbConfig.dbuser,
    password: dbConfig.dbpassword,
    connectString: dbConfig.connectString
  }, (err, connection) => {
    if (err) {
      res.status(500).send(err);
      doRelease(connection);
      return;
    }
    
    let insertString = `INSERT INTO franchise (ORDER_ID, ORDER_DATE, ORDER_TIME, ORDER_TIMESTAMP, LOYALTY_PROGRAM, CUST_ID, ORDER_PHONE_NUMBER, ORDER_TYPE, STORE_ID, AMOUNT) VALUES ('${ORDER_ID}', '${ORDER_DATE}', '${ORDER_TIME}', '${ORDER_TIMESTAMP}', '${LOYALTY_PROGRAM}', '${CUST_ID}', '${ORDER_PHONE_NUMBER}', '${ORDER_TYPE}', '${STORE_ID}', '${AMOUNT}')`;

    // eslint-disable-next-line no-console
    console.log(`insertString`);
    // eslint-disable-next-line no-console
    console.log(insertString);

    connection.execute(insertString, (err, result) => {
      if (err) {
        let replyObj = {};
        replyObj.error = err;
        replyObj.status = `Record Not Inserted`;
        res.status(202).send(replyObj);
        doRelease(connection);
        return;
      }
      connection.commit((err) => {
        if (err) {
          let replyObj = {};
          replyObj.error = err;
          replyObj.status = `Record Not Inserted`;
          res.status(202).send(replyObj);
          doRelease(connection);
          return;
        }
        res.send(result);
        doRelease(connection);
      });
    });
  });
});


function doRelease(connection) {
  connection.close(
    function (err) {
      if (err)
        // eslint-disable-next-line no-console
        console.error(err.message);
    });
}

module.exports = router;