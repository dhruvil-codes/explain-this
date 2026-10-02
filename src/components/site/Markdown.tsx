/**
 * Shared Markdown renderer (PRD §7). GFM + sanitized. Code gets the mono
 * font; everything else inherits Instrument Serif. No dangerouslySetInnerHTML.
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/components/ui/cn";

export function Markdown({
  text,
  className,
}: {
  text: string;
  className?: string;
}): React.ReactElement {
  return (
    <div
      className={cn(
        "markdown-body space-y-4 text-[19px] leading-[1.6] [&_h1]:text-[28px] [&_h1]:leading-snug [&_h2]:text-[24px] [&_h2]:leading-snug [&_h3]:text-[21px] [&_h3]:leading-snug [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_li]:marker:text-muted [&_p]:text-pretty [&_pre]:overflow-x-auto [&_pre]:rounded-card [&_pre]:border [&_pre]:border-hairline [&_pre]:bg-accent-soft/40 [&_pre]:p-4 [&_pre]:text-[15px] [&_code]:font-mono [&_code]:text-[0.85em] [&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-accent-soft/60 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_a]:text-accent-ink [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted [&_table]:w-full [&_table]:border-collapse [&_th]:border-b [&_th]:border-hairline [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border-b [&_td]:border-hairline [&_td]:px-3 [&_td]:py-2",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
