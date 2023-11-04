import React, { useEffect } from "react";
import {
  Container,
  Box,
  Text,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import Login from "../Components/Authentication/Login";
import Signup from "../Components/Authentication/Signup";
import { useHistory } from "react-router-dom";

const HomePage = () => {
  const history = useHistory()
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        if(userInfo){
          history.push('/chats')
        }
    }, [history])
  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p="3"
        m={"100%"}
        bg={"white"}
        margin={"40px 0 15px 0"}
        borderRadius={"lg"}
        borderWidth={"1px"}
      >
        <Text fontSize={"4xl"}>ChatApp</Text>
      </Box>
      <Box
        bg={"white"}
        width={"100%"}
        padding={"4"}
        borderRadius={"lg"}
        borderWidth={"1px"}
      >
        <Tabs variant="soft-rounded">
          <TabList mb={"1em"}>
            <Tab width={"50%"}>Login</Tab>
            <Tab width={"50%"}>Signup</Tab>
          </TabList>
          <TabPanels>
            <TabPanel><Login/></TabPanel>
            <TabPanel><Signup/></TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default HomePage;
