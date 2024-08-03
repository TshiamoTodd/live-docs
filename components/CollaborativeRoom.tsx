'use client'

import { ClientSideSuspense, RoomProvider } from '@liveblocks/react/suspense'
import { Editor } from '@/components/editor/Editor'
import Header from '@/components/Header'
import { SignedIn, UserButton } from '@clerk/clerk-react'
import { SignedOut, SignInButton } from '@clerk/nextjs'
import React, { KeyboardEvent, useEffect, useRef, useState } from 'react'
import ActiveCollaborators from './ActiveCollaborators'
import { Input } from './ui/input'
import Image from 'next/image'
import { updateDocument } from '@/lib/actions/room.actions'
import Loader from './Loader'
import ShareModal from './ShareModal'

const CollaborativeRoom = ({roomId, roomMetadata, users, currentUserType}: CollaborativeRoomProps) => {

  const [editing, setEditing] = useState(false)
  const [Loading, setLoading] = useState(false)
  const [documentTitile, setDocumentTitile] = useState(roomMetadata.title)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const updateTitleHandler = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setLoading(true)
      
      try {
        if(documentTitile !== roomMetadata.title) {
          const updatedDocument = await updateDocument(roomId, documentTitile)

          if(updatedDocument) {
            setEditing(false)
          }
        }
      } catch (error) {
        console.log(error)
        // Add Toast
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setEditing(false)
        updateDocument(roomId, documentTitile)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [roomId, documentTitile])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current?.focus()
    }
  }, [editing])

  return (
      <RoomProvider id={roomId}>
        <ClientSideSuspense fallback={<Loader/>}>
          <div className='collaborative-room'>
            <Header>
              <div ref={containerRef} className='flex w-fit items-center justify-center gap-2'>
                  {editing && !Loading ? (
                    <Input
                      type='text'
                      value={documentTitile}
                      ref={inputRef}
                      placeholder='Enter title'
                      onChange={(e) => setDocumentTitile(e.target.value)}
                      onKeyDown={updateTitleHandler}
                      disabled={!editing}
                      className='document-title-input'
                    />
                  ) : (
                    <>
                      <p className='document-title'>{documentTitile}</p>
                    </>
                  )}

                  {currentUserType === 'editor' && !editing && (
                    <Image
                      src={'/assets/icons/edit.svg'}
                      alt='edit'
                      width={24}
                      height={24}
                      onClick={() => setEditing(true)}
                    />
                  )}

                  {currentUserType !== 'editor' && !editing && (
                    <p className='view-only-tag'>View Only</p>
                  )}

                  {Loading && <p className='text-sm text-gray-400'>Saving...</p>}
              </div>
              <div className='flex w-full flex-1 justify-end gap-2 sm:gap-3'>
                <ActiveCollaborators/>
                <ShareModal
                  roomId={roomId}
                  collaborators={users}
                  creatorId={roomMetadata.creatorId}
                  currentUserType={currentUserType}
                />
                <SignedOut>
                    <SignInButton/>
                </SignedOut>
                <SignedIn>
                    <UserButton/>
                </SignedIn>
              </div>
            </Header>
          <Editor
            roomId={roomId}
            currentUserType={currentUserType}
          />
          </div>
        </ClientSideSuspense>
      </RoomProvider>
  )
}

export default CollaborativeRoom