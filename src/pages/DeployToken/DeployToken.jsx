import React, { useState, useRef, useEffect, useContext } from "react";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import {
  Progress,
  Box,
  ButtonGroup,
  Button,
  Heading,
  Flex,
  FormControl,
  GridItem,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  InputLeftAddon,
  InputGroup,
  Textarea,
  FormHelperText,
  InputRightElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Icon,
  chakra,
  VisuallyHidden,
  Text,
  Stack,
  ring,
  Badge,
  Code,
  Center,
} from "@chakra-ui/react";
import { AuthContext } from "../../context/auth";
import { useToast } from "@chakra-ui/react";
import { ethers } from "ethers";
import CreateGovernanceTokenAbi from "../../utils/contractabis/CreateGovernanceTokenAbi.json";
import UserSideAbi from "../../utils/contractabis/UserSideAbi.json";

const DeployToken = () => {
  const toast = useToast();
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState(0);
  const [justDeployed, setJustDeployed] = useState("");
  const [access, setAccess] = useState("loading");

  const { safeAuthPack, safeAuthSignInResponse } = useContext(AuthContext);

  const createToken = async () => {
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const createTokenContract = new ethers.Contract(
        "0x525dfb5921F22de7305F062A31b0A43ad0B9e1D3",
        CreateGovernanceTokenAbi,
        signer
      );
      const userSideContract = new ethers.Contract(
        "0x098d5Ba8b28ed0DeBDcC2A95e91a801B490Cff21",
        UserSideAbi,
        signer
      );
      const accounts = await provider.listAccounts();
      console.log(userSideContract);
      const userId = await userSideContract.userWallettoUser(accounts[0]);
      const tx = await createTokenContract.deployToken(
        tokenName,
        tokenSymbol,
        totalSupply,
        userId
      );
      await tx.wait();
      console.log(tx);
      const totalTokens = await createTokenContract.getTotalTokesnDeployed(
        userId
      );
      const mintedTokenAddress =
        await createTokenContract.userIdtoDeployedTokens(
          userId,
          totalTokens - 1
        );
      //const mintedTokenAddress = await createTokenContract.
      setJustDeployed(mintedTokenAddress);
      toast({
        title: "Tokens Minted",
        description: `Token Address: ${mintedTokenAddress}`,
        status: "success",
        duration: 10000,
        isClosable: true,
        position: "top-right",
      });
    } else {
      const provider = new ethers.providers.Web3Provider(
        safeAuthPack?.getProvider()
      );

      const signer = provider.getSigner();

      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer,
      });

      const safeAddress = safeAuthSignInResponse?.safes[0];

      const safe = await Safe.create({
        ethAdapter,
        safeAddress: safeAddress,
      });

      const relaykit = new GelatoRelayPack(import.meta.env.VITE_GELATO_API_KEY);

      const userSideContract = new ethers.Contract(
        "0x7919303D9772b331F446e4eD2D1F20d1a9592CDE",
        UserSideAbi,
        signer
      );

      const userId = await userSideContract.userWallettoUser(
        safeAuthSignInResponse?.eoa
      );

      const createTokenContract = new ethers.Contract(
        "0x9f2e5E10c5A71285e16255Ca3Ad346e5311f2419",
        CreateGovernanceTokenAbi,
        signer
      );

      const data = createTokenContract.interface.encodeFunctionData(
        "deployToken(string memory _tokenName,string memory _tokenSymbol,uint256 _totalSupply,uint256 _userId)",
        [tokenName, tokenSymbol, totalSupply, userId]
      );

      const transactions = [
        {
          to: "0x9f2e5E10c5A71285e16255Ca3Ad346e5311f2419",
          data: data,
          value: 0,
        },
      ];

      const options = { isSponsored: true };

      const safeTransaction = await relaykit.createRelayedTransaction({
        safe,
        transactions,
        options,
      });

      const signedSafeTransaction = await safe.signTransaction(safeTransaction);

      const response = await relaykit.executeRelayTransaction(
        signedSafeTransaction,
        safe,
        options
      );

      console.log(
        `Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`
      );

      toast({
        title: "Transaction Submitted Successfully",
        description: "Waiting for some time to get changes reflected",
        status: "success",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const checkMembership = async () => {
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideContract = new ethers.Contract(
        "0x098d5Ba8b28ed0DeBDcC2A95e91a801B490Cff21",
        UserSideAbi,
        signer
      );
      const accounts = await provider.listAccounts();
      const userId = await userSideContract.userWallettoUser(accounts[0]);
      if (userId == 0) {
        setAccess("denied");
      } else {
        setAccess("granted");
      }
    } else {
      const provider = new ethers.providers.Web3Provider(
        safeAuthPack?.getProvider()
      );

      const signer = provider.getSigner();

      const userSideContract = new ethers.Contract(
        "0x7919303D9772b331F446e4eD2D1F20d1a9592CDE",
        UserSideAbi,
        signer
      );

      const userId = await userSideContract.userWallettoUser(
        safeAuthSignInResponse?.eoa
      );
      if (userId == 0) {
        setAccess("denied");
      } else {
        setAccess("granted");
      }
    }
  };

  console.log(justDeployed);

  useEffect(() => {
    checkMembership();
  }, []);

  if (access == "loading") {
    return <Center>Loading...</Center>;
  } else if (access == "denied") {
    return <Center>Access Denied.. Please sign up into the system</Center>;
  }

  return (
    <>
      <Box
        borderWidth="1px"
        rounded="lg"
        shadow="1px 1px 3px rgba(0,0,0,0.3)"
        maxWidth={800}
        p={6}
        m="10px auto"
        as="form"
      >
        <SimpleGrid columns={1} spacing={6}>
          <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
            Deploy Token
          </Heading>
          <FormControl mr="2%">
            <FormLabel fontWeight={"normal"}>Token Name</FormLabel>
            <Input
              placeholder="Ethereum"
              type="text"
              onChange={(e) => setTokenName(e.target.value)}
            />
          </FormControl>
          <FormControl mt="2%">
            <FormLabel fontWeight={"normal"}>Token Symbol</FormLabel>
            <Input
              type="text"
              placeholder="ETH"
              onChange={(e) => setTokenSymbol(e.target.value)}
            />
          </FormControl>
          <FormControl mt="2%">
            <FormLabel fontWeight={"normal"}>Total Supply</FormLabel>
            <Input
              type="text"
              placeholder="1000"
              onChange={(e) => setTotalSupply(e.target.value)}
            />
          </FormControl>
        </SimpleGrid>
        <Button
          display="block"
          mx="auto"
          mt={6}
          w="10rem"
          colorScheme="purple"
          variant="solid"
          onClick={createToken}
        >
          Deploy Token
        </Button>
        <Center>
          <Code mt={2} colorScheme="yellow" variant="outline">
            {justDeployed}
          </Code>
        </Center>
      </Box>
    </>
  );
};

export default DeployToken;
