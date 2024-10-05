import { Discord, SimpleCommand, SimpleCommandMessage } from "discordx";
import { SchoolService } from "../services/school.service.js";

@Discord()
export class School {
  constructor(private readonly service: SchoolService) {}

  @SimpleCommand({
    aliases: ["ㅎㅅ"],
    name: "학식",
  })
  async findSchoolMeal(command: SimpleCommandMessage) {
    const meal = await this.service.getMeal();
    // if (command.message.channel.isSendable())
    //   await command.message.channel.send("그런거 없다");
    await command.message.reply(meal);
  }
}
