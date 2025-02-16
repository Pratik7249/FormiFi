"use client";

import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import toast from "react-hot-toast";
import { submitForm } from "@/actions/submitForm";
import { publishForm } from "@/actions/publishForm";
import FormPublishDialog from "./FormPublishDialog";

// Define TypeScript Props
interface FormField {
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}

interface FormProps {
  form: {
    id: number;
    content: {
      formTitle: string;
      fields?: FormField[];
      button?: {
        label?: string;
        text?: string;
      };
    };
  };
  isEditMode?: boolean;
}

const AiGeneratedForm: React.FC<FormProps> = ({ form, isEditMode = false }) => {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    const redirectTo = window.location.href; // Get the current page URL
    return (
      <div className="flex justify-center items-center flex-col">
        <h2>Please sign in or sign up to access the form</h2>
        <Button onClick={() => (window.location.href = `/sign-in?redirectUrl=${encodeURIComponent(redirectTo)}`)}>
          Sign In
        </Button>
        <Button onClick={() => (window.location.href = `/sign-up?redirectUrl=${encodeURIComponent(redirectTo)}`)}>
          Sign Up
        </Button>
      </div>
    );
  }

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false);

  // Handle text & textarea input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0], // Store actual file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      // Debugging: Check if form data is correctly collected
      console.log("Submitting form data:", Object.fromEntries(formDataToSend.entries()));

      const data = await submitForm(form.id, formDataToSend);

      console.log("Form submission response:", data);

      if (data?.success) {
        toast.success(data.message ?? "Form submitted successfully!");
        setFormData({});
      } else {
        toast.error(data?.message ?? "Error occurred during form submission.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred during form submission.");
      console.error(error);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode) {
      try {
        const response = await publishForm(form.id);

        if (response?.success) {
          setSuccessDialogOpen(true);
          toast.success("Form published successfully!");
        } else {
          toast.error(response?.message ?? "Failed to publish form.");
        }
      } catch (error) {
        toast.error("An error occurred while publishing the form.");
        console.error(error);
      }
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{form.content.formTitle || "Your Form"}</h2>
      <form onSubmit={isEditMode ? handlePublish : handleSubmit}>
        {form.content.fields?.map((field, index) => (
          <div key={index} className="mb-4">
            <Label htmlFor={field.label + index}>{field.label}</Label>

            {["text", "email", "tel", "number", "date"].includes(field.type) ? (
              <Input
                id={field.label + index}
                type={field.type}
                name={field.label + index} // Ensure name is unique
                placeholder={field.placeholder}
                required={field.required}
                onChange={handleChange}
              />
            ) : field.type === "textarea" ? (
              <Textarea
                id={field.label + index}
                name={field.label + index} // Ensure name is unique
                placeholder={field.placeholder}
                required={field.required}
                onChange={handleChange}
              />
            ) : field.type === "file" ? (
              <Input id={field.label + index} type="file" name={field.label + index} onChange={handleFileChange} />
            ) : null}
          </div>
        ))}

        <Button type="submit">{isEditMode ? "Publish" : "Submit"}</Button>
      </form>

      <FormPublishDialog formId={form.id} open={successDialogOpen} onOpenChange={setSuccessDialogOpen} />
    </div>
  );
};

export default AiGeneratedForm;
