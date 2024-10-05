import { parse, TextNode } from "node-html-better-parser";
import { Service } from "typedi";
import { DateTime } from "luxon";

@Service()
export class SchoolService {
  public async getSchools() {
    return ["school1", "school2"];
  }

  async getMeal() {
    const res = await fetch("https://www.gachon.ac.kr/kor/7347/subview.do");
    const text = await res.text();

    const root = parse(text, {
      script: false,
      style: false,
    });

    const table = root.querySelector(
      "body .wrap-contents .contents #contentsEditHtml #_contentBuilder #_JW_diet_basic #viewForm .table_1 table tbody"
    );

    if (!table) return "그런거 없다.";

    let result: string = "";

    const today = DateTime.now().setZone("Asia/Seoul").toFormat("yyyy.MM.dd");

    const rows = table.querySelectorAll("tr");
    let isToday = false;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      switch ((i + 1) % 4) {
        case 1:
          const dateCell = row.querySelector("th");
          const cellDate = dateCell?.childNodes[0].text ?? "";

          if (cellDate.trim() === today) isToday = true;
          else isToday = false;

          break;
        case 2:
          if (!isToday) break;
          const launchA = row.querySelectorAll("td");
          const laText = launchA
            .map((td) =>
              td.childNodes.map((child) =>
                child instanceof TextNode ? child.text : null
              )
            )
            .flat()
            .filter((v) => v != null)
            .join("\n");
          result += `${laText}\n\n`;

          break;
        case 3:
          if (!isToday) break;

          const launchB = row.querySelectorAll("td");
          const lbText = launchB
            .map((td) =>
              td.childNodes.map((child) =>
                child instanceof TextNode ? child.text : null
              )
            )
            .flat()
            .filter((v) => v != null)
            .join("\n");
          result += `${lbText}\n\n`;

          break;
        default:
          break;
      }
    }

    if (result === "") return "그런거 없다.";
    return result;
  }
}
