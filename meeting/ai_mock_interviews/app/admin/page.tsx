"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createAdminInterview } from "./actions";

const formSchema = z.object({
  role: z.string().min(2, "Role must be at least 2 characters."),
  type: z.string().min(2, "Type must be at least 2 characters."),
  level: z.string().min(2, "Level must be at least 2 characters."),
  techstack: z.string().min(2, "Tech stack must be at least 2 characters."),
  questions: z.string().min(10, "Please provide some questions separated by newlines."),
});

export default function AdminPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "Frontend Developer",
      type: "Technical",
      level: "Junior",
      techstack: "React, TypeScript, Next.js",
      questions: "What is React?\nExplain useEffect.\nWhat are React props?",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setMessage("");

    const techstack = values.techstack.split(",").map((s) => s.trim());
    const questions = values.questions.split("\n").map((s) => s.trim()).filter(Boolean);

    const result = await createAdminInterview({
      role: values.role,
      type: values.type,
      level: values.level,
      techstack,
      questions,
    });

    if (result.success) {
      setMessage(`Success! Interview created with default system credentials. ID: ${result.id}`);
      form.reset();
    } else {
      setMessage("Error creating interview.");
    }
    
    setIsSubmitting(false);
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 mb-20 card-border">
      <div className="card-content p-8">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="mb-6 text-slate-400">Set up a new interview and save it with default system credentials.</p>
        
        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes("Success") ? "bg-green-900/40 text-green-400 border border-green-800" : "bg-red-900/40 text-red-400 border border-red-800"}`}>
            {message}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Frontend Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Technical" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Junior, Senior" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="techstack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech Stack (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="React, Next.js, Tailwind CSS" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="questions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Questions (one per line)</FormLabel>
                  <FormControl>
                    <textarea 
                      className="flex min-h-[140px] w-full rounded-md border border-[#ffffff1a] bg-[#1a1b1e] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2C5FF6] disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter each question on a new line..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full btn-primary h-12" disabled={isSubmitting}>
              {isSubmitting ? "Setting Interview..." : "Set Interview & Add Default Credentials"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
