import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-card p-6">
      <SignUp />
    </div>
  );
}
