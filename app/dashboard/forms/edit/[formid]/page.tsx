"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Edit = () => {
  const { formid } = useParams();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      if (!formid) return;

      try {
        const res = await fetch(`/api/forms/${formid}`);

        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        setForm(data);
      } catch (error) {
        console.error("Error fetching form:", error);
      }
    };

    fetchForm();
  }, [formid]);

  if (!form) return <h1>Loading...</h1>;

  return <div>Editing Form ID: {formid}</div>;
};

export default Edit;
