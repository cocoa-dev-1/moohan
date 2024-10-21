import type { ArgsOf } from "discordx";
import { Discord, On } from "discordx";
import { ChatService } from "../services/chat.service.js";

@Discord()
export class Example {
  constructor(private readonly chatService: ChatService) {}

  @On()
  async messageCreate([message]: ArgsOf<"messageCreate">) {
    const args = message.content.split(" ");

    let messageContent: string | null = null;
    if (args[0] === "지피티") {
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

    const response = await this.chatService.getChatResponse(messageContent);
    if (response) {
      await message.reply(response);
    } else {
      await message.reply("대답 실패");
    }
  }
}
