'use server'

import {nanoid} from 'nanoid';
import { liveblocks } from '../liveblocks';
import { revalidatePath } from 'next/cache';
import { parseStringify } from '../utils';

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
            defaultAccesses: ['room:write']
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

        // TODO: bring this back later on
        // const hasAccess = Object.keys(room.usersAccesses).includes(userId);

        // if (!hasAccess) {
        //     throw new Error("You don't have access to this document");
        // }

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