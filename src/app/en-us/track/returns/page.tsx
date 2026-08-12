import TrackingForm from "@/components/TrackingForm";

export const metadata = { title: "Track my return | Emporio Armani US" };

export default function TrackReturnsPage() {
  return (
    <div className="site-padding py-12">
      <h1 className="mb-4 text-xl uppercase tracking-[0.1em]">Track my return</h1>
      <p className="mb-8 max-w-2xl text-sm text-muted">
        Enter the return number to follow the status of your refund. Refunds are issued to the
        original payment method within 14 days of receipt.
      </p>
      <TrackingForm kind="return" />
    </div>
  );
}
