import { PoctResultsNotesLayout } from "@/features/clinical/poct/poct-results-note-bridge";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PoctResultsNotesLayout>{children}</PoctResultsNotesLayout>;
}
