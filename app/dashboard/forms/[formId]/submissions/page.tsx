import SubmissionsDetails from "@/components/SubmissionsDetails";
import prisma from "@/lib/prisma";
import React from "react";

const Submissions = async ({ params }: { params: { formId: string } }) => {
  const formId = parseInt(params.formId, 10); // ✅ No need to await params

  if (isNaN(formId)) {
    return <h1>Invalid form ID: {params.formId}</h1>;
  }

  try {
    const submissions = await prisma.submissions.findMany({
      where: { formId },
      include: { form: true },
    });

    if (!submissions.length) {
      return <h1>No submissions found for form ID {formId}</h1>;
    }

    return (
      <div>
        {submissions.map((submission, index) => (
          <SubmissionsDetails key={submission.id} submission={submission} index={index} />
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return <h1>Failed to load submissions. Please try again later.</h1>;
  }
};

export default Submissions;
