<script lang="ts">
	import Fa from 'svelte-fa';
	import { faBan, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
	import { openai } from '../services/openai';
	import { addMessage, messages, resetMessages } from '../stores/messages';
	import { onMount } from 'svelte';
	import { startLocation } from '../stores/location';

	let inputContent = '';
	let loading = false;

	const tools = [
		{
			type: 'function',
			function: {
				name: 'search_maps',
				description:
					'Pesquisa no google maps por atividades relevantes para o usuário',
				parameters: {
					type: 'object',
					properties: {
						search_maps: {
							type: 'string',
							description:
								"Frase curta para pesquisar no google maps. Exemplo: 'trilhas', 'restaurantes', 'parques de diversão'"
						},
						max_price: {
							type: 'number',
							description:
								'Número de 1 a 5 que representa o preço máximo que o usuário quer pagar pela atividade. Exemplo: 3.'
						},
						max_time_in_minutes: {
							type: 'number',
							description:
								'Número inteiro que representa o tempo máximo que o usuário quer gastar em minutos para chegar até o local da atividade. Exemplo: 60.'
						},
						description: {
							type: 'string',
							description:
								"Descrição completa da atividade e experiência que o usuário quer fazer. Procure uma frase o mais específica possível com bastante detalhes. Exemplo: 'Quero fazer uma trilha em uma floresta com árvores e locais em que realmente posso me conectar com a natureza'."
						},
						open_now: {
							type: 'boolean',
							description:
								'Booleano que representa se o usuário quer que a atividade esteja aberta agora. Exemplo: true.'
						}
					},
					required: ['search_maps', 'description']
				}
			}
		}
	];
	import { afterUpdate } from 'svelte';
	import { setSearchParams } from '../stores/searchParams';
	import { nextStep } from '../stores/steps';

	let lastMessageElement: HTMLDivElement | undefined;

	afterUpdate(() => {
		if (lastMessageElement) {
			lastMessageElement.scrollIntoView({ behavior: 'smooth' });
		}
	});

	onMount(async () => {
		resetMessages();
		await startInteraction();
	});

	const sendMessage = async () => {
		if (loading) return;
		if (inputContent.trim() === '') return;

		loading = true;

		addMessage({
			content: inputContent.trim(),
			role: 'user'
		});

		inputContent = '';

		const resp = await openai.chat.completions.create({
			messages: $messages,
			model: 'gpt-4',
			tools: tools.map((tool) => ({ ...tool, type: 'function' })),
			tool_choice: 'auto'
		});

		const toolCalls = resp.choices[0].message.tool_calls;

		if (toolCalls) {
			addMessage({
				content:
					'Beleza, já tenho tudo que eu preciso. Vou dar uma pesquisada aqui para ver o que eu encontro para você.',
				role: 'assistant'
			});

			const argumentsObject = JSON.parse(toolCalls[0].function.arguments);

			setSearchParams({
				search_maps: argumentsObject.search_maps ?? '',
				max_price: argumentsObject.max_price ?? 0,
				max_time_in_minutes: argumentsObject.max_time_in_minutes ?? 0,
				description: argumentsObject.description ?? '',
				open_now: argumentsObject.open_now ?? false
			});

			await new Promise((resolve) => setTimeout(resolve, 3500));

			loading = false;

			nextStep();
		} else {
			const finalResp = resp.choices[0].message.content;

			addMessage({
				content: finalResp,
				role: 'assistant'
			});

			loading = false;
		}
	};

	const startInteraction = async () => {
		loading = true;

		addMessage({
			content: `
				Você é o John, um assistente de viagem que ajuda pessoas a escolherem atividades para fazer em suas viagens. Você está conversando com o usuário e quer ajudá-lo a escolher a sua próxima atividade. Você já sabe que o usuário está na seguinte localização:
				Endereço: ${$startLocation?.address},
				Cidade: ${$startLocation?.city},
				Estado: ${$startLocation?.state},
				País: ${$startLocation?.country}.
				Fale de maneira decontraida e amigavel. Escreva mensagens bem curtas e objetivas. Não dê opiniões nem sugestões, apenas entenda o que o usuário quer fazer.
				O seu objetivo é colher do usuário as seguintes informações:
				{
					"search_maps": frase curta para pesquisar no google maps. Exemplo: "trilhas", "restaurantes", "parques de diversão"
					"max_price": Número de 1 a 5 que representa o preço máximo que o usuário quer pagar pela atividade. Exemplo: 3.
					"max_time_in_minutes": Número inteiro que representa o tempo máximo que o usuário quer gastar em minutos para chegar até o local da atividade. Exemplo: 60.
					"description": : Descrição completa da atividade e experiência que o usuário quer fazer. Exemplo: "Quero fazer uma trilha em uma floresta com árvores e locais em que realmente posso me conectar com a natureza".
					"open_now": Booleano que representa se o usuário quer que a atividade esteja aberta agora. Exemplo: true.
				}.
				Mas seja discreto ao colher essas informações e não seja muito persistente. Mas peça para o usuário ser o mais específico possível e seja o mais detalhista possível no campo description.
			`,
			role: 'system'
		});

		const resp = await openai.chat.completions.create({
			messages: [
				{
					content: `Escreva uma mensagem se apresentando como o John  e dizendo que você é um assistente de viagem e que vai ajudar o usuário a escolher a sua próxima atividade. Fale também que você ja descobriu que ele está na seguinte localização: 
					Endereço: ${$startLocation?.address},
					Cidade: ${$startLocation?.city},
					Estado: ${$startLocation?.state},
					País: ${$startLocation?.country}.
					Fale de maneira decontraida e amigavel. Escreva mensagens bem curtas e objetivas. Não dê opiniões nem sugestões, apenas entenda o que o usuário quer fazer.
					`,
					role: 'user'
				}
			],
			model: 'gpt-4'
		});

		const firstMessage = resp.choices[0].message.content;

		addMessage({
			content: firstMessage,
			role: 'assistant'
		});

		loading = false;
	};
</script>

<div class="flex flex-col w-full h-full overflow-auto">
	<div class="border rounded-lg h-full overflow-auto p-3 flex flex-col gap-3">
		<div class="w-full h-fit flex flex-col gap-2">
			{#each $messages as message, index}
				{#if message.role === 'user'}
					<div class="chat chat-end">
						<div class="chat-bubble chat-bubble-primary">
							{message.content}
						</div>
					</div>
				{:else if message.role === 'assistant'}
					<div class="chat chat-start">
						<div
							class="chat-bubble chat-bubble-secondary"
							bind:this={lastMessageElement}
						>
							{message.content}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>

	<div class="w-full flex items-center gap-2 p-4">
		<input
			type="text"
			placeholder="Digite aqui"
			class="input input-bordered w-full"
			bind:value={inputContent}
			on:keydown={(e) => {
				if (e.key === 'Enter') {
					sendMessage();
				}
			}}
		/>
		{#if loading}
			<button class="btn btn-sm btn-ghost" on:click={sendMessage}>
				<span class="loading loading-dots loading-md" />
			</button>
		{:else}
			<button class="btn btn-sm btn-ghost" on:click={sendMessage}>
				<Fa icon={faPaperPlane} size={'1.2x'} />
			</button>
		{/if}

		{#if $messages.length > 0}
			<button
				class="btn btn-sm btn-ghost"
				on:click={resetMessages}
				disabled={loading}
			>
				<Fa icon={faBan} size={'1.2x'} />
			</button>
		{/if}
	</div>
</div>
