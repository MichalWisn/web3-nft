const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyAvatarNFT", () => {
  const fakeRecipient = "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199";
  const metadataURI = "cid/test";
  let avatars;

  beforeEach(async () => {
    // get contract & deploy
    const Avatars = await ethers.getContractFactory("MyAvatars");
    avatars = await Avatars.deploy();
    await avatars.deployed();
  });

  it("should mint and transfer NFT to buyer", async () => {
    // check initial balance
    let balance = await avatars.balanceOf(fakeRecipient);
    expect(balance).to.equal(0);

    const newMintedToken = await avatars.payToMint(fakeRecipient, metadataURI, {
      value: ethers.utils.parseEther("0.005"),
    });

    // wait until transaction mined
    await newMintedToken.wait();

    balance = await avatars.balanceOf(fakeRecipient);

    // check NFT posession
    expect(balance).to.equal(1);
    expect(await avatars.isContentOwned(metadataURI)).to.equal(true);
  });

  it("should throw error on insufficient payment provided", async () => {
    try {
      await avatars.payToMint(fakeRecipient, metadataURI, {
        value: ethers.utils.parseEther("0.001"),
      });
      throw new Error("fail purposefully");
    } catch (err) {
      expect(err.toString()).to.contain("0.005 ether required");
    }
  });

  it("increments balance of owned tokens correctly", async () => {
    expect(await avatars.balanceOf(fakeRecipient)).to.equal(0);

    const newToken1 = await avatars.payToMint(fakeRecipient, metadataURI, {
      value: ethers.utils.parseEther("0.005"),
    });
    await newToken1.wait();
    expect(await avatars.balanceOf(fakeRecipient)).to.equal(1);

    const newToken2 = await avatars.payToMint(
      fakeRecipient,
      `${metadataURI}/2`,
      {
        value: ethers.utils.parseEther("0.005"),
      }
    );
    await newToken2.wait();
    expect(await avatars.balanceOf(fakeRecipient)).to.equal(2);
  });
});
