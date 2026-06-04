import { PoctResultsNotesLayout } from "@/features/poct/poct-results-note-bridge";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PoctResultsNotesLayout>{children}</PoctResultsNotesLayout>;
}
