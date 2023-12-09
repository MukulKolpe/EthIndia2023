import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/auth";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import { useParams } from "react-router-dom";
import UserSideAbi from "../../utils/contractabis/UserSideAbi.json";
import GovernanceTokenAbi from "../../utils/contractabis/GovernanceTokenAbi.json";
import { BigNumber, ethers } from "ethers";
import {
  FormHelperText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Textarea,
  Heading,
  useToast,
  Avatar,
  Center,
  Image,
  Flex,
  Text,
  Stack,
  useColorModeValue,
  FormControl,
  FormLabel,
  Icon,
  Input,
  VisuallyHidden,
  chakra,
  Grid,
  GridItem,
  Tooltip,
  VStack,
  Divider,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  TabPanels,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Radio,
  RadioGroup,
  Select,
} from "@chakra-ui/react";

const IndividualDao = () => {
  const { daoId } = useParams();
  const toast = useToast();
  const [daoName, setDaoName] = useState("");
  const [daoDescription, setDaoDescription] = useState("");
  const [size, setSize] = useState("md");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [creatorId, setCreatorId] = useState(0);
  const [creatorInfo, setCreatorInfo] = useState();
  const [access, setAccess] = useState("loading");
  const [userRole, setUserRole] = useState(0);
  const [membersArray, setMembersArray] = useState([]);
  const [totalDaoMembers, setTotalDaoMembers] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [threshold, setThreshold] = useState();
  const [daoid, setDaoId] = useState();
  const [tokenAddress, setTokenAddress] = useState("");
  const [propSignal, setPropSignal] = useState(false);
  const [proposalArray, setProposalArray] = useState([]);
  const [userResponse, setUserResponse] = useState("");
  const [proposalForVote, setProposalForVote] = useState(0);

  const { safeAuthPack, safeAuthSignInResponse } = useContext(AuthContext);

  // add proposal
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  // to vote
  const {
    isOpen: isVoteOpen,
    onOpen: onVoteOpen,
    onClose: onVoteClose,
  } = useDisclosure();

  //start voting
  const {
    isOpen: isStartOpen,
    onOpen: onStartOpen,
    onClose: onStartClose,
  } = useDisclosure();

  //end voting
  const {
    isOpen: isEndOpen,
    onOpen: onEndOpen,
    onClose: onEndClose,
  } = useDisclosure();

  const handleSizeClick1 = (newSize) => {
    setSize(newSize);
    onAddOpen();
  };

  const handleSizeClick2 = (newSize) => {
    setSize(newSize);
    onVoteOpen();
  };

  const handleSizeClick3 = (newSize) => {
    setSize(newSize);
    onStartOpen();
  };

  const handleSizeClick4 = (newSize) => {
    setSize(newSize);
    onEndOpen();
  };

  //call
  const authorizeContract = async () => {
    //proposalForVote
    if (window?.ethereum?._state?.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideAddress = "0x0e339de1df4e7f4747Cc44aC5c13eF2B228E2bC2";
      const userSideContract = new ethers.Contract(
        "0x0e339de1df4e7f4747Cc44aC5c13eF2B228E2bC2",
        UserSideAbi,
        signer
      );
      const accounts = await provider.listAccounts();
      const propInfo = await userSideContract.proposalIdtoproposal(
        proposalForVote
      );
      const govTokenAdd = propInfo.governanceTokenAddress;
      var minThreshold = propInfo.votingThreshold;
      const govTokenContract = new ethers.Contract(
        govTokenAdd,
        GovernanceTokenAbi,
        signer
      );
      const tokenSymbol = await govTokenContract.symbol();
      console.log(tokenSymbol);
      const tx = await govTokenContract.approve(userSideAddress, minThreshold);
      await tx.wait();
      toast({
        title: "Congrats! Transaction Complete",
        description: `Your vote will be counted soon.`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      var ans = false;
      if (userResponse == "yes") {
        ans = true;
      }
      const tx2 = await userSideContract.voteForProposal(
        proposalForVote,
        ans,
        accounts[0]
      );
      await tx2.wait();
      toast({
        title: "Congrats.",
        description: `Your vote has been counted.`,
        status: "success",
        duration: 10000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  //view

  const getDaoInfo = async () => {
    if (window?.ethereum?._state?.accounts?.length !== 0 && daoId) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideContract = new ethers.Contract(
        "0x0e339de1df4e7f4747Cc44aC5c13eF2B228E2bC2",
        UserSideAbi,
        signer
      );
      const daoData = await userSideContract.daoIdtoDao(daoId);
      //console.log(daoData);
      setDaoName(daoData.daoName);
      setDaoDescription(daoData.daoDescription);
      setCreatorId(Number(daoData.creator));
      const totalMembers = Number(
        await userSideContract.getTotalDaoMembers(daoId)
      );
      const userInfo = await userSideContract.userIdtoUser(daoData.creator);
      setCreatorInfo(userInfo);
      setTotalDaoMembers(totalMembers);
    } else if (safeAuthSignInResponse?.eoa) {
      console.log("in else uf");
      console.log("safeAuthPack: " + safeAuthSignInResponse?.eoa);
      console.log("check provider: " + safeAuthPack?.getProvider());
      const provider = new ethers.providers.Web3Provider(
        safeAuthPack?.getProvider()
      );
      const signer = provider.getSigner();
      const userSideContract = new ethers.Contract(
        "0x7919303D9772b331F446e4eD2D1F20d1a9592CDE",
        UserSideAbi,
        signer
      );
      const daoData = await userSideContract.daoIdtoDao(daoId);
      //console.log(daoData);
      setDaoName(daoData.daoName);
      setDaoDescription(daoData.daoDescription);
      setCreatorId(Number(daoData.creator));
      const totalMembers = Number(
        await userSideContract.getTotalDaoMembers(daoId)
      );
      const userInfo = await userSideContract.userIdtoUser(daoData.creator);
      setCreatorInfo(userInfo);
      setTotalDaoMembers(totalMembers);
    }
  };

  //view

  const determineMembership = async () => {
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideContract = new ethers.Contract(
        "0x0e339de1df4e7f4747Cc44aC5c13eF2B228E2bC2",
        UserSideAbi,
        signer
      );
      const accounts = await provider.listAccounts();
      const tempUserId = await userSideContract.userWallettoUser(accounts[0]);
      const tempRoleId = Number(
        await userSideContract.userIdtoDaoIdtorole(tempUserId, daoId)
      );
      console.log("user Role " + tempRoleId);
      setUserRole(tempRoleId);
      if (tempRoleId == 0) {
        setAccess("denied");
      } else {
        setAccess("granted");
      }
    } else if (safeAuthSignInResponse?.eoa) {
      console.log("in else uf");
      const provider = new ethers.providers.Web3Provider(
        safeAuthPack?.getProvider()
      );

      console.log("check mem provider: " + provider);
      const signer = provider.getSigner();
      const userSideContract = new ethers.Contract(
        "0x7919303D9772b331F446e4eD2D1F20d1a9592CDE",
        UserSideAbi,
        signer
      );
      const accounts = await provider.listAccounts();
      const tempUserId = await userSideContract.userWallettoUser(accounts[0]);
      const tempRoleId = Number(
        await userSideContract.userIdtoDaoIdtorole(tempUserId, daoId)
      );
      console.log("user Role " + tempRoleId);
      setUserRole(tempRoleId);
      if (tempRoleId == 0) {
        setAccess("denied");
      } else {
        setAccess("granted");
      }
    }
  };

  useEffect(() => {
    return () => {
      getDaoInfo().then(() => {
        determineMembership();
      });
    };
  }, []);

  const loadAllProposals = async () => {
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideContract = new ethers.Contract(
        "0x0e339de1df4e7f4747Cc44aC5c13eF2B228E2bC2",
        UserSideAbi,
        signer
      );
      //const accounts = await provider.listAccounts();
      const totalProposals = Number(
        await userSideContract.getTotalProposals(BigInt(daoId))
      );
      let tempProposalId,
        tempProposalInfo,
        governanceTokenContract,
        tokenSymbol,
        tokenName;
      for (let i = 0; i < totalProposals; i++) {
        tempProposalId = Number(
          await userSideContract.getDaoProposalId(daoId, i)
        );
        tempProposalInfo = await userSideContract.proposalIdtoproposal(
          tempProposalId
        );
        governanceTokenContract = new ethers.Contract(
          tempProposalInfo.governanceTokenAddress,
          GovernanceTokenAbi,
          signer
        );
        tokenSymbol = await governanceTokenContract.symbol();
        tokenName = await governanceTokenContract.name();
        console.log(tokenSymbol);
        console.log(tokenName);
        console.log(tempProposalInfo);
        setProposalArray((prevState) => [
          ...prevState,
          {
            proposalInfo: tempProposalInfo,
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
          },
        ]);
      }
      setPropSignal(true);
    }
  };

  const handleSizeClick = (newSize) => {
    setSize(newSize);

    onOpen();
  };

  const createProposal = async () => {
    if (window?.ethereum?._state?.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        "0x0e339de1df4e7f4747Cc44aC5c13eF2B228E2bC2",
        UserSideAbi,
        signer
      );
      const accounts = await provider.listAccounts();
      const tx = await contract.createProposal(
        title,
        description,
        threshold,
        daoId,
        tokenAddress,
        accounts[0]
      );
      await tx.wait();
      toast({
        title: "Proposal Created",
        description: "Proposal has been created. You can open voting now.",
        status: "success",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });
    } else {
      const provider = new ethers.providers.Web3Provider(
        safeAuthPack?.getProvider()
      );

      const signer = provider.getSigner();
      console.log("signer", signer);
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer,
      });

      const safeAddress = safeAuthSignInResponse?.safes[0];

      const safe = await Safe.create({
        ethAdapter,
        safeAddress: safeAddress,
      });

      console.log("protocolKit", safe);

      const relaykit = new GelatoRelayPack(import.meta.env.VITE_GELATO_API_KEY);

      const contract = new ethers.Contract(
        "0x7919303D9772b331F446e4eD2D1F20d1a9592CDE",
        UserSideAbi,
        signer
      );

      console.log(safeAuthSignInResponse?.eoa);
      console.log(title);
      console.log(description);
      console.log(threshold);
      console.log(daoId);
      console.log(tokenAddress);

      const data = contract.interface.encodeFunctionData(
        "createProposal(string memory _proposalTitle,string memory _proposalDescription,uint256 _votingThreshold,uint256 _daoId,address _governanceTokenAddress,address _userWalletAddress)",
        [
          title,
          description,
          threshold,
          daoId,
          tokenAddress,
          safeAuthSignInResponse?.eoa,
        ]
      );

      const transactions = [
        {
          to: "0x7919303D9772b331F446e4eD2D1F20d1a9592CDE",
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
    }
  };

  if (access == "loading") {
    return <Center>Loading...</Center>;
  } else if (access == "denied") {
    return <Center>Access Denied. You are not a part of this dao.</Center>;
  }

  return (
    <div>
      <div>This is dao number: {daoId}</div>
      <div>Dao Name: {daoName}</div>
      <div> Dao description: {daoDescription} </div>
      <div> Creator Id: {creatorId} </div>
      <div> Total Members: {totalDaoMembers} </div>
      <div>
        {" "}
        Creator Name and Wallet Address: {creatorInfo.userName} -{" "}
        {creatorInfo.userWallet}
      </div>

      {(userRole == 1 || userRole == 2) && (
        <Button mt="2%" m={2} onClick={() => handleSizeClick1("xl")}>
          Add Proposal{" "}
        </Button>
      )}

      {userRole == 1 && (
        <Button mt="2%" m={2} onClick={() => handleSizeClick2("xl")}>
          Start Voting{" "}
        </Button>
      )}

      {userRole == 1 && (
        <Button mt="2%" m={2} onClick={() => handleSizeClick3("xl")}>
          End Voting{" "}
        </Button>
      )}

      <Divider mt={12} mb={12} />
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(2, 1fr)",
        }}
        gap={4}
      >
        <GridItem colSpan={3}>
          <VStack alignItems="flex-start" spacing="20px">
            <chakra.h2 fontSize="3xl" fontWeight="700">
              All proposals
            </chakra.h2>
          </VStack>
        </GridItem>
      </Grid>
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(1, 1fr)",
          md: "repeat(1, 1fr)",
        }}
        gap={4}
      >
        <GridItem colSpan={3}>
          {propSignal ? (
            <Tabs>
              <TabList>
                <Tab>Ongoing</Tab>
                <Tab>Upcoming</Tab>
                <Tab>Past</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <TableContainer>
                    <Table variant="simple">
                      <TableCaption>All Proposals</TableCaption>
                      <Thead>
                        <Tr>
                          <Th>Proposal Id.</Th>
                          <Th> Title</Th>
                          <Th>Description</Th>
                          <Th>Votin Token</Th>
                          <Th>Voting Threshold</Th>
                          <Th>Token Address</Th>
                          <Th>Vote</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {proposalArray
                          .filter(
                            (proposal) =>
                              proposal.proposalInfo.proposalStage == 1 //ongoing events
                          )
                          .map((proposal) => (
                            <Tr>
                              <Td>
                                {Number(proposal.proposalInfo.proposalId)}
                              </Td>
                              <Td>{proposal.proposalInfo.proposalTitle}</Td>
                              <Td>
                                {proposal.proposalInfo.proposalDesription}
                              </Td>
                              <Td>{proposal.tokenName}</Td>
                              <Td>
                                {Number(proposal.proposalInfo.votingThreshold)}{" "}
                                {proposal.tokenSymbol}
                              </Td>
                              <Td>
                                {proposal.proposalInfo.governanceTokenAddress}
                              </Td>
                              <Td>
                                <Button
                                  onClick={() => {
                                    setProposalForVote(
                                      Number(proposal.proposalInfo.proposalId)
                                    );
                                    handleSizeClick2();
                                  }}
                                >
                                  Vote Now
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </TabPanel>
                <TabPanel>
                  <TableContainer>
                    <Table variant="simple">
                      <TableCaption>All Proposals</TableCaption>
                      <Thead>
                        <Tr>
                          <Th>Proposal Id.</Th>
                          <Th> Title</Th>
                          <Th>Description</Th>
                          <Th>Votin Token</Th>
                          <Th>Voting Threshold</Th>
                          <Th>Token Address</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {proposalArray
                          .filter(
                            (proposal) =>
                              proposal.proposalInfo.proposalStage == 0 //for upcoming events
                          )
                          .map((proposal) => (
                            <Tr>
                              <Td>
                                {Number(proposal.proposalInfo.proposalId)}
                              </Td>
                              <Td>{proposal.proposalInfo.proposalTitle}</Td>
                              <Td>
                                {proposal.proposalInfo.proposalDesription}
                              </Td>
                              <Td>{proposal.tokenName}</Td>
                              <Td>
                                {Number(proposal.proposalInfo.votingThreshold)}{" "}
                                {proposal.tokenSymbol}
                              </Td>
                              <Td>
                                {proposal.proposalInfo.governanceTokenAddress}
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </TabPanel>
                <TabPanel>
                  <TableContainer>
                    <Table variant="simple">
                      <TableCaption>All Proposals</TableCaption>
                      <Thead>
                        <Tr>
                          <Th>Proposal Id.</Th>
                          <Th> Title</Th>
                          <Th>Description</Th>
                          <Th>Votin Token</Th>
                          <Th>Voting Threshold</Th>
                          <Th>Token Address</Th>
                          <Th>Results</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {proposalArray
                          .filter(
                            (proposal) =>
                              proposal.proposalInfo.proposalStage == 2 //for past events
                          )
                          .map((proposal) => (
                            <Tr>
                              <Td>
                                {Number(proposal.proposalInfo.proposalId)}
                              </Td>
                              <Td>{proposal.proposalInfo.proposalTitle}</Td>
                              <Td>
                                {proposal.proposalInfo.proposalDesription}
                              </Td>
                              <Td>{proposal.tokenName}</Td>
                              <Td>
                                {Number(proposal.proposalInfo.votingThreshold)}{" "}
                                {proposal.tokenSymbol}
                              </Td>
                              <Td>
                                {proposal.proposalInfo.governanceTokenAddress}
                              </Td>
                              <Td>
                                <Button onClick={handleSizeClick2}>
                                  View Results
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <Button onClick={loadAllProposals}>Load Proposals</Button>
          )}
        </GridItem>
      </Grid>

      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Proposal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mr="5%" isRequired>
              <FormLabel htmlFor="subject" fontWeight={"normal"}>
                Proposal Title
              </FormLabel>
              <Input
                id="subject"
                placeholder="Enter Proposal Title"
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>
            <FormControl mt={1} isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="md"
                color="gray.700"
                _dark={{
                  color: "gray.50",
                }}
              >
                Proposal Description
              </FormLabel>
              <Textarea
                placeholder="Write a short description for proposal"
                rows={3}
                shadow="sm"
                focusBorderColor="brand.400"
                fontSize={{
                  sm: "sm",
                }}
                onChange={(e) => setDescription(e.target.value)}
              />
              <FormHelperText>Short desc. URLs are hyperlinked.</FormHelperText>
            </FormControl>
            <FormControl mr="2%" mt="2%" isRequired>
              <FormLabel htmlFor="name" fontWeight={"normal"}>
                Threshold
              </FormLabel>
              <Input
                id="threshholdToken"
                placeholder="Minimum tokens required to join DAO"
                autoComplete="email"
                onChange={(e) => setThreshold(e.target.value)}
              />
            </FormControl>
            <FormControl mr="2%" mt="2%" isRequired>
              <FormLabel htmlFor="name" fontWeight={"normal"}>
                Token Address
              </FormLabel>
              <Input
                id="tokenAddress"
                placeholder="Token address of proposal token"
                onChange={(e) => setTokenAddress(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={createProposal}>Submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isVoteOpen} onClose={onVoteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cast Your Vote</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Select
              onChange={(e) => {
                setUserResponse(e.target.value);
              }}
              placeholder="Select option"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </ModalBody>
          <Text ml={7} mt={2}>
            Please Authorize first and wait for the transaction to end. Then
            press Submit
          </Text>
          <ModalFooter>
            <Button
              onClick={() => {
                console.log(userResponse);
                console.log(proposalForVote);
                authorizeContract();
              }}
              colorScheme="orange"
              m={2}
            >
              Authorize & Vote
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default IndividualDao;
