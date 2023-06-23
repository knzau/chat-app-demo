import { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
	MainContainer,
	ChatContainer,
	MessageList,
	MessageInput,
	TypingIndicator,
	Message,
} from "@chatscope/chat-ui-kit-react";

import "./App.css";

function App() {
	const [typing, setTyping] = useState(false);
	const [messages, setMessages] = useState([{ message: "Hello, I am ChatGPT your chatBot", sender: "ChatGPT" }]);
	const API_KEY = "";
	console.log(API_KEY);
	const handleSend = async (message) => {
		const newMessage = {
			message: message,
			sender: "user",
			direction: "outgoing",
		};

		const newMessages = [...messages, newMessage]; //all the old messages, + the new message
		//update our message state
		setMessages(newMessages);

		//set a typing indicator (chatgpt is typing)
		setTyping(true);

		// process message to chatGPT (send it over)
		await processMessageToChatGPT(newMessages);
	};

	async function processMessageToChatGPT(chatMessages) {
		// chatMessages {sender: user or "ChatGPT", message: "the message"}
		// apiMessages {role: "user" or "assistant", content: "The message content"}
		let apiMessages = chatMessages.map((messageObj) => {
			let role = "";
			if (messageObj.sender === "ChatGPT") {
				role = "assistant";
			} else {
				role = "user";
			}

			return { role: role, content: messageObj.message };
		});

		const systemMessage = {
			role: "system",
			content: "Explain all concepts like I am 10 years old",
		};

		const apiRequestBody = {
			model: "gpt-3.5-turbo",
			messages: [systemMessage, ...apiMessages],
		};

		await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: "Bearer " + API_KEY,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(apiRequestBody),
		})
			.then((data) => {
				return data.json();
			})
			.then((data) => {
				const answer = data.choices[0].message.content;
				console.log(data.choices[0].message.content);
				setMessages([...chatMessages, { message: answer, sender: "ChatGPT" }]);
				setTyping(false);
			});
	}

	return (
		<div className="app">
			<div style={{ position: "relative", height: "800px", width: "700px" }}>
				<MainContainer>
					<ChatContainer>
						<MessageList
							scrollBehavior="smooth"
							typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing" /> : null}
						>
							{messages.map((message, i) => {
								return <Message key={i} model={message} />;
							})}
						</MessageList>
						<MessageInput placeholder="Type Message here" onSend={handleSend} />
					</ChatContainer>
				</MainContainer>
			</div>
		</div>
	);
}

export default App;
