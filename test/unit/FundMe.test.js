const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

MINIMUM_USD = 50 * 10 ** 18;

describe("FundMe", function () {
    let fundMe;
    let mockV3Aggregator;
    let deployer;
    const sendValue = ethers.parseEther("0.05");
    beforeEach(async () => {
        // const accounts = await ethers.getSigners()
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]); // launch all deploy.js (deploy all contracts) with tag "all"
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
    });

    describe("constructor", function () {
        it("sets the aggregator addresses correctly", async () => {
            const response = await fundMe.getPriceFeed();
            assert.equal(response, await mockV3Aggregator.getAddress());
        });
    });
    describe("functions", function () {
        it("denies too low donation", async () => {
            const lowDonation = ethers.parseEther("0.0001"); // should be less than
            await expect(
                fundMe.fund({ value: lowDonation })
            ).to.be.revertedWith("You need to spend more ETH!");
        });
        it("allows suffisciently high donation", async () => {
            const highDonation = ethers.parseEther("0.5"); // should be less than
            const accounts = await ethers.getSigners();

            await fundMe.fund({ value: highDonation });
            await fundMe.connect(accounts[1]).fund({ value: highDonation });
            funders = await fundMe.getFunders();
            console.log(funders);
            expect(funders).to.include(deployer); // accounts 0
            expect(funders).to.include(accounts[1].address);
        });
    });
});
