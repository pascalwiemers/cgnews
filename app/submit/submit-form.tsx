"use client"

import { useEffect, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { submitStoryAction } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const storyTypes = [
  { value: "LINK", label: "Link" },
  { value: "ASK", label: "Ask" },
  { value: "SHOW", label: "Show" },
  { value: "JOB", label: "Job" },
] as const

const submitFormSchema = z
  .object({
    title: z.string().min(1, { message: "Title is required" }),
    url: z.string().trim().max(2048, { message: "URL is too long" }).optional(),
    text: z.string().optional(),
    type: z.enum(["LINK", "ASK", "SHOW", "JOB"]),
    isSelfPromo: z.boolean().optional(),
    commercialDisclosure: z.string().optional(),
  })
  .refine((d) => d.url?.trim() || d.text?.trim(), {
    path: ["url"],
    message: "Provide a URL or some text",
  })

export function SubmitForm() {
  const form = useForm<z.infer<typeof submitFormSchema>>({
    resolver: zodResolver(submitFormSchema),
    defaultValues: {
      title: "",
      url: "",
      text: "",
      type: "LINK",
      isSelfPromo: false,
      commercialDisclosure: "",
    },
  })
  const typeTouchedRef = useRef(false)
  const url = form.watch("url")
  const text = form.watch("text")

  useEffect(() => {
    if (typeTouchedRef.current) return
    const nextType = url?.trim() || !text?.trim() ? "LINK" : "ASK"
    form.setValue("type", nextType)
  }, [form, text, url])

  return (
    <Form {...form}>
      <form
        action={submitStoryAction}
        className="panel space-y-5 px-4 py-4 sm:px-5"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono text-[11px] uppercase text-muted-foreground">
                Type
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-4 gap-1 rounded-sm border border-border/70 bg-background/60 p-1">
                  {storyTypes.map((storyType) => (
                    <Label
                      key={storyType.value}
                      className={cn(
                        "cursor-pointer rounded-sm px-2 py-1.5 text-center text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground",
                        field.value === storyType.value &&
                          "bg-accent text-accent-foreground shadow-sm"
                      )}
                    >
                      <input
                        className="sr-only"
                        name="type"
                        type="radio"
                        value={storyType.value}
                        checked={field.value === storyType.value}
                        onChange={() => {
                          typeTouchedRef.current = true
                          field.onChange(storyType.value)
                        }}
                      />
                      {storyType.label}
                    </Label>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono text-[11px] uppercase text-muted-foreground">
                Title
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  name="title"
                  className="bg-background/70"
                  placeholder="Concise headline, tool release, breakdown, or question"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono text-[11px] uppercase text-muted-foreground">
                URL
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  name="url"
                  className="bg-background/70"
                  placeholder="https://..."
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Leave blank for an Ask-style discussion post.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono text-[11px] uppercase text-muted-foreground">
                Text
              </FormLabel>
              <FormControl>
                <Textarea
                  className="h-36 resize-y rounded-sm bg-background/70 leading-6"
                  {...field}
                  name="text"
                  placeholder="Optional context, production notes, or the full discussion prompt."
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                If there is no URL, this appears at the top of the thread.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="rounded-sm border border-border/60 bg-muted/20 p-3">
          <div className="mb-3 font-mono text-[11px] uppercase text-muted-foreground">
            Disclosure
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isSelfPromo"
              render={({ field }) => (
                <FormItem>
                  <Label className="flex items-center gap-2 text-sm font-normal text-foreground/90">
                    <input
                      name="isSelfPromo"
                      type="checkbox"
                      value="true"
                      checked={!!field.value}
                      onChange={field.onChange}
                      className="size-4 rounded-sm border-border bg-background accent-primary"
                    />
                    Self-promo or affiliated work
                  </Label>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="commercialDisclosure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[11px] uppercase text-muted-foreground">
                    Commercial disclosure
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="h-20 resize-y rounded-sm bg-background/70 leading-6"
                      {...field}
                      name="commercialDisclosure"
                      placeholder="Relevant employer, client, sponsorship, product ownership, or paid relationship."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <FormDescription className="max-w-md text-xs leading-5 text-muted-foreground">
            Provide a URL or text. Link posts may still include optional
            context.
          </FormDescription>
          <Button type="submit" className="rounded-sm">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  )
}
