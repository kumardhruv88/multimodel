import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a1a] p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#cf6679]">
          <span className="text-lg font-bold text-white">N</span>
        </div>
        <h1 className="text-[20px] font-semibold text-[#ececec]">NEXUS AI</h1>
        <p className="mt-1 text-sm text-[#a0a0a0]">Create your account</p>
      </div>

      <SignUp
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: "#cf6679",
            colorBackground: "#212121",
            colorInputBackground: "#2a2a2a",
            colorText: "#ececec",
            colorTextSecondary: "#a0a0a0",
            borderRadius: "12px",
            fontFamily: "Inter, sans-serif",
          },
          elements: {
            formButtonPrimary: "bg-[#cf6679] hover:bg-[#b05566]",
            card: "border border-[#3a3a3a] shadow-none",
          },
        }}
        signInUrl="/sign-in"
        forceRedirectUrl="/chat"
      />
    </div>
  );
}
