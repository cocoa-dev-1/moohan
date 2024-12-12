import type { ArgsOf } from "discordx";
import { Discord, On } from "discordx";
import { ChatService } from "../services/chat.service.js";
import { Message } from "discord.js";
import {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "openai/resources/index.js";

@Discord()
export class Example {
  constructor(private readonly chatService: ChatService) {}

  @On()
  async messageCreate([message]: ArgsOf<"messageCreate">) {
    if (message.system) return;

    const args = message.content.split(" ");

    let messageContent: string | null = null;
    if (args[0] === "무피티") {
      messageContent = args.slice(1).join(" ");
    } else if (
      message.channelId === process.env.CHAT_CHANNEL_ID &&
      !message.author.bot
    ) {
      messageContent = message.content;
    } else {
      return;
    }

    if (messageContent === null) return;

    const pastMessages = await this.findAllPastMessages(message);
    const postChat = this.convertToChat(pastMessages);

    const chatToSend: ChatCompletionMessageParam[] = [
      { role: "user", content: messageContent },
      {
        role: "user",
        content: [
          ...message.attachments
            .filter((attachment) =>
              ["image/gif", "image/png", "image/jpeg", "image/webp"].includes(
                attachment.contentType ?? ""
              )
            )
            .map<ChatCompletionContentPart>((attachment) => ({
              type: "image_url",
              image_url: {
                url: attachment.url,
              },
            })),
        ],
      },
      ...postChat,
    ];

    const response = await this.chatService.getChatResponse(
      chatToSend.reverse()
    );
    if (response) {
      const messages = this.splitMessage(response);
      for (const msg of messages) {
        await message.reply(msg);
      }
    } else {
      await message.reply("대답 실패");
    }
  }

  private convertToChat(
    messages: Message<boolean>[]
  ): { role: "assistant" | "user"; content: string }[] {
    return messages.map((msg) => ({
      role: msg.author.id === process.env.BOT_ID ? "assistant" : "user",
      content: msg.content,
    }));
  }

  private async findAllPastMessages(
    message: Message<boolean>
  ): Promise<Message<boolean>[]> {
    const messages = [];
    let currentMessage = message;
    while (currentMessage.reference) {
      const pastMessage = await currentMessage.fetchReference();
      messages.push(pastMessage);
      currentMessage = pastMessage;
    }

    return messages;
  }

  private splitMessage(message: string): string[] {
    const messages = [];
    let currentMessage = "";
    for (const word of message.split(" ")) {
      if (currentMessage.length + word.length > 2000) {
        messages.push(currentMessage);
        currentMessage = "";
      }
      currentMessage += word + " ";
    }
    messages.push(currentMessage);
    return messages;
  }
}
