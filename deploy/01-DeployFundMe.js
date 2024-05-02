const path = require("path");
const { network, getNamedAccounts, ethers } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config.js");
const { verify } = require("../utils/verify");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    log("----------------------------------------------------");
    console.log(path.basename(__filename));
    log("------------------");
    let ethUsdPriceFeedAddress;
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator"); // expected to be deployed by 00-DeployMocks.js
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
        // console.log('-------------------------------------------------------------------------------------------',ethUsdPriceFeedAddress);
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }
    log("Deploying FundMe and waiting for confirmations...");
    let fundMe = await deploy("FundMe", {
        contract: "FundMe",
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`FundMe deployed at ${fundMe.address}`);
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress]);
    }
    log("----------------------------------------------------");

    // const sendValue = await ethers.parseEther("0.05");
    // fundMe = await ethers.getContract("FundMe", deployer);
    // await fundMe.fund({ value: sendValue });
    // const response = await fundMe.addressToAmountFunded(deployer);
    // console.log(response);
};

module.exports.tags = ["all"];
