import { Check, X } from "lucide-react";

interface PasswordRequirementProps {
  isValid: boolean;
  text: string;
}

function PasswordRequirement({ isValid, text }: PasswordRequirementProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {isValid ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-red-500" />
      )}
      <span>{text}</span>
    </div>
  );
}

interface PasswordValidationProps {
  password: string;
}

export function PasswordValidation({ password }: PasswordValidationProps) {
  const requirements = [
    { isValid: password.length >= 8, text: "At least 8 characters" },
    { isValid: /[a-z]/.test(password), text: "At least 1 lowercase character" },
    { isValid: /[A-Z]/.test(password), text: "At least 1 uppercase character" },
    { isValid: /[0-9]/.test(password), text: "At least 1 number" },
    { isValid: /[^a-zA-Z0-9]/.test(password), text: "At least 1 special character" },
  ];

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((requirement, index) => (
        <PasswordRequirement key={index} {...requirement} />
      ))}
    </div>
  );
}