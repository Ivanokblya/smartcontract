document.addEventListener("DOMContentLoaded", function() {
  let provider;
  let signer;
  let factoryContract;

  const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const factoryAbi = [
    {
      "anonymous": false,
      "inputs": [
        { "indexed": false, "internalType": "address", "name": "betAddress", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "target", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "name": "BetCreated",
      "type": "event"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "name": "allBets",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "target", "type": "uint256" },
        { "internalType": "uint256", "name": "durationMinutes", "type": "uint256" }
      ],
      "name": "createBet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllBets",
      "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  async function init() {
    if (!window.ethereum) {
      alert("Установи MetaMask!");
      return;
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    factoryContract = new ethers.Contract(factoryAddress, factoryAbi, signer);

    console.log("Контракт подключен:", factoryContract.address);
    loadAllBets();
  }

  async function loadAllBets() {
    try {
      const bets = await factoryContract.getAllBets();
      console.log(bets);
      const betList = document.getElementById("bet-list");
      betList.innerHTML = "";

      bets.forEach((betAddress, index) => {
        const li = document.createElement("li");
        li.className = "bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600";
        li.textContent = `Ставка #${index + 1} — ${betAddress}`;
        li.dataset.address = betAddress;
        li.dataset.channel = "UC123456"; // Заглушка — заменить на реальный канал
        li.dataset.time = 60;            // Заглушка
        li.dataset.target = 1000;        // Заглушка

        li.addEventListener("click", () => {
          document.getElementById("bet-details").classList.remove("hidden");
          document.getElementById("detail-channel").textContent = li.dataset.channel;
          document.getElementById("detail-time").textContent = li.dataset.time;
          document.getElementById("detail-target").textContent = li.dataset.target;
	  document.getElementById("stake-amount").value = "";
          document.getElementById("max-bet").textContent = "0.1"; // TODO: получить из контракта


          // Здесь можешь запомнить выбранный адрес ставки и передавать в контракты
          currentSelectedBet = li.dataset.address;
        });

        betList.appendChild(li);
      });

    } catch (err) {
      console.error("Ошибка при загрузке ставок:", err);
    }
  }

  // Обработка создания ставки
  document.getElementById('create-bet-form').addEventListener('submit', async e => {
    e.preventDefault();

    const channelId = document.getElementById('channel-id').value;
    const duration = document.getElementById('duration').value;
    const targetSubs = document.getElementById('target-subs').value;

    if (!channelId) {
      alert("Пожалуйста, введите ID канала");
      return;
    }

    try {
      const tx = await factoryContract.createBet(targetSubs, duration);
      await tx.wait();
      alert("Ставка создана!");
      loadAllBets();
    } catch (err) {
      console.error(err);
      alert("Ошибка при создании ставки");
    }
  });

  // Кнопки голосования
  let currentSelectedBet = null;
  document.getElementById("bet-up").addEventListener("click", () => {
    if (!currentSelectedBet) return alert("Выберите ставку!");
    alert("Вы проголосовали: наберёт подписчиков!");
    // TODO: Вызов смарт-контракта
  });

  document.getElementById("bet-down").addEventListener("click", () => {
    if (!currentSelectedBet) return alert("Выберите ставку!");
    alert("Вы проголосовали: не наберёт подписчиков!");
    // TODO: Вызов смарт-контракта
  });

  init();
});
