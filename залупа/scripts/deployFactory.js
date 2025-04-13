const hre = require("hardhat");

async function main() {
  const Factory = await hre.ethers.getContractFactory("BettingFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const address = await factory.getAddress();
  console.log("Фабрика задеплоена по адресу:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
