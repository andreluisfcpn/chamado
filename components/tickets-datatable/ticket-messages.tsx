'use client'

import Link from 'next/link'
import { MessagesLoading } from '../message-loading'
import { Paperclip } from 'lucide-react'

type FileProps = { file: string }[]

type DataProps = {
  sender: { name: string; id: string }
  content: string
  createdAt: string
  files: FileProps | null
}

interface TicketMessagesProps {
  messages: DataProps[]
  userId?: string
  isLoading?: boolean
  ticketStatus?: string
}

export function TicketMessages({
  messages,
  userId,
  isLoading,
  ticketStatus = 'OPEN',
}: TicketMessagesProps) {
  if (isLoading) {
    return <MessagesLoading isLoading={isLoading} />
  }

  return (
    <div>
      {messages.length > 0 ? (
        <div className="flex flex-col gap-2">
          {messages.map((message, index) => {
            const isLastMessage = index === 0
            const isClosed = ticketStatus === 'CLOSED'
            const isFromCurrentUser = message.sender.id === userId

            if (isLastMessage && isClosed) {
              return (
                <div
                  key={message.createdAt}
                  className={`bg-emerald-50 p-8 space-y-2 rounded-md my-1 w-[95%] 2xl:w-[85%] ${
                    isFromCurrentUser ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h1 className="text-emerald-600 font-semibold">
                      {message.sender.name}
                    </h1>
                    <small className="text-emerald-900">
                      {Intl.DateTimeFormat('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }).format(new Date(message.createdAt))}
                    </small>
                  </div>
                  <p className="whitespace-pre-wrap text-emerald-900">
                    {message.content}
                  </p>

                  {message.files && message.files.length > 0 && (
                    <div className="mt-6">
                      <p className="block mb-2 text-zinc-700 font-medium text-sm">
                        Anexos ({message.files.length}):
                      </p>
                      <ul className="list-inside space-y-1">
                        {message.files.map((messageFile, fileIndex) => (
                          <li key={fileIndex}>
                            <Link
                              href={messageFile.file}
                              target="_blank"
                              className="text-emerald-600 flex items-center gap-2"
                            >
                              <div className="p-2 bg-emerald-100 flex justify-center items-center rounded">
                                <Paperclip size={16} />
                              </div>
                              <span className="text-sm">
                                {messageFile.file.split('/').pop()}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            }

            // Outras mensagens
            if (isFromCurrentUser) {
              return (
                <div
                  key={message.createdAt}
                  className="bg-zinc-100 p-8 space-y-2 rounded-md my-1 w-[95%] 2xl:w-[85%] ml-auto"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h1 className="text-zinc-600 font-semibold">
                      {message.sender.name}
                    </h1>
                    <small>
                      {Intl.DateTimeFormat('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }).format(new Date(message.createdAt))}
                    </small>
                  </div>
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {message.files && message.files.length > 0 && (
                    <div className="mt-6">
                      <p className="block mb-2 text-zinc-700 font-medium text-sm">
                        Anexos ({message.files.length}):
                      </p>
                      <ul className="list-inside space-y-1">
                        {message.files.map((messageFile, fileIndex) => (
                          <li key={fileIndex}>
                            <Link
                              href={messageFile.file}
                              target="_blank"
                              className="text-primary flex items-center gap-2"
                            >
                              <div className="p-2 bg-orange-50 flex justify-center items-center rounded">
                                <Paperclip size={16} />
                              </div>
                              <span className="text-sm">
                                {messageFile.file.split('/').pop()}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            }

            return (
              <div
                key={message.createdAt}
                className="text-left bg-blue-50 p-8 space-y-2 rounded-md my-1 w-[95%] 2xl:w-[85%] mr-auto"
              >
                <div className="flex items-center justify-between gap-4">
                  <strong className="text-blue-900">
                    {message.sender.name}
                  </strong>
                  <small className="text-blue-900">
                    {Intl.DateTimeFormat('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(new Date(message.createdAt))}
                  </small>
                </div>
                <p className="whitespace-pre-wrap text-blue-900">
                  {message.content}
                </p>

                {message.files && message.files.length > 0 && (
                  <div className="mt-6">
                    <p className="block mb-2 text-zinc-700 font-medium text-sm">
                      Anexos ({message.files.length}):
                    </p>
                    <ul className="list-inside space-y-1">
                      {message.files.map((messageFile, fileIndex) => (
                        <li key={fileIndex}>
                          <Link
                            href={messageFile.file}
                            target="_blank"
                            className="text-primary flex items-center gap-2"
                          >
                            <div className="p-2 bg-blue-100 flex justify-center items-center rounded">
                              <Paperclip size={16} />
                            </div>
                            <span className="text-sm">
                              {messageFile.file.split('/').pop()}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div>Nenhuma mensagem encontrada.</div>
      )}
    </div>
  )
}
