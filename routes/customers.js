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
      for (i = 0; i < req.body.length; i++) {
        let me = req.body[i];
        let CUST_ID = me.CUST_ID || null;
        let FIRST_NAME = me.FIRST_NAME || null;
        let LAST_NAME = me.LAST_NAME || null;
        let PHONE_NUMBER = me.PHONE_NUMBER || null;
        let EMAIL = me.EMAIL || null;
        let GENDER = me.GENDER || null;
        let STATE = me.STATE || null;
        let AGE = me.AGE || null;

      let insertString = `INSERT INTO CUSTOMER_DATA (CUST_ID, FIRST_NAME, LAST_NAME, EMAIL,GENDER, PHONE_NUMBER, STATE, AGE) VALUES (${CUST_ID}, '${FIRST_NAME}', '${LAST_NAME}', '${EMAIL}', '${GENDER}', '${PHONE_NUMBER}','${STATE}', ${AGE})`;

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
    };
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