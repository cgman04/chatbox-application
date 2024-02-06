import React, { useEffect } from 'react';
import { Container, Box, Text, Tabs, TabList, Tab, TabPanel, TabPanels } from '@chakra-ui/react';
import Login from '../components/Authentication/Login';
import SignUp from '../components/Authentication/SignUp';
import { useHistory } from 'react-router-dom';

const HomePage = () => {
    const history = useHistory();

    useEffect(() => {
        //fetching user info from localStorage and if that user is logged in, push user to chats page
        const user = JSON.parse(localStorage.getItem('userInfo'));

        if (user) {
            history.push('/chats');
        }
    }, [history]);

    return (
        <Container maxW='xl' centerContent>
            <Box display='flex' justifyContent='center' p={2} bg={'whitesmoke'} w='100%' m='40px 0 15px 0' borderRadius='lg' borderWidth='3px'>
                <Text fontSize='4xl' fontWeight='extrabold' fontFamily='Noto sans'>Chat<span className='box'> [</span>Box<span className='box'>]</span></Text>
            </Box>
            <Box bg={'whitesmoke'} w='100%' p={4} borderRadius='lg' borderWidth='3px'>
                <Tabs variant='soft-rounded' colorScheme='blue'>
                    <TabList mb='1em'>
                        <Tab width='50%'>Login</Tab>
                        <Tab width='50%'>Sign Up</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login />
                        </TabPanel>
                        <TabPanel>
                            <SignUp />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Container>
    );
};

export default HomePage;