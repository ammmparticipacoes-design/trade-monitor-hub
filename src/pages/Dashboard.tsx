import AppLayout from "@/components/AppLayout";
import RobotStatusCard from "@/components/RobotStatusCard";
import LeiturasTable from "@/components/LeiturasTable";

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">Monitoramento do Robô</h2>
          <RobotStatusCard />
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">Leituras Recentes do Mercado</h2>
          <LeiturasTable />
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
