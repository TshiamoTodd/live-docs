'use client'
import React, { useState } from 'react'
import { Button } from './ui/button'
import Image from 'next/image'
import { createDocument } from '@/lib/actions/room.actions'
import { useRouter } from 'next/navigation'

const AddDocumentBtn = ({userId, email}: AddDocumentBtnProps) => {
    const [loading, setLoading] = useState(false)

    const router = useRouter()
    const addDocumentHandler = async () => {
        setLoading(true)
        try {
            const room = await createDocument({userId, email})
            
            if (room) router.push(`/documents/${room.id}`)
        } catch (error) {
            console.error(error)
            // add toast
        }

        setLoading(false)
    }
  return (
    <Button
        type='submit'
        onClick={addDocumentHandler}
        className='gradient-blue flex gap-1 shadow-md'
        disabled={loading}
    >
        {loading ? (
            <Image
                src={'/assets/icons/loading.svg'}
                alt='loading'
                width={24}
                height={24}
            />
        ) : (
            <>
                <Image
                    src={'/assets/icons/add.svg'}
                    alt='Add document'
                    width={24}
                    height={24}
                />
                <p className='hidden sm:block'>Start a blank document</p>
            </>
        )}
    </Button>
  )
}

export default AddDocumentBtn