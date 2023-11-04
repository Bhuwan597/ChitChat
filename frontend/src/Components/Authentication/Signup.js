import {
    Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import axios from 'axios'
import {useHistory} from 'react-router-dom'



const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [picture, setPicture] = useState('');
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)  
  const toast = useToast()
  const history = useHistory()

    function handleClick(e){
        e.stopPropagation()
        setShow(!show)
    }

    function postDetails(file){
        setLoading(true)
        if(file === undefined){
          toast({
            title: 'Please Select an Image',
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: 'bottom'
          })
          return
        }
        if(file.type === 'image/jpeg'|| file.type === 'image/jpg' || file.type === 'image/png'){
          const data = new FormData()
          data.append('file', file)
          data.append('upload_preset', 'chatApp')
          fetch('https://api.cloudinary.com/v1_1/dq0ueqiga/image/upload',{
            method: 'POST',
            body: data,
          }).then(res=>res.json())
          .then(data=>{
            setPicture(data.url.toString())
            toast({
              title: 'Image Uploaded',
              status: 'success',
              duration: 5000,
              isClosable: true,
              position: 'bottom'
            })
            console.log(data.url.toString())
            setLoading(false)
          }).catch(err=>{
            toast({
              title: 'Error uploading image!',
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'bottom'
            })
            console.log(err)
            setLoading(false)
          })
        }else{
          toast({
            title: 'Please Select an Image',
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: 'bottom'
          })
        }
    }

    async function submitHandle(){
      if(!name || !email || !password || !confirmPassword){
        toast({
          title: 'Please enter all the fields.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'bottom'
        })
        return;
      }
      if(password !== confirmPassword){
        toast({
          title: 'Password does not match.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'bottom'
        })
        return;
      }

      try {
        const config = {
          headers: {
            'Content-type': 'application/json'
          }
        }
        const {data} = await axios.post('/api/user',{
          name,
          email,
          password,
          picture
        }, config)

        toast({
          title: 'Registration Successfull!',
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
      <FormControl id="first-name" isRequired>
        <FormLabel>Name:</FormLabel>
        <Input
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
          autoComplete='on'
        ></Input>
      </FormControl>
      <FormControl id="email" isRequired>
        <FormLabel>Email:</FormLabel>
        <Input
          type="email"
          placeholder="Enter your email address"
          onChange={(e) => setEmail(e.target.value)}
          autoComplete='on'
        ></Input>
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password:</FormLabel>
        <InputGroup>
          <Input
            type={show?"text":"password"}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            autoComplete='on'
          ></Input>
          <InputRightElement width={"4.5em"}> 
          <Button h={'1.75rem'} size={'sm'} onClick={handleClick}>
            {show?"Hide":"Show"}
          </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="confirm-password" isRequired>
        <FormLabel>Confirm Password:</FormLabel>
        <InputGroup>
          <Input
            type={show?"text":"password"}
            placeholder="Confirm your password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete='on'
          ></Input>
          <InputRightElement width={"4.5em"}> 
          <Button h={'1.75rem'} size={'sm'} onClick={handleClick}>
            {show?"Hide":"Show"}
          </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="profile-picture">
        <FormLabel>Profile Picture:</FormLabel>
        <Input
          type="file"
          p={'1.5'}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        ></Input>
      </FormControl>
      <Button colorScheme='blue' width={'100%'} mt={'1.5'} onClick={submitHandle} isLoading={loading}>Signup</Button>
      </form>
    </VStack>
  );
};

export default Signup;
