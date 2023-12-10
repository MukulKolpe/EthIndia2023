import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/auth";
import Navbar from "./components/Navbar";
import Home from "./pages/Home/Home";
import CreateDAO from "./pages/CreateDAO/CreateDAO";
import RegisterUser from "./pages/RegisterUser/RegisterUser";
import DAOStorage from "./pages/DAOStorage/DAOStorage";
import DeployToken from "./pages/DeployToken/DeployToken";
import Explore from "./pages/Explore/Explore";
import IndividualDao from "./pages/IndividualDao/IndividualDao";
import Profile from "./pages/Profile/Profile";
import Space from "./pages/Space/Space";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { filecoinCalibration, sepolia } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient } = configureChains(
  [filecoinCalibration, sepolia],
  [
    alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_ID }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "EthIndia",
  projectId: import.meta.env.VITE_PROJECT_ID,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function App() {
  return (
    <AuthProvider>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains} theme={darkTheme()}>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create-dao" element={<CreateDAO />} />
              <Route path="/register" element={<RegisterUser />} />
              <Route path="/deploy-token" element={<DeployToken />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/dao/:daoId" element={<IndividualDao />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dao/:daoId/storage" element={<DAOStorage />} />
              <Route path="/space/:spaceId" element={<Space />} />
            </Routes>
          </Router>
        </RainbowKitProvider>
      </WagmiConfig>
    </AuthProvider>
  );
}

export default App;
