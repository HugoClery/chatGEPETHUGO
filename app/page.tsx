'use client';

import {ChatCompletionRequestMessage, Configuration, OpenAIApi} from "openai";
import {FormEvent, useRef, useState} from "react";
import {TextArea} from "~/app/src/components/TextArea";
import {Message} from "~/app/src/components/Message";
import {Loader} from "~/app/src/components/Loader"
import {useMutation} from "@tanstack/react-query";

const createChatCompletion = (messages: ChatCompletionRequestMessage[]) => {
    const configuration = new Configuration({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
    });
    const openai = new OpenAIApi(configuration);

    return openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messages,
    });
};



export default function Home() {
    const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);

    const ref = useRef<HTMLUListElement>(null);

    const mutation = useMutation(
        (newMessages: ChatCompletionRequestMessage[]) =>
        createChatCompletion(newMessages),
        {
            onSuccess: (response) => {
            const newText = response.data.choices[0].message?.content;

            if (!newText) {
                return;
            }

            setMessages((prevMessages) => [
             ...prevMessages,
            {
                role: 'assistant',
                content: newText,
            },
        ]);

        scrollToLastMessage();
        },
    }
    );

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const user = String(formData.get('user'));

        const newMessage = {
            role: 'user',
            content: user,
        } satisfies ChatCompletionRequestMessage;

        const newMessages = [...messages, newMessage];

        setMessages(newMessages);
        scrollToLastMessage();

        e.currentTarget.reset();

        mutation.mutate(newMessages);
    };

    const scrollToLastMessage = () => {
        setTimeout(() => {
            ref.current?.children[ref.current?.children.length - 1].scrollIntoView();
        }, 1);
    };

    return (
      <main className="m-auto max-w-xl flex flex-col px-2 py-8 hcontent-full">
          <div className="flex-1 flex flex-col gap-4 overflow-auto">
              <h1 className="text-3xl md:text-5xl font-bold text-center">ChatGEPETHUGO</h1>
              <ul ref={ref} className="flex flex-col flex-1">
                  {messages.map((message, i) => (
                      <Message message={message} key={message.content + i} />
                  ))}
                  {messages.length === 0 && <li>Aucun message, conversons!</li>}
                  {mutation.isLoading && (
                      <li className="flex items-center w-full p-4">
                          <Loader />
                          <p className="text-gray-300 animate-pulse">
                              ChatGEPETHUGO réfléchit...
                          </p>
                      </li>
                  )}
              </ul>
          </div>
          <form onSubmit={handleSubmit}>
              <fieldset disabled={mutation.isLoading} className="flex items-end gap-2">
                  <div className="flex-1">
                      <TextArea name="user" label="Votre message" />
                  </div>
                  <button
                      type="submit"
                      className="text-white disabled:dark:bg-blue-800 disabled:dark:text-gray-400 disabled:text-gray-400 disabled:bg-blue-300 disabled:cursor-not-allowed bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5  dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  >
                      Soumettre
                  </button>
              </fieldset>
          </form>
      </main>
  );
}