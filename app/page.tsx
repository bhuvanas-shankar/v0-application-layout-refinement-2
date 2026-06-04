import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6 pt-24">
      <div className="flex flex-col items-center text-center max-w-[480px] gap-8">
        {/* Personalized Heading */}
        <h1 className="text-3xl font-semibold text-foreground">
          Welcome, John.
        </h1>

        {/* Body Text */}
        <p className="text-base text-muted-foreground leading-relaxed">
          You&apos;re one of the first people to test TRM 2.0. Use the navigation to access your reports and start exploring. We want to hear what you find.
        </p>

        {/* Placeholder Graphic Zone */}
        <div className="w-full h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground px-4">
            TRM 2.0 Pilot graphic — asset to be provided
          </p>
        </div>

        {/* CTA Button */}
        <Button asChild size="lg" variant="accent">
          <Link href="/reports">Start testing</Link>
        </Button>
      </div>
    </div>
  )
}
