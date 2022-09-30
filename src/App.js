import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import {useEffect, useState} from "react";

// Constants
const TWITTER_HANDLE = 'B_serbin';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = [
    "https://media0.giphy.com/media/9rjG7nTTYUuvlMlTR7/giphy.gif?cid=790b76119011aa2019e955035bffe4a982faf84db5bfd1ac&rid=giphy.gif&ct=s",
    "https://media1.giphy.com/media/10b2mfpiglNd4c/giphy.gif?cid=ecf05e474d9o2tpak675pjqykso094vyplgxdada5qgmdxuf&rid=giphy.gif&ct=g",
    ""
]

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null)
  const checkWalletIsConnected = async () => {
    try {
      const {solana} = window
      if (solana) {
        if(solana.isPhantom) {
          console.log("Phantom wallet found")
          const response = await solana.connect({
            onlyIfTrusted: true
          })
          console.log("Connected with public key: ", response.publicKey.toString())
          setWalletAddress(response.publicKey.toString())
        }
      } else {
        alert("Solana object wasn't found. Please install Phantom wallet")
      }
    } catch (e) {
      console.error(e)
    }
  }
  const connectWallet = async () => {
    const {solana} = window
    if (solana) {
      const response = await solana.connect()
      console.log("Connected with public key: ", response.publicKey.toString())
      setWalletAddress(response.publicKey.toString())
    }
  }
  const renderNotConnectedContainer = () => {
    return <div>
      <button className="cta-button connect-wallet-button"
      onClick={connectWallet}>Connect wallet</button>
    </div>
  }
  useEffect(() => {
    const onLoad = async () => {
      await checkWalletIsConnected()
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])
  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
