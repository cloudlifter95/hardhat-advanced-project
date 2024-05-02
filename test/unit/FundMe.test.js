const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

MINIMUM_USD = 50 * 10 ** 18;

describe("FundMe", function () {
    let fundMe;
    let mockV3Aggregator;
    let deployer;
    let accounts;
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
        accounts = await ethers.getSigners();
    });

    describe("constructor", function () {
        it("sets the owner correctly", async () => {
            assert.equal(await fundMe.i_owner(), deployer);
        });
        it("sets the aggregator addresses correctly", async () => {
            const response = await fundMe.getPriceFeed();
            assert.equal(response, await mockV3Aggregator.getAddress());
        });
    });
    describe("functions", () => {
        it("fund_function: denies too low donation", async () => {
            const lowDonation = ethers.parseEther("0.0001"); // should be less than
            await expect(
                fundMe.fund({ value: lowDonation })
            ).to.be.revertedWith("You need to spend more ETH!");
        });
        it("fund_function: allows suffisciently high donation", async () => {
            const highDonation = ethers.parseEther("0.5"); // should be less than

            await fundMe.fund({ value: highDonation });
            await fundMe.connect(accounts[1]).fund({ value: highDonation });
            funders = await fundMe.getFunders();
            console.log(funders);
            expect(funders).to.include(deployer); // accounts 0
        });
        it("fund_function: allows several suffisciently high donations", async () => {
            const highDonation = ethers.parseEther("0.5"); // should be less than

            await fundMe.connect(accounts[1]).fund({ value: highDonation });
            await fundMe.connect(accounts[2]).fund({ value: highDonation });
            funders = await fundMe.getFunders();
            console.log(funders);

            expect(funders).to.include(accounts[1].address); // accounts 1
            expect(funders).to.include(accounts[2].address); // accounts 2

            // 1 address N contributions balance check
            await fundMe.connect(accounts[1]).fund({ value: highDonation }); // second donation
            addressToAmountFunded = await fundMe.getAddressToAmountFunded(
                accounts[1].address
            );
            // console.log(addressToAmountFunded);
            assert.equal(addressToAmountFunded, 1000000000000000000n);
        });

        it("withdraw_function: denies non-owner withdrawal", async () => {
            owner = await fundMe.i_owner();
            console.log(`Contract Owner:`, owner);
            console.log(`Malicious: ${accounts[1].address}`);

            // withdraw attempt
            try {
                await fundMe.connect(accounts[1]).withdraw();

                // If the function call does not revert, fail the test
                throw new Error("Transaction did not revert as expected");
            } catch (error) {
                expect(error.message).to.include("NotOwner");
            }
        });
        it("withdraw_function: allows owner withdrawal", async () => {
            owner = await fundMe.i_owner();
            console.log(`Contract Owner:`, owner);
            console.log("Donating..");

            for (let i = 1; i < 4; i++) {
                await fundMe.connect(accounts[i]).fund({ value: sendValue });
            }

            // listing funders and calculating contract balance
            funders = await fundMe.getFunders();

            let contract_bal = BigInt("0");
            for (let index = 0; index < funders.length; index++) {
                donation = await fundMe.getAddressToAmountFunded(
                    funders[index]
                );
                console.log(funders[index], donation);
                contract_bal = contract_bal + BigInt(donation);
            }
            console.log("contract balance after donation ", contract_bal);

            // test begins
            initial_deployer_balance = await ethers.provider.getBalance(
                deployer
            );
            console.log(initial_deployer_balance);
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait();
            const { gasUsed, gasPrice } = transactionReceipt;
            console.log(transactionReceipt);
            const gasCost = BigInt(gasUsed) * BigInt(gasPrice);
            deployer_balance = await ethers.provider.getBalance(deployer);
            console.log(deployer_balance);
            assert.equal(
                BigInt(initial_deployer_balance) +
                    BigInt(contract_bal) -
                    BigInt(gasCost),
                BigInt(deployer_balance)
            );
        });
    });
});
