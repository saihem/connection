const express = require(`express`);
const router = express.Router();

const dbConfig = require(`./dbconfig`);
const oracledb = require(`oracledb`);


/* GET users listing. */
router.get(`/`, (req, res) => {
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
    connection.execute(`SELECT * FROM CUSTOMER_DATA`, [], (err, result) => {
      if (err) {
        res.status(500).send(err);
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

/* POST user data. */
router.post(`/`, (req, res) => {

  let CUST_ID = req.body.CUST_ID;

  let FIRST_NAME = req.body.FIRST_NAME;

  let LAST_NAME = req.body.LAST_NAME;

  let PHONE_NUMBER = req.body.PHONE_NUMBER;
  let EMAIL = req.body.EMAIL;
  let GENDER = req.body.GENDER;
  let STATE = req.body.STATE;
  let AGE = req.body.AGE;

  if (!CUST_ID || !FIRST_NAME || !LAST_NAME || !PHONE_NUMBER || !EMAIL || !GENDER || !STATE || !AGE) {
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

    let insertString = `INSERT INTO CUSTOMER_DATA (CUST_ID, FIRST_NAME, LAST_NAME, PHONE_NUMBER, EMAIL, GENDER, STATE, AGE) VALUES (${CUST_ID}, '${FIRST_NAME}', '${LAST_NAME}', '${PHONE_NUMBER}', '${EMAIL}', '${GENDER}', '${STATE}', ${AGE})`;

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