import { SignIn } from "@clerk/nextjs";
import { neobrutalism, shadesOfPurple } from "@clerk/themes";

// Merge two themes
const customTheme = {
  ...neobrutalism,
  ...shadesOfPurple
};

export default function Page() {
  return <SignIn 
    appearance={{
      baseTheme: customTheme
    }}
  />;
}
