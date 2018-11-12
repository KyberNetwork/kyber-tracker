const mysql      = require('mysql');
const BigNumber = require('bignumber.js');

const connection = mysql.createConnection({
  host     : '52.76.9.190',
  port      : '3306',
  user     : 'kyber_tracker',
  password : 'JRxVUZ2Mzx5FWW3Ltfz7NEBD5FSMJNAa',
  database : 'kyber_tracker'
});
 
connection.connect();

const comp = new BigNumber(2).pow(128)
console.log("@@@@@@@@@@@@@@", comp.toNumber())
const processData = (data) => {
  const swapTrades = data.filter(i => {
    // console.log(i.commission_receive_address)
    try {
      const commission = new BigNumber(i.commission_reserve_address)
      console.log("_________", commission.toNumber())
      return commission.lt(comp)
    } catch (error) {
      return false
    }

    // console.log(commission.toNumber())
    
  })

  console.log("^^^^^^^^^^^^^^^",  swapTrades)

  return swapTrades
}

const query = "SELECT * FROM kyber_tracker.kyber_trade where commission_reserve_address is not null and block_timestamp > 1539075608;"

connection.query(query, function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results.length);
  console.log("*************")
  console.log(processData(results))
});

connection.end();