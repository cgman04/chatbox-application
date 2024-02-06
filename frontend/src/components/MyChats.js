import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider';
import { Box, Button, Stack, Text, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
import { getSender } from '../config/ChatLogics';
import GroupChatModal from './miscellaneous/GroupChatModal';

const MyChats = ({ fetchAgain }) => {

    const [loggedUser, setLoggedUser] = useState();
    const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
    const toast = useToast();

    const fetchChats = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get('/api/chat', config);
            setChats(data);
        } catch (error) {
            toast({
                title: 'Error!',
                description: "Failed to load the chats",
                status: 'error',
                duration: 2000,
                isClosable: true,
                position: 'bottom-left',
            });
        }
    };


    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem('userInfo')));
        fetchChats();
    }, [fetchAgain]);


    return <Box
        display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
        flexDir='column'
        alignItems='center'
        p={3}
        bg='#fffaf0'
        width={{ base: '100%', md: '30%' }}
        borderRadius='lg'
        borderWidth='1px'
    >
        <Box
            pb={3}
            px={3}
            fontSize={{ base: '28px', md: '30px' }}
            fontFamily='Noto sans'
            display='flex'
            width='100%'
            justifyContent='space-between'
            alignItems='center'
        >
            My Chats
            <GroupChatModal>
                <Button
                    display='flex'
                    fontSize={{ base: '17px', md: '10px', lg: '17px' }}
                    leftIcon={<AddIcon />}
                    colorScheme='messenger'
                    variant='outline'
                > Group Chat
                </Button>
            </GroupChatModal>
        </Box>

        <Box
            display='flex'
            flexDir='column'
            p={3}
            bg='#fffaf0'
            width='100%'
            height='100%'
            borderRadius='lg'
        >
            {chats ? (
                <Stack className='scroll'>
                    {chats.map((chat) => (
                        <Box
                            key={chat._id}
                            onClick={() => setSelectedChat(chat)}
                            cursor='pointer'
                            bg={selectedChat === chat ? "#007acc" : "#E8E8E8"}
                            color={selectedChat === chat ? 'white' : 'black'}
                            px={3}
                            py={3}
                            borderRadius='lg'
                        >
                            <Text>
                                {!chat.isGroupChat ? getSender(loggedUser, chat.users) : (chat.chatName)}
                            </Text>
                            {chat.latestMessage && (
                                <Text fontSize="xs">
                                    <b>{chat.latestMessage.sender.name} : </b>
                                    {chat.latestMessage.content.length > 30
                                        ? chat.latestMessage.content.substring(0, 31) + "..."
                                        : chat.latestMessage.content}
                                </Text>
                            )}
                        </Box>
                    ))}
                </Stack>
            ) : (
                <ChatLoading />
            )}
        </Box>
    </Box>
};

export default MyChats;