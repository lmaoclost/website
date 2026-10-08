import rss from "@astrojs/rss";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { getPosts, slugify } from "../utils/blog";

const parser = new MarkdownIt();
const LIMITE = 20;

export async function GET(context) {
  const posts = (await getPosts()).slice(0, LIMITE);
  return rss({
    title: "RENAN",
    description: "Blog do Renan sobre desenvolvimento de software",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? "",
      pubDate: post.data.pubDate,
      link: `/blog/${slugify(post.data.title)}`,
      content: sanitizeHtml(parser.render(post.body ?? ""), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      }),
    })),
  });
}
