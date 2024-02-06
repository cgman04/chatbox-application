const asyncHandler = require("express-async-handler");
const Message = require('../models/messageModel');
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed to request");
        return res.status(400);
    }
    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate('sender', 'name pic');
        message = await message.populate('chat');
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name pic email',
        });

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message,
        });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId }).populate(
            'sender',
            'name pic email'
        ).populate('chat');

        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const markMessageAsRead = async (userId, messageId) => {
    try {
        const message = await Message.findById(messageId);
        if (message) {
            if (!message.readBy.includes(userId)) {
                message.readBy.push(userId);
                await message.save();
            }
        }
    } catch (error) {
        console.error("Error marking message as read:", error);
    }
};


const getUnreadMessagesForUser = async (userId) => {
    try {
        const unreadMessages = await Message.find({
            readBy: { $ne: userId }
        });
        return unreadMessages;
    } catch (error) {
        console.error("Error getting unread messages:", error);
        return [];
    }
};


module.exports = { sendMessage, allMessages, markMessageAsRead, getUnreadMessagesForUser };