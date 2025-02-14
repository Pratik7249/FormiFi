"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AiGeneratedForm from "@/components/AiGeneratedForm";

// Define TypeScript type for form
interface Form {
  id: number;
  content: {
    formTitle: string;
    fields?: any[];
  };
  [key: string]: any;
}

const Edit = () => {
  const { formid } = useParams();
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      if (!formid) return;

      try {
        const res = await fetch(`/api/forms/${formid}`);
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        const data: Form = await res.json();
        console.log("Fetched Form Data:", data);

        setForm(data);
      } catch (error) {
        console.error("Error fetching form:", error);
      }
    };

    fetchForm();
  }, [formid]);

  if (!form) return <h1>Loading...</h1>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1 className="font-bold text-2xl text-center">
            {form.content?.formTitle || "NA"}
          </h1>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {form.content ? (
          <AiGeneratedForm form={form} isEditMode={true} />
        ) : (
          <p>No content available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Edit;
