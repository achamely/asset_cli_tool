const { getKeypair, getApi, signAndSend, ledgerSignAndSend } = require("../setup");
const inquirer = require("inquirer");
const { adjustAmount } = require("./helpers/adjustAmount");

const question = [
  {
    type: "input",
    name: "id",
    message: "input asset id",
    default: "1",
  },
  {
    type: "input",
    name: "admin",
    message: "admin account, type ledger for ledger",
    default: "//Alice",
  },
  {
    type: "input",
    name: "from",
    message: "send from address",
    default: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
  },
  {
    type: "input",
    name: "to",
    message: "send to address",
    default: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  },
  {
    type: "input",
    name: "amount",
    message: "Input amount (will be multiplied by decimals)",
    default: "1",
  },
];

const forceTransfer = async (calls) => {
  const { id, to, amount, from, admin } = await inquirer.prompt(question);
  const api = await getApi();
  const tx = await calls.forceTransfer(api, [id, from, to, amount]);
  if (admin === "ledger") {
    await ledgerSignAndSend(tx, api)
  } else {
    const sender = getKeypair(admin);
    await signAndSend(tx, api, sender)
  }};

module.exports = {
  forceTransfer,
};
