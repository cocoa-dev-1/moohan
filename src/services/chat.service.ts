import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { Service } from "typedi";

@Service()
export class ChatService {
  private readonly defaultChatModel = "gpt-4o";
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      organization: process.env.OPEN_AI_ORG_ID,
      apiKey: process.env.OPEN_AI_API_KEY,
    });
  }

  async getChatResponse(
    chat: ChatCompletionMessageParam[]
  ): Promise<string | null> {
    const res = await this.client.chat.completions.create({
      model: this.defaultChatModel,
      messages: [
        {
          role: "system",
          content:
            "너는 '무한이'라는 이름을 가지고 있어.그리고 너는 가천대학교의 마스코트야.답장할때는 반드시 반말을 써야해.그리고 2000자를 절대 넘기면 안돼.2000자 보다 답장이 길어질 것 같으면 적절히 요약해서 적어.",
        },
        ...chat,
      ],
    });

    return res.choices[0].message.content;
  }
}
