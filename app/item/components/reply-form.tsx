"use client"

import Link from "next/link"
import { useFormAction, useGoto } from "@/hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { InfoIcon, Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"
import { z } from "zod"

import { replyAction } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"

const replyFormSchema = z.object({
  storyId: z.number().int().positive(),
  parentId: z.number().int().positive().nullable(),
  text: z
    .string({
      required_error: "Please enter your comment",
    })
    .min(1, { message: "Please enter your comment" }),
})
type ReplyFormValues = z.infer<typeof replyFormSchema>

type Props = {
  logined: boolean
  text?: string
  position?: "left" | "right"
  storyId: number
  parentId?: number | null
}

export default function ReplyForm({
  logined,
  text,
  position,
  storyId,
  parentId,
}: Props) {
  const form = useFormAction<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: { storyId, parentId: parentId ?? null, text: "" },
    schema: replyFormSchema,
    mode: "onSubmit",
  })
  const goto = useGoto()
  const action = async () => {
    const result = (await form.handleAction(replyAction)) as
      | { success?: boolean }
      | undefined
    if (result?.success) {
      form.reset({ storyId, parentId: parentId ?? null, text: "" })
    }
  }
  return (
    <Form {...form}>
      <form className="space-y-4" action={action}>
        <input hidden name="storyId" defaultValue={storyId} />
        <input hidden name="parentId" defaultValue={parentId ?? ""} />
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="metadata-label">transmission</FormLabel>
              <FormControl>
                <Textarea
                  className="h-32 resize-y rounded-md border-border/80 bg-background/75 leading-6 placeholder:text-muted-foreground/65 focus-visible:ring-primary/60"
                  placeholder="Add a considered note, question, or production detail."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div
          className={cn(
            "flex flex-row items-center space-x-2",
            position === "right" && "float-right"
          )}
        >
          <ReplyButton text={text ? text : "Add Comment"} logined={logined} />
          {!logined && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55"
                  aria-label="Login required to reply"
                >
                  <InfoIcon className="size-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="max-w-60 rounded-md border-border/80 bg-card text-sm leading-6 text-card-foreground">
                You have to be{" "}
                <Link
                  rel="noreferrer nofollow"
                  href={{
                    pathname: "/login",
                    query: { goto: goto },
                  }}
                  className="underline"
                >
                  logged in
                </Link>{" "}
                to reply. If you are already logged in, please{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => {
                    window.location.reload()
                  }}
                >
                  refresh
                </button>{" "}
                the page to continue.
              </PopoverContent>
            </Popover>
          )}
        </div>
      </form>
    </Form>
  )
}

function ReplyButton({ text, logined }: { text: string; logined: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={!logined || pending}
      className="rounded-md"
      aria-disabled={!logined || pending}
    >
      {pending && <Loader2 className="mr-2 animate-spin" size={16} />}
      {text}
    </Button>
  )
}
