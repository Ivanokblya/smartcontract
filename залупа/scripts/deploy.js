const hre = require("hardhat");

async function main() {
  const Factory = await hre.ethers.getContractFactory("BettingFactory");
  const factory = await Factory.deploy();

  await factory.waitForDeployment(); // <-- правильно для ethers v6

  console.log("Factory deployed to:", await factory.getAddress()); // <-- тоже v6-style
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
