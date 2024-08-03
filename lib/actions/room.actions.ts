'use server'

import {nanoid} from 'nanoid';
import { liveblocks } from '../liveblocks';
import { revalidatePath } from 'next/cache';
import { getAccessType, parseStringify } from '../utils';

export const createDocument = async ({userId, email}: CreateDocumentParams) => {
    const roomId = nanoid();

    try {
        const metadata = {
            creatorId: userId,
            email: email,
            title: 'Untitled',
        }

        const usersAccesses: RoomAccesses = {
            [email]: ['room:write'],
        }

        const room = await liveblocks.createRoom(roomId, {
            metadata,
            usersAccesses,
            defaultAccesses: []
        });

        revalidatePath('/');

        return parseStringify(room);
    } catch (error) {
        console.error("Error happened while creating a room",error);
        
    }
}

export const getDocument = async ({roomId, userId}: {roomId: string, userId: string}) => {
    try {
        const room = await liveblocks.getRoom(roomId);

        const hasAccess = Object.keys(room.usersAccesses).includes(userId);

        if (!hasAccess) {
            throw new Error("You don't have access to this document");
        }

        return parseStringify(room);
    } catch (error) {
        console.error("Error happened while fetching a room",error);
        
    }
}

export const updateDocument = async (roomId: string, title: string) => {
    try {
        const updatedRoom = await liveblocks.updateRoom(roomId, {
            metadata: {
                title,
            }
        })

        revalidatePath(`/documents/${roomId}`);
        return parseStringify(updatedRoom);
    } catch (error) {
        console.error("Error happened while updating a room",error);
        
    }
}

export const getDocuments = async (email: string) => {
    try {
        const rooms = await liveblocks.getRooms({userId: email});

        return parseStringify(rooms);
    } catch (error) {
        console.error("Error happened while fetching a rooms",error);
        
    }
}

export const getDocumentUsers = async ({roomId, currentUser, text}: {roomId: string, currentUser: string, text: string}) => {
    try {
        const room = await liveblocks.getRoom(roomId);
        
        const users = Object.keys(room.usersAccesses).filter((email) => email !== currentUser);

        if(text.length) {
            const lowerCaseText = text.toLowerCase();

            const filteredUsers = users.filter((email:string) => email.toLowerCase().includes(lowerCaseText));

            return parseStringify(filteredUsers);
        }

        return parseStringify(users);
    } catch (error) {
        console.error("Error happened while fetching a document users",error);
        
    }
}

export const updateDocumentAccess = async ({roomId, email, userType, updatedBy}: ShareDocumentParams) => {
    try {
        const usersAccesses: RoomAccesses = {
            [email]: getAccessType(userType) as AccessType,
        }

        const room = await liveblocks.updateRoom(roomId, {
            usersAccesses,
        });
        
        if(room) {
            // TODO: Send a notification to the user
        }

        revalidatePath(`/documents/${roomId}`);
        return parseStringify(room);
    } catch (error) {
        console.error("Error happened while updating a room access",error);
        
    }
}

export const removeCollaborator = async ({roomId, email}: {roomId: string, email: string}) => {
    try {
        const room = await liveblocks.getRoom(roomId);

        if(room.metadata.email === email) {
            throw new Error("You can't remove the owner of the document");
        }

        const updateRoom = await liveblocks.updateRoom(roomId, {
            usersAccesses: {
                [email]: null,
            }
        })

        revalidatePath(`/documents/${roomId}`);
        return parseStringify(updateRoom);

    } catch (error) {
        console.error("Error happened while removing a collaborator",error);
        
    }
}