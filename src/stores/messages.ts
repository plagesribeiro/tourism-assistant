import type {
	ChatCompletionMessage,
	ChatCompletionMessageParam
} from 'openai/resources/chat';
import { writable } from 'svelte/store';

export const messages = writable<ChatCompletionMessageParam[]>([]);

export const resetMessages = () => {
	messages.set([]);
};

export const addMessage = (message: ChatCompletionMessageParam) => {
	messages.update((messages) => [...messages, message]);
};
