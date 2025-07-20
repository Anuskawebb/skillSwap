export type ValidationError = {
  field: string
  message: string
}

export function validateCompleteForm(data: any): ValidationError[] {
  const errors: ValidationError[] = []

  // Basic required field validation
  if (!data.name) {
    errors.push({ field: "name", message: "Name is required" })
  }
  
  if (!data.occupation) {
    errors.push({ field: "occupation", message: "Occupation is required" })
  }
  
  if (!data.timezone) {
    errors.push({ field: "timezone", message: "Timezone is required" })
  }
  
  if (!data.age || data.age < 13) {
    errors.push({ field: "age", message: "Valid age is required" })
  }

  return errors
}
