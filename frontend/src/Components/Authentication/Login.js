import {
  Button,
FormControl,
FormLabel,
Input,
InputGroup,
InputRightElement,
VStack,
useToast
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";



const Login = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [show, setShow] = useState(false)
const toast = useToast()
const history = useHistory()
const [loading, setLoading] = useState(false) 

  function handleClick(e){
      e.stopPropagation()
      setShow(!show)
  }


  async function submitHandle(){
    setLoading(true)
    if(!email || !password){
      toast({
        title: 'All fields are required!',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setLoading(false)
      return
    }

    try {
      const config = {
        headers: {
          'Content-type': 'application/json'
        }
      }
      const {data} = await axios.post('/api/user/login',{
        email,
        password,
      }, config)

      toast({
        title: 'Login Successfull!',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      localStorage.setItem('userInfo', JSON.stringify(data))
      setLoading(false)
      history.push('/chats')
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error Occured!',
        description: error.response.data.error,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setLoading(false)
    }
      
  }

return (
  <VStack spacing={"5px"}>
  <form style={{width:"100%"}}>
    <FormControl id="login-email" isRequired>
      <FormLabel>Email:</FormLabel>
      <Input
        type="email"
        placeholder="Enter your email address"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        autoComplete='on'
      ></Input>
    </FormControl>
    <FormControl id="login-password" isRequired>
      <FormLabel>Password:</FormLabel>
      <InputGroup>
        <Input
          type={show?"text":"password"}
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          autoComplete='on'
        ></Input>
        <InputRightElement width={"4.5em"}> 
        <Button h={'1.75rem'} size={'sm'} onClick={handleClick}>
          {show?"Hide":"Show"}
        </Button>
        </InputRightElement>
      </InputGroup>
    </FormControl>
    <Button colorScheme='blue' width={'100%'} mt={'1.5'} onClick={submitHandle} isLoading={loading}>Login</Button>
    </form>
  </VStack>
);
};

export default Login;
