import { BellIcon, ChevronDownIcon, Search2Icon } from '@chakra-ui/icons';
import {
    Avatar,
    Box,
    Button,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Input,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Spinner,
    Text,
    Tooltip,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import { Effect } from 'react-notification-badge';
import NotificationBadge from 'react-notification-badge';

const SidePanel = () => {
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();
    const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
    const history = useHistory();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();


    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        history.push('/');
    };

    const handleSearch = async () => {
        if (!search) {
            toast({
                title: 'Please search for a user',
                status: 'warning',
                duration: 2000,
                isClosable: true,
                position: 'top-left',
            });
            return;
        }

        try {
            setLoading(true)

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);

            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: 'Error!',
                description: 'Failed to load search results',
                status: 'error',
                duration: 2000,
                isClosable: true,
                position: 'bottom-left',
            });
        }
    };


    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);

            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post('/api/chat', { userId }, config);

            if (!chats.find((c) => c.id === data._id)) setChats([data, ...chats]); /* if the chat is found within the list of chats, the list will be appended to included the chat */

            setSelectedChat(data);
            setLoadingChat(false);
            onClose();
        } catch (error) {
            toast({
                title: 'Failed to fetch the chat',
                description: error.message,
                status: 'error',
                duration: 2000,
                isClosable: true,
                position: 'bottom-left',
            });
        }
    };

    return <>
        <Box display='flex' justifyContent='space-between' alignItems='center' bg='#fffaf0' w='100%' p='5px 10px 5px 10px' borderWidth='5px' borderRadius='20px' mt='5px'>
            <Tooltip label='Search users to chat with' hasArrow bg='black' color='white' borderRadius='5px' placement='bottom-end'>
                <Button variant='outline' colorScheme='messenger' onClick={onOpen}>
                    <Search2Icon />
                    <Text display={{ base: 'none', md: 'flex' }} px='3'>Search User</Text>
                </Button>
            </Tooltip>

            <Text fontSize='3xl' fontWeight='bold' fontFamily='Noto sans'>Chat<span className='box'> [</span>Box<span className='box'>]</span></Text>
            <div>
                <Menu>
                    <MenuButton p={1}>
                        <NotificationBadge
                            count={notification.length}
                            effect={Effect.SCALE}
                        />
                        <BellIcon fontSize='xx-large' color='#0066cc' m={1} />
                    </MenuButton>
                    <MenuList pl={1}>
                        {!notification.length && "Nothing to see here"}
                        {notification.map((n) => (
                            <MenuItem key={n._id} onClick={() => {
                                setSelectedChat(n.chat);
                                setNotification(notification.filter((notif) => notif !== n));
                            }}>
                                {n.chat.isGroupChat ? `New Message in ${n.chat.chatName}` : `New Message from ${getSender(user, n.chat.users)}`}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
                <Menu>
                    <MenuButton as={Button} variant='outline' colorScheme='messenger' ml={3} rightIcon={<ChevronDownIcon />}>
                        <Avatar size='sm' cursor='pointer' name={user.name} src={user.pic} />
                    </MenuButton>
                    <MenuList>
                        <ProfileModal user={user}>
                            <MenuItem>My Profile</MenuItem>
                        </ProfileModal>
                        <MenuDivider />
                        <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </div>
        </Box >

        <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay />
            <DrawerContent>
                <DrawerHeader borderBottomWidth='1px' textAlign='center'>Find Users</DrawerHeader>
                <DrawerBody>
                    <Box display='flex' pb={2}>
                        <Input placeholder="Search for a user..." mr={2} value={search} onChange={(e) => setSearch(e.target.value)} />
                        <Button onClick={handleSearch}>Search</Button>
                    </Box>
                    {loading ? (<ChatLoading />) : (searchResult?.map((user) => (
                        <UserListItem key={user._id} user={user} handleFunction={() => accessChat(user._id)} />
                    ))
                    )}
                    {loadingChat && <Spinner ml='auto' display='flex' />}
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    </>;
};

export default SidePanel;