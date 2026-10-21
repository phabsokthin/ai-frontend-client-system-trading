import Loading from "./components/Loading";

export default function LoadingPage() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <Loading
        message="Loading Trading System..."
        subtitle="Initializing System AI feeds, market telemetry & signals"
      />
    </div>
  );
}
