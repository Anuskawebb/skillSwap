import { z } from "zod";

// Validation schemas based on your Prisma User model
export const basicInfoSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .trim(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    )
    .trim(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
  socialLinks: z
    .record(z.string().url("Please enter a valid URL").optional())
    .optional(),
});

export const aboutYouSchema = z.object({
  occupation: z.string().min(1, "Please select your occupation"),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  timezone: z.string().min(1, "Please select your timezone"),
  age: z
    .number()
    .min(13, "You must be at least 13 years old")
    .max(120, "Please enter a valid age"),
  preferredLanguages: z
    .array(z.string())
    .min(1, "Please select at least one language"),
});

export const skillsSchema = z.object({
  skillsOffered: z
    .array(z.string())
    .min(1, "Please select at least one skill you can teach"),
  learningGoals: z
    .array(z.string())
    .min(1, "Please select at least one skill you want to learn"),
});

export const preferencesSchema = z.object({
  userAvailability: z
    .array(z.string())
    .min(1, "Please select at least one availability option"),
  userIntent: z.array(z.string()).min(1, "Please select at least one goal"),
});

export const walletSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  walletSignature: z.string().min(1, "Wallet signature is required"),
});

// Complete form validation matching Prisma User model
export const completeFormSchema = z.object({
  // Required fields
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  occupation: z.string().min(1, "Occupation is required"),
  timezone: z.string().min(1, "Timezone is required"),
  age: z.number().min(13, "Must be at least 13 years old"),

  // Optional fields
  bio: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  walletAddress: z.string().optional().nullable(),

  // Array fields
  interests: z.array(z.string()),
  preferredLanguages: z.array(z.string()),
  skillsOffered: z.array(z.string()),
  learningGoals: z.array(z.string()),
  userIntent: z.array(z.string()),
  userAvailability: z.array(z.string()),

  // JSON field
  socialLinks: z.record(z.string()).optional().nullable(),
});

export type ValidationError = {
  field: string;
  message: string;
};

export function validateStep(step: number, data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  try {
    switch (step) {
      case 1: // Basic Info
        basicInfoSchema.parse(data);
        break;
      case 2: // About You
        aboutYouSchema.parse(data);
        break;
      case 3: // Skills to Teach
        z.object({ skillsOffered: z.array(z.string()).min(1) }).parse({
          skillsOffered: Array.isArray(data.skillsOffered)
            ? data.skillsOffered.map((s: any) =>
                typeof s === "string" ? s : s.name || String(s),
              )
            : [],
        });
        break;
      case 4: // Skills to Learn
        z.object({ learningGoals: z.array(z.string()).min(1) }).parse({
          learningGoals: Array.isArray(data.learningGoals)
            ? data.learningGoals.map((s: any) =>
                typeof s === "string" ? s : s.name || String(s),
              )
            : [],
        });
        break;
      case 5: // Preferences
        preferencesSchema.parse(data);
        break;
      case 6: // Wallet
        walletSchema.parse(data);
        break;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        errors.push({
          field: err.path.join("."),
          message: err.message,
        });
      });
    }
  }

  return errors;
}

export function validateCompleteForm(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  try {
    // Transform the data to match Prisma schema
    const transformedData = {
      name: data.name || data.displayName,
      username: data.username || "",
      occupation: data.occupation || "",
      timezone: data.timezone || "",
      age: Number(data.age) || 0,
      bio: data.bio || null,
      avatarUrl: data.avatarUrl || null,
      location: data.location || null,
      walletAddress: data.walletAddress || null,
      interests: Array.isArray(data.interests) ? data.interests : [],
      preferredLanguages: Array.isArray(data.preferredLanguages)
        ? data.preferredLanguages
        : [],
      skillsOffered: Array.isArray(data.skillsOffered)
        ? data.skillsOffered.map((s: any) =>
            typeof s === "string" ? s : s.name || String(s),
          )
        : [],
      learningGoals: Array.isArray(data.learningGoals)
        ? data.learningGoals.map((s: any) =>
            typeof s === "string" ? s : s.name || String(s),
          )
        : [],
      userIntent: Array.isArray(data.userIntent) ? data.userIntent : [],
      userAvailability: Array.isArray(data.userAvailability)
        ? data.userAvailability
        : [],
      socialLinks:
        data.socialLinks && typeof data.socialLinks === "object"
          ? data.socialLinks
          : null,
    };

    completeFormSchema.parse(transformedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        errors.push({
          field: err.path.join("."),
          message: err.message,
        });
      });
    }
  }

  return errors;
}
