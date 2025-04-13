const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let betContract;

const bettingContractABI = [
  "function submitResult(uint256 _subscribers) external"
];

async function initialize() {
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
}

async function submitResultToContract(subscribersCount, betAddress) {
  betContract = new ethers.Contract(betAddress, bettingContractABI, signer);

  try {
    const tx = await betContract.submitResult(subscribersCount);
    await tx.wait();
    console.log("Результат успешно отправлен в контракт");
  } catch (error) {
    console.error("Ошибка при отправке результата в контракт", error);
  }
}

initialize();
