"use client";

import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Checkbox } from "@radix-ui/react-checkbox";
import toast from "react-hot-toast";
import { submitForm } from "@/actions/submitForm";

// Define TypeScript Props
interface FormField {
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: string[]; // For select, radio, checkbox
}

interface FormProps {
  form: {
    id: number;
    content: {
      formTitle: string;
      fields?: FormField[];
    };
  };
  isEditMode?: boolean;
}

const AiGeneratedForm: React.FC<FormProps> = ({ form, isEditMode = false }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] instanceof File) {
        formDataToSend.append(key, formData[key]);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    const formId = form.id; // Dynamically pass the form ID

    const data = await submitForm(formId, formDataToSend);

    if (data?.success) {
      toast.success(data.message);
      setFormData({});
    } else {
      toast.error(data?.message);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{form.content.formTitle || "Job Application Form"}</h2>
      <form onSubmit={handleSubmit}>
        {form.content.fields?.map((field, index) => (
          <div key={index} className="mb-4">
            {/* Render other input fields */}
            <Label>{field.label}</Label>

            {field.type === "text" || field.type === "email" || field.type === "tel" || field.type === "number" || field.type === "date" ? (
              <Input
                type={field.type}
                name={field.label}
                placeholder={field.placeholder}
                required={field.required}
                onChange={handleChange}
              />
            ) : field.type === "textarea" ? (
              <Textarea
                name={field.label}
                placeholder={field.placeholder}
                required={field.required}
                onChange={handleChange}
              />
            ) : field.type === "checkbox" ? (
              <div className="flex flex-col space-y-2">
                {field.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.label}-${idx}`}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          [field.label]: checked
                            ? [...(formData[field.label] || []), option]
                            : formData[field.label]?.filter((o: string) => o !== option),
                        })
                      }
                    />
                    <Label htmlFor={`${field.label}-${idx}`}>{option}</Label>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {/* Position Applied For */}
        <div className="mb-4">
          <Label>Position Applied For</Label>
          <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, "Position Applied For": value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a position" />
            </SelectTrigger>
            <SelectContent>
              {["Software Engineer", "Data Analyst", "Product Manager", "Marketing Specialist"].map((option, idx) => (
                <SelectItem key={idx} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resume and Cover Letter Fields */}
        {["Resume", "Cover Letter"].map((label, idx) => (
          <div key={idx} className="mb-4">
            <Label>{label}</Label>
            <Input type="file" name={label} onChange={handleFileChange} />
          </div>
        ))}

        {/* Experience Level */}
        <div className="mb-4">
          <Label>Experience Level</Label>
          <RadioGroup
            value={formData["Experience Level"] || ""}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, "Experience Level": value }))}
            className="flex flex-col space-y-2"
          >
            {["Entry Level", "Mid Level", "Senior Level"].map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`experience-${idx}`} className="peer hidden" />
                <Label htmlFor={`experience-${idx}`} className="cursor-pointer flex items-center space-x-2">
                  <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center peer-checked:border-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full peer-checked:block hidden"></div>
                  </div>
                  <span>{option}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Submit Button */}
        <Button type="submit">{isEditMode ? "Save Changes" : "Submit"}</Button>
      </form>
    </div>
  );
};

export default AiGeneratedForm;
