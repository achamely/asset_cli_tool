const { getKeypair, getApi, signAndSend, ledgerSignAndSend } = require("../setup");
const inquirer = require("inquirer");
const { adjustAmount } = require("./helpers/adjustAmount");
const {Calls} = require("./helpers/blockchainCalls")
const question = [
  {
    type: "input",
    name: "id",
    message: "input asset id",
    default: '1'
  },
  {
    type: "input",
    name: "to",
    message: "send to address",
    default: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
  },
  {
    type: 'input',
    name: 'amount',
    message: "Input amount",
    default: "1"
  },
  {
      type: 'input',
      name: 'admin',
      message: 'admin for the asset, write ledger for ledger',
      default: '//Alice'
  }
];

const mint = async (calls) => {
  const {id, to, amount, admin} = await inquirer.prompt(question)
  const api = await getApi();
  const tx = await calls.mint(api, [id, to, amount])
  console.log({id, to, amount})
  if (admin === "ledger") {
    await ledgerSignAndSend(tx, api)
  } else {
    const sender = getKeypair(admin);
    await signAndSend(tx, api, sender)
  }
};

module.exports = {
  mint,
};
