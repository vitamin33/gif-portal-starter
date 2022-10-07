import {Connection, PublicKey, clusterApiUrl} from "@solana/web3.js";
import {Program, Provider, web3} from "@project-serum/anchor";
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import idl from './idl.json'
import {Buffer} from 'buffer'

const {SystemProgram, Keypair} = web3
window.Buffer = Buffer
let baseAccount = Keypair.generate()
const programID = new PublicKey(idl.metadata.address)
const network = clusterApiUrl('devnet')
const opts = {
    preflightCommitment: "processed"
}

// Constants
const TWITTER_HANDLE = 'B_serbin';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = [
    "https://media0.giphy.com/media/9rjG7nTTYUuvlMlTR7/giphy.gif?cid=790b76119011aa2019e955035bffe4a982faf84db5bfd1ac&rid=giphy.gif&ct=s",
    "https://media1.giphy.com/media/10b2mfpiglNd4c/giphy.gif?cid=ecf05e474d9o2tpak675pjqykso094vyplgxdada5qgmdxuf&rid=giphy.gif&ct=g",
    "https://media3.giphy.com/media/dWZUV2eFAMym8vBCd7/giphy.gif?cid=ecf05e47jjo82dfg7p5y2qmk1vm0rp8js8vdog6e71xhxvzs&rid=giphy.gif&ct=g"
]

const App = () => {
    const [walletAddress, setWalletAddress] = useState(null)
    const [inputValue, setInputValue] = useState('')
    const [gifList, setGifList] = useState(null)
    const checkWalletIsConnected = async () => {
        try {
            const {solana} = window
            if (solana) {
                if (solana.isPhantom) {
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
    const sendGif = async () => {
        if (inputValue.length > 0) {
            console.log("Gif link: ", inputValue)
            try {
                const provider = getProvider()
                const program = new Program(idl, programID, provider)
                await program.rpc.addGif(inputValue, {
                    accounts: {
                        baseAccount: baseAccount.publicKey,
                        user: provider.wallet.publicKey
                    }
                })
                console.log("Gif successfully sent to program with value: ", inputValue)
                await getGifList()
                setInputValue('')
            } catch (e) {
                console.error(e)
            }
            setInputValue('')
        } else {
            alert("GIF link is empty. Please fill input field with correct link.")
        }
    }
    const renderNotConnectedContainer = () => {
        return <div>
            <button className="cta-button connect-wallet-button"
                    onClick={connectWallet}>Connect wallet
            </button>
        </div>
    }
    const onInputChange = event => {
        const {value} = event.target
        setInputValue(value)
    }
    const getProvider = () => {
        const connection = new Connection(network, opts.preflightCommitment)
        return new Provider(connection, window.solana, opts.preflightCommitment)
    }
    const createGifAccount = async () => {
        try {
            const provider = getProvider()
            const program = new Program(idl, programID, provider)
            await program.rpc.startStuffOff({
                accounts: {
                    baseAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId
                },
                signers: [baseAccount]
            })
            console.log("Created new BaseAccount w/ Address: ", baseAccount.publicKey.toString())
            await getGifList()
        } catch (e) {
            console.error("Error creating BaseAccount: ", e)
        }
    }
    const renderConnectedContainer = () => {
        if (gifList === null) {
            return <div className="connected-container">
                <button className="cta-button submit-gif-button" onClick={createGifAccount}>
                    Do One Time Init of GIF Program Account
                </button>
            </div>
        } else {
            return (
                <div className="connected-container">
                <form onSubmit={event => {
                    event.preventDefault()
                    sendGif()
                }}>
                    <input type="text" placeholder="Enter gif link" value={inputValue} onChange={onInputChange}/>
                    <button type="submit" className="cta-button submit-gif-button">Submit</button>
                </form>
                <div className="gif-grid">
                    {gifList.map((item, index) =>
                        <div className="gif-item" key={index}>
                            <img src={item.gifLink} alt={item.gifLink} width="100" height="100"/>
                        </div>
                    )}
                </div>
            </div>
            )
        }
    }

    useEffect(() => {
        const onLoad = async () => {
            await checkWalletIsConnected()
        }
        window.addEventListener('load', onLoad)
        return () => window.removeEventListener('load', onLoad)
    }, [])
    const getGifList = async () => {
        try {
            const provider = getProvider()
            const program = new Program(idl, programID, provider)
            const account = await program.account.baseAccount.fetch(baseAccount.publicKey)
            console.log("Got the account: ", account)

            setGifList(account.gifList)
        } catch (e) {
            console.error("Error while getting gif list.. ", e)
            //setGifList(null)
        }
    }
    useEffect(() => {
        if (walletAddress) {
            console.log("Fetching GIF list...")

            getGifList()
        }
    }, [walletAddress])
    return (
        <div className="App">
            <div className={walletAddress ? 'authed-container' : 'container'}>
                <div className="header-container">
                    <p className="header">🖼 GIF Portal</p>
                    <p className="sub-text">
                        View your GIF collection in the metaverse ✨
                    </p>
                    {!walletAddress && renderNotConnectedContainer()}
                    {walletAddress && renderConnectedContainer()}
                </div>
                <div className="footer-container">
                    <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo}/>
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
