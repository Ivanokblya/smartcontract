const { ethers } = require("ethers");
const axios = require("axios");
require("dotenv").config();

const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const ABI = require("./abi.json"); // ABI будет сгенерен
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PROVIDER_URL = "http://127.0.0.1:8545"; // Hardhat

const API_KEY = process.env.YT_API_KEY;
const CHANNEL_ID = process.env.YT_CHANNEL_ID;

async function fetchSubscribers() {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
    const res = await axios.get(url);
    const subs = parseInt(res.data.items[0].statistics.subscriberCount, 10);
    return subs;
}

async function main() {
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    const subscriberCount = await fetchSubscribers();
    console.log("Актуальное количество подписчиков:", subscriberCount);

    const tx = await contract.submitResult(subscriberCount);
    await tx.wait();
    console.log("✅ Отправлено в контракт:", tx.hash);
}

main().catch(console.error);
