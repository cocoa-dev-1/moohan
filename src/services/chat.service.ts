import OpenAI from "openai";
import { Service } from "typedi";

@Service()
export class ChatService {
  private readonly defaultChatModel = "gpt-4o-mini";
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      organization: process.env.OPEN_AI_ORG_ID,
      apiKey: process.env.OPEN_AI_API_KEY,
    });
  }

  async getChatResponse(
    chat: { role: "user" | "assistant"; content: string }[]
  ): Promise<string | null> {
    console.log(chat);
    const res = await this.client.chat.completions.create({
      model: this.defaultChatModel,
      messages: chat,
    });

    return res.choices[0].message.content;
  }
}
