const path = require("path");
const { network } = require("hardhat");
const DECIMALS = "8";
const INITIAL_PRICE = "200000000000";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    console.log("----------------------------------------------------");
    console.log(path.basename(__filename));
    console.log("------------------");
    console.log("chainId", chainId);
    const other_way_chainId = await getChainId();
    console.log(other_way_chainId);

    console.log("deployer:", deployer);
    if (chainId == 31337) {
        console.log("Local network. Deploying mocks ...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        });
        mockedAggregator = await ethers.getContract("MockV3Aggregator");
        mockedAggregatorAddress = await mockedAggregator.getAddress();
        console.log(`Aggregator mock Deployed at ${mockedAggregatorAddress}!`);
        console.log(" ... trying mocked aggregator contrator ...");
        // console.log(mockedAggregator);
        decimals = await mockedAggregator.decimals();
        console.log(decimals);
        console.log(" ... done.");
        console.log("----------------------------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
