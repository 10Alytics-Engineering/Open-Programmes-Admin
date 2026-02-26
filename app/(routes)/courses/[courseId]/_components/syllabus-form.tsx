"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CourseType } from "@/types";
import { toast } from "sonner";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { useSession } from "next-auth/react";

const formSchema = z.object({
    syllabus: z.string().min(2, { message: "Syllabus is required" }),
});

interface SyllabusFormProps {
    initialData: CourseType | null;
    courseId: string | undefined;
}

const SyllabusForm = ({ initialData, courseId }: SyllabusFormProps) => {
    const router = useRouter();

    const { data: session } = useSession();

    if (session?.accessToken) {
        setAuthToken(session.accessToken);
    }

    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            syllabus: initialData?.syllabus || "",
        },
    });
    const { isSubmitting, isValid } = form.formState;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await axiosInstance.patch(`/api/courses/${courseId}`, values);
            toast.success("Course Updated");
            toggleEdit();
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Course Syllabus / Curriculum
                <Button type="button" onClick={toggleEdit} variant={"ghost"}>
                    {isEditing ? (
                        <> Cancel </>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Syllabus
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <div className="text-sm mt-2 font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                    {initialData?.syllabus || "No syllabus added yet."}
                </div>
            )}
            {isEditing && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 mt-4"
                    >
                        <FormField
                            control={form.control}
                            name="syllabus"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel> Syllabus (Paste the curriculum here) </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Paste the curriculum text, e.g. 🟢 Week 1 — VIBE Coding..."
                                            rows={15}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center gap-x-2">
                            <Button type="submit" disabled={!isValid || isSubmitting}>
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
};

export default SyllabusForm;
