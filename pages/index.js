import Image from 'next/image'
import styles from "../styles/Home.module.css";
import manImg from "../public/images/man.png";
import armImg from "../public/images/arm.png";
import fistImg from "../public/images/fist.png";
import ethIcon from "../public/icons/eth.svg";
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import NFTABI from "../public/ABI/NFTABI.json";
import { desiredChainId, nftContractADrress } from '@/constants/web3constants';

export default function Home() {
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [price, setPrice] = useState(0);

  const connectWalletAndPriceHandler = async () => {
    try {
      const _provider = new ethers.providers.Web3Provider(window.ethereum)
      const accounts = await _provider.send("eth_requestAccounts", []);
      const _signer = _provider.getSigner();
      setProvider(_provider);
      setSigner(_signer)
      setAddress(accounts[0])
      const nftContract = new ethers.Contract(nftContractADrress, NFTABI, _provider);
      const _price = await nftContract.price();
      setPrice(_price)
    } catch (e) {
      console.log("error in connecting wallet")
    }
  }

  const mintHandler = async () => {
    try {
      if (provider._network.chainId !== desiredChainId) {
        alert("you are on the wrong network");
        return;
      }

      let accBalance = await provider.getBalance(address);
      accBalance = +ethers.utils.formatEther(accBalance);
      let nftPrice = +ethers.utils.formatEther(price);

      if (accBalance < nftPrice) {
        alert("you don't have enough balance in account to mint nft");
        return;
      }

      const nftContract = new ethers.Contract(nftContractADrress, NFTABI, signer);
      const tx = await nftContract.mint({
        value: price,
        gasLimit: 210000
      })
      await tx.wait();
      alert(`Nft minted successfully. txHash: ${tx.hash}`)

    } catch (e) {
      console.log("failed to mint nft")
      alert("failed to mint nft")
    }
  }
  return (
    <>
      <div className={styles.pageWrapper}>
        <div className={styles.secondWrapper}>
          <div className={styles.contentWrapper}>
            <div>
              <h1><span>THE</span>OMNI-MAN</h1>
              <p>A 3D Art Collection of 8,888 Unique 1/1 NFTs - these 3D digital art collectibles live on the Ethereum blockchain.</p>
              {address ? <div className={styles.btnWrapper}>
                <button className={styles.priceBtn}><Image src={ethIcon} alt='eth-icon' />{ethers.utils.formatEther(price)} ETH</button>
                <button className={styles.mintBtn} onClick={mintHandler}>MINT</button>
              </div> : <button onClick={connectWalletAndPriceHandler} className={styles.connectBtn}>
                connect wallet
              </button>}
            </div>
          </div>
        </div>
        <div className={styles.imgsWrapper}>
          <Image src={manImg} alt='hero-img' className={styles.manImg} />
          <Image src={armImg} alt='arm-img' className={styles.armImg} />
          <Image src={fistImg} alt='fist-img' className={styles.fistImg} />
        </div>
      </div>
    </>
  )
}
