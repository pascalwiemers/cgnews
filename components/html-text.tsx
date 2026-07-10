import { cn } from "@/lib/utils"

interface HtmlTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  innerHtml?: string
}

export default function HtmlText({
  innerHtml,
  className,
  ...prop
}: HtmlTextProps) {
  if (!innerHtml) {
    return null
  }
  return (
    <span
      className={cn("item-text whitespace-pre-wrap text-sm", className)}
      {...prop}
    >
      {innerHtml}
    </span>
  )
}
