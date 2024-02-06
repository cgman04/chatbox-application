import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModal from '../components/miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import './styles.css';
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client';
import Lottie from 'react-lottie';
import animationData from '../Animation/typing.json';

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

    const toast = useToast();

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            setLoading(true);

            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);

            setMessages(data);
            setLoading(false);
            socket.emit('Join Chat', selectedChat._id);
        } catch (error) {
            toast({
                title: "Error Occurred",
                description: 'Failed to load message',
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'bottom',
            });
        }
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit('setup', user);
        socket.on('connected', () => setSocketConnected(true));
        socket.on('Typing', () => setIsTyping(true));
        socket.on('Stop Typing', () => setIsTyping(false));

    }, []);


    useEffect(() => {
        fetchMessages();

        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        socket.on('Message Received', (newMsgReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMsgReceived.chat._id) {
                if (!notification.includes(newMsgReceived)) {
                    setNotification([newMsgReceived, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMsgReceived]);
            }
        });
    });


    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit('Stop Typing', selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };

                setNewMessage('');
                const { data } = await axios.post('/api/message', {
                    content: newMessage,
                    chatId: selectedChat._id,
                }, config);

                socket.emit('New Message', data);
                setMessages([...messages, data]);

            } catch (error) {
                toast({
                    title: "Error Occurred",
                    description: 'Failed to send message',
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                    position: 'bottom',
                });
            }
        }
    };

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        // Typing indicator logic
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true)
            socket.emit('Typing', selectedChat._id);
        }
        let lastTimeTyping = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var currentTime = new Date().getTime();
            var timeDifference = currentTime - lastTimeTyping;

            if (timeDifference >= timerLength && typing) {
                socket.emit('Stop Typing', selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };


    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: '28px', md: '30px' }}
                        pb={3}
                        px={2}
                        w='100%'
                        fontFamily='Noto sans'
                        display='flex'
                        justifyContent={{ base: 'space-between' }}
                        alignItems='center'
                    >
                        <IconButton display={{ base: 'flex', md: 'none' }} icon={<ArrowBackIcon />} onClick={() => setSelectedChat('')} />
                        {messages &&
                            (!selectedChat.isGroupChat ? (
                                <>
                                    {getSender(user, selectedChat.users)}
                                    <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                                </>
                            ) : (
                                <>
                                    {selectedChat.chatName.toUpperCase()}
                                    {<UpdateGroupChatModal fetchMessages={fetchMessages} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
                                </>
                            ))}
                    </Text>
                    <Box
                        display='flex'
                        flexDir='column'
                        justifyContent='flex-end'
                        p={3}
                        bg='#E8E8E8'
                        w='100%'
                        h='100%'
                        borderRadius='lg'
                        overflowY='hidden'
                    >
                        {loading ? (
                            <Spinner size='xl' w={20} h={20} alignSelf='center' margin='auto' />) : (
                            <div className='messages'>
                                <ScrollableChat messages={messages} />
                            </div>
                        )}

                        <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                            {isTyping ? <div><Lottie
                                options={defaultOptions}
                                width={70}
                                style={{ marginBottom: 15, marginLeft: 0 }}
                            /></div> : (<></>)}
                            <Input variant='outline' bg='gray.100' placeholder='Enter a message...' onChange={typingHandler} value={newMessage} />
                        </FormControl>
                    </Box>
                </>
            ) : (
                <Box display='flex' alignItems='center' justifyContent='center' h='100%'>
                    <Text fontSize='3xl' pb={3} fontFamily='Noto sans'>
                        Select a user or group to start chatting
                    </Text>
                </Box>
            )}
        </>
    );
};

export default SingleChat;