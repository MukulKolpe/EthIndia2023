import { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { Button } from "@chakra-ui/react";

import { ENV, SpacesUI, SpacesUIProvider } from "@pushprotocol/uiweb";

function Space() {
  const [haveMetamask, sethaveMetamask] = useState(true);
  const [accountAddress, setAccountAddress] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const [spaceId, setSpaceId] = useState("");

  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  useEffect(() => {
    const { ethereum } = window;
    const checkMetamaskAvailability = async () => {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      sethaveMetamask(true);
    };
    checkMetamaskAvailability();
  }, []);

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const balance = await provider.getBalance(accounts[0]);
      const bal = ethers.utils.formatEther(balance);
      setAccountAddress(accounts[0]);
      setAccountBalance(bal);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const darkTheme = {
    titleBg: "linear-gradient(45deg, #E165EC 0.01%, #A483ED 100%)",
    titleTextColor: "#fff",
    bgColorPrimary: "#2F3137",
    bgColorSecondary: "#404550",
    textColorPrimary: "#fff",
    textColorSecondary: "#B6BCD6",
    textGradient:
      "linear-gradient(45deg, #B6A0F5 0%, #F46EF6 57.29%, #FF95D5 100%)",
    btnColorPrimary: "#D53A94",
    btnOutline: "#D53A94",
    borderColor: "#2F3137",
    borderRadius: "17px",
    containerBorderRadius: "12px",
    statusColorError: "#E93636",
    statusColorSuccess: "#30CC8B",
    iconColorPrimary: "#787E99",
  };

  const spaceUI = useMemo(() => {
    if (accountAddress)
      return new SpacesUI({
        account: accountAddress,
        signer: provider.getSigner(),
        pgpPrivateKey: "",
        env: ENV.STAGING,
      });
  }, [accountAddress]);

  return (
    <div className="App">
      <header className="App-header">
        {haveMetamask ? (
          <div className="App-header">
            {isConnected ? (
              <div className="card">
                <div className="card-row">
                  <h3>Wallet Address:</h3>
                  <p>
                    {accountAddress.slice(0, 4)}...
                    {accountAddress.slice(38, 42)}
                  </p>
                </div>
                <div className="card-row">
                  <h3>Wallet Balance:</h3>
                  <p>{accountBalance}</p>
                </div>
              </div>
            ) : (
              <h5> Not Connected</h5>
            )}
            {isConnected ? (
              <p className="info">🎉 Connected Successfully</p>
            ) : (
              <Button onClick={connectWallet}>Connect</Button>
            )}
          </div>
        ) : (
          <p>Please Install MataMask</p>
        )}
      </header>
      {!spaceUI ? (
        // Show a loader while loading
        <div className="flex justify-center items-center h-[80vh]">
          <span className="h-10 animate-bounce text-5xl font-bold">
            Loading...
          </span>
        </div>
      ) : (
        <SpacesUIProvider spaceUI={spaceUI || ""} theme={darkTheme}>
          <div className="flex flex-col gap-3 mt-10">
            <div className="flex justify-between">
              <span className="text-6xl font-extrabold text-left mb-5">
                GBP Spaces
              </span>
              <div className="flex gap-5 self-center">
                <spaceUI.SpaceCreationButtonWidget>
                  <button className="h-full py-3 bg-[#D53A94] text-white px-5 rounded-xl">
                    Create your Space
                  </button>
                </spaceUI.SpaceCreationButtonWidget>
                <spaceUI.SpaceInvites>
                  <button className="h-full py-3 bg-[#D53A94] text-white px-5 rounded-xl">
                    Space Invites
                  </button>
                </spaceUI.SpaceInvites>
              </div>
            </div>
            <div className="h-[600px] rounded-lg overflow-scroll">
              <spaceUI.SpaceFeed
                onBannerClickHandler={(spaceId) => {
                  setSpaceId(spaceId);
                }}
              />
            </div>
            <spaceUI.SpaceWidget spaceId={spaceId} />
          </div>
        </SpacesUIProvider>
      )}
    </div>
  );
}

export default Space;
