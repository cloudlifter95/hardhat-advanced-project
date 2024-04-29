const { network } = require("hardhat");
const DECIMALS = "8";
const INITIAL_PRICE = "200000000000";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    console.log(chainId);

    const other_way_chainId = await getChainId();
    console.log(other_way_chainId);

    console.log(deployer);
    if (chainId == 31337) {
        log("Local network. Deploying mocks ...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        });
        log("Mocks Deployed!");
        log("------------------------------------------------");
        log("trying mocked aggregator contrator ...");
        mockedAggregator = await ethers.getContract("MockV3Aggregator");
        // console.log(mockedAggregator);
        decimals = await mockedAggregator.decimals();
        console.log(decimals);
        log("------------------------------------------------");
    }
};

//getChainId
