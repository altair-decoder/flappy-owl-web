import React, { useState, useEffect } from "react";
import "../assets/styles.css";
import image1 from "../assets/img/min-page-rabit.svg";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import axios from "axios";
import { Table } from "react-bootstrap";
import { CircularProgress } from "@mui/material";

// import stakingContract from "../artifacts/utils/RabbitBounchingStakingVault.sol/RabbitBounchingStakingVault.json";
import nftContract from "../artifacts/ERC721/FlappyOwl.sol/FlappyOwl.json";
import {
  // stakingContractAddress,
  nftContractAddress,
  ownerAddress,
  networkDeployedTo,
} from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

function MintPage() {
  const data = useSelector((state) => state.blockchain.value);

  const [mintAmount, setMintAmount] = useState(1);
  const [userNfts, setUserNfts] = useState([]);
  const [info, setInfo] = useState({
    currentSupply: 0,
    maxSupply: 0,
    maxMintPerWallet: 0,
    nftUserBalance: 0,
    mintCost: 0,
    paused: false,
    userNftIds: [],
    stakedNftIds: [],
    totalReward: 0,
  });
  const [loading, setLoading] = useState(false);

  const getInfo = async () => {
    // console.log("getInfo");
    if (data.network === networksMap[networkDeployedTo]) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );

      const nft_contract = new ethers.Contract(
        nftContractAddress,
        nftContract.abi,
        provider
      );

      // const staking_contract = new ethers.Contract(
      //   stakingContractAddress,
      //   stakingContract.abi,
      //   provider
      // );

      const signer = provider.getSigner();
      const user = await signer.getAddress();

      // const stakedTokens = await staking_contract.tokensOfOwner(user);
      // const reward = await staking_contract.getTotalRewardEarned(user);
      const paused = await nft_contract.isPublicMint();

      var userTokens = [];
      const maxMintPerWallet = await nft_contract.maxMintPerWallet();
      const cost = await nft_contract.mintCost();
      const nftUserBalance = await nft_contract.balanceOf(user);
      // for (var i = 0; i < nftUserBalance; i++) {
      //   userTokens[i] = await nft_contract.TokenOwnership(user);
      // }
      // const tokenURI = await contract.methods.tokenURI(tokenId);
      // const baseExtension = "";
      // //   const baseExtension = await nft_contract.baseExtension();
      const totalSupply = await nft_contract.totalSupply();
      const mintCount = await nft_contract.getmintCount();
      const maxSupply = await nft_contract.maxSupply();
      // userTokens = userTokens.concat(stakedTokens).sort();
      console.log("nftBalance:" + nftUserBalance);

      setInfo({
        nftName: "Rabbit Bounching Nft",
        nftSymbol: "(x.x)",
        nftUserBalance: nftUserBalance,
        currentSupply: Number(totalSupply),
        maxSupply: Number(maxSupply),
        maxMintPerWallet: Number(maxMintPerWallet),
        mintCost: Number(ethers.utils.formatUnits(cost, "ether")),
        paused: paused,
        userNftIds: userTokens,
        // stakedNftIds: stakedTokens,
        // totalReward: Number(ethers.utils.formatUnits(reward, "ether")),
      });

      const _userNfts = await Promise.all(
        userTokens.map(async (nft) => {
          const dataURI = await nft_contract.tokenURI(nft);
          const metadata = atob(dataURI.substring(29));
          const typeOF = typeof metadata;
          // const jsonMetadata = JSON.stringify(metadata);
          const jsonMetadata = JSON.parse(metadata);
          const imgURI = jsonMetadata.image;
          return {
            id: nft,
            uri: imgURI,
            nftName: jsonMetadata.name,
          };
          // return jsonMetadata;
        })
      );

      setUserNfts(_userNfts);
    }
  };

  const mint = async () => {
    console.log("mint");
    if (
      data.network === networksMap[networkDeployedTo] &&
      info.paused == true
    ) {
      try {
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(
          window.ethereum,
          "any"
        );
        const signer = provider.getSigner();
        const nft_contract = new ethers.Contract(
          nftContractAddress,
          nftContract.abi,
          signer
        );
        if (data.account === ownerAddress) {
          const mint_tx = await nft_contract.mint(mintAmount);
          await mint_tx.wait();
        } else {
          const totalMintCost = ethers.utils.parseEther(
            String(info.mintCost * mintAmount),
            "ether"
          );
          const mint_tx = await nft_contract.mint(mintAmount, {
            value: totalMintCost,
          });
          await mint_tx.wait();
        }
        setLoading(false);
        getInfo();
      } catch (error) {
        setLoading(false);
        window.alert("An error has occured, Please Try Again");
        console.log(error);
      }
    }
  };

  const stakeItem = async (id) => {
    //   console.log("unstakeItem");
  };

  const unstakeItem = async (id) => {
    //   console.log("unstakeItem");
  };

  useEffect(() => {
    getInfo();
    console.log(data);
  }, [data.account]);

  return (
    <section>
      <NavBar />
      <br />
      <section className="claim" id="claim">
        <div className="roadmap-container">
          <div className="mint-container">
            <div className="row" style={{ justifyContent: "center" }}>
              <div className="col-md-7">
                <div className="text-center">
                  <h2 className="minttitle title">{info.nftName}</h2>
                  <img src={image1} className="mint-img" alt="" />
                  <p className="lead" style={{ marginBottom: "30px" }}>
                    A {info.nftName} is fully onchain NTFs, no IPFS or any
                    external storage. Olny code (x.x).
                  </p>
                  <div className="form-group">
                    <div className="d-flex justify-content-center">
                      <button
                        type="button"
                        className="minus btn btn-info rounded-circle"
                        disabled={mintAmount === 1}
                        onClick={() => {
                          setMintAmount(mintAmount - 1);
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="mintnum text-center"
                        readOnly
                        value={mintAmount}
                      />
                      <button
                        type="button"
                        className="plus btn btn-info rounded-circle"
                        disabled={
                          mintAmount ===
                          info.maxMintPerWallet - info.nftUserBalance
                        }
                        onClick={() => {
                          setMintAmount(mintAmount + 1);
                        }}
                      >
                        +
                      </button>
                    </div>
                    <div>
                      <button className="btn btn-info mt-3" onClick={mint}>
                        {loading ? (
                          <CircularProgress color="inherit" size={18} />
                        ) : (
                          "MINT"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="my-items">
        {userNfts.length !== 0 ? (
          <>
            <h2 className="minttitle title text-center">My {info.nftName}s</h2>
            <div className="items container">
              {userNfts.map((nft, index) => {
                return (
                  <div className="item-box" key={index}>
                    <img src={nft.uri} className="item-img" />
                    <div className="text-center">
                      <div>
                        <h5>{nft.nftName}</h5> <span></span>
                      </div>
                      {info.stakedNftIds.includes(0) ? (
                        <button
                          className="btn btn-info m-3"
                          role="button"
                          onClick={() => {
                            unstakeItem(0);
                          }}
                        >
                          {loading ? (
                            <CircularProgress color="inherit" size={18} />
                          ) : (
                            "UNSTAKE"
                          )}
                        </button>
                      ) : (
                        <button
                          className="btn btn-info m-3"
                          role="button"
                          onClick={() => {
                            stakeItem(0);
                          }}
                        >
                          {loading ? (
                            <CircularProgress color="inherit" size={18} />
                          ) : (
                            "STAKE"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </section>
      <Footer />
    </section>
  );
}

export default MintPage;
