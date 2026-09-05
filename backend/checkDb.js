const { Case, AuditTrail } = require('./db');

async function checkDb() {
  const cases = await Case.findAll();
  console.log("CASES count:", cases.length);
  for (let c of cases) {
    if (c.id === 'RG-CHK-1787486121408' || c.id === 'RG-CHK-1787486125681') {
      console.log(c.id, c.status);
    }
  }
}
checkDb();
