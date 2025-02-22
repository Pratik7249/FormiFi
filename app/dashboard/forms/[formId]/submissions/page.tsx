"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import SubmissionsDetails from "@/components/SubmissionsDetails";

interface Submission {
  id: number;
  formId: number;
  data: Record<string, any>;
  createdAt: string;
}

const Submissions = () => {
  const params = useParams();
  console.log("useParams result:", params); // ✅ Debugging

  const formId = params?.formId ? Number(params.formId) : NaN; // ✅ Convert safely
  console.log("Extracted formId:", formId); // ✅ Debugging

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNaN(formId)) {
      console.log(`Fetching submissions for formId: ${formId}`); // ✅ Debugging log

      axios
        .get(`/api/submissions/${formId}`)
        .then((res) => {
          console.log("API Response:", res.data);
          if (res.data.success === false) {
            throw new Error(res.data.message);
          }
          setSubmissions(res.data);
        })
        .catch((err) => {
          console.error("Error loading submissions:", err);
          setError(err.response?.data?.message || "Failed to load submissions.");
        })
        .finally(() => setLoading(false));
    } else {
      console.error("Invalid formId detected in frontend:", formId);
    }
  }, [formId]);

  if (isNaN(formId)) return <h1>Invalid form ID</h1>;
  if (loading) return <h1>Loading submissions...</h1>;
  if (error) return <h1>{error}</h1>;
  if (!submissions.length) return <h1>No submissions found</h1>;

  return (
    <div>
      {submissions.map((submission, index) => (
        <SubmissionsDetails key={submission.id} submission={submission} index={index} />
      ))}
    </div>
  );
};

export default Submissions;
