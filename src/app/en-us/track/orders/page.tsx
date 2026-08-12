import TrackingForm from "@/components/TrackingForm";

export const metadata = { title: "Track your order | Emporio Armani US" };

export default function TrackOrdersPage() {
  return (
    <div className="site-padding py-12">
      <h1 className="mb-4 text-xl uppercase tracking-[0.1em]">Track your order</h1>
      <p className="mb-8 max-w-2xl text-sm text-muted">
        Enter the order number from your confirmation email to see the latest shipping status.
      </p>
      <TrackingForm kind="order" />
    </div>
  );
}
