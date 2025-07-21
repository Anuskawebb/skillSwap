export type ValidationError = {
  field: string;
  message: string;
};

export function validateCompleteForm(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Basic required field validation
  if (!data.name || data.name.trim() === "") {
    errors.push({ field: "name", message: "Name is required" });
  }

  if (!data.occupation || data.occupation.trim() === "") {
    errors.push({ field: "occupation", message: "Occupation is required" });
  }

  if (!data.timezone || data.timezone.trim() === "") {
    errors.push({ field: "timezone", message: "Timezone is required" });
  }

  if (!data.ageGroup || typeof data.ageGroup !== "string" || data.ageGroup.trim() === "") {
    errors.push({ field: "ageGroup", message: "Valid age group is required" });
  }

  return errors;
}
