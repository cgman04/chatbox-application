export const getSender = (loggedUser, users) => {
    return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
};

export const getSenderFull = (loggedUser, users) => {
    return users[0]._id === loggedUser._id ? users[1] : users[0].name;
};

export const isSameSender = (messages, msg, i, userId) => {
    return (
        i < messages.length - 1 &&
        (messages[i + 1].sender._id !== msg.sender._id ||
            messages[i + 1].sender._id === undefined) &&
        messages[i].sender._id !== userId
    );
};

export const isLastMessage = (messages, i, userId) => {
    return (
        i === messages.length - 1 && /*if the latest msg is the last msg sent*/
        messages[messages.length - 1].sender._id !== userId && /*id of latest msg is not the logged in user*/
        messages[messages.length - 1].sender._id /*msg actually exists*/
    );
};

export const isSameSenderMargin = (messages, msg, i, userId) => {
    if (
        i < messages.length - 1 &&
        messages[i + 1].sender._id === msg.sender._id &&
        messages[i].sender._id !== userId
    )
        return 33;
    else if (
        (i < messages.length - 1 &&
            messages[i + 1].sender._id !== msg.sender._id &&
            messages[i].sender._id !== userId) ||
        (i === messages.length - 1 && messages[i].sender._id !== userId)
    )
        return 0;
    else return 'auto';
};

export const isSameUser = (messages, msg, i) => {
    return i > 0 && messages[i - 1].sender._id === msg.sender._id;
};