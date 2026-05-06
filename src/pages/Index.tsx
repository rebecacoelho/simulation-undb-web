import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Clock,
  Gauge,
  PlayCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Hourglass,
  AlertTriangle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { fetchSimulacao, SimulacaoResponse } from "@/lib/api";
import { toast } from "sonner";

const fmt = (n: number, d = 2) => n.toFixed(d);
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
const fmtTime = (minutes: number) => {
  const totalSec = Math.round(minutes * 60);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};

const tooltipItemStyle = { color: "hsl(var(--popover-foreground))" };
const tooltipLabelStyle = { color: "hsl(var(--popover-foreground))" };

const tooltipFormatter = (value: number | string) => {
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num)) return value;
  return Number.isInteger(num) ? num : parseFloat(num.toFixed(2));
};

const tooltipTimeFormatter = (value: number | string) => {
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num)) return value;
  return fmtTime(num);
};

const utilizationColor = (u: number) => {
  if (u < 0.4) return "hsl(var(--chart-3))";
  if (u < 0.7) return "hsl(var(--chart-2))";
  return "hsl(var(--chart-1))";
};


const Index = () => {
  const [data, setData] = useState<SimulacaoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSimulacao();
      setData(res);
      toast.success("Simulação carregada com sucesso");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao carregar";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const capacidade = data?.csv.analise_capacidade.registros ?? [];
  const horarios = data?.csv.analise_horarios.registros ?? [];
  const integrada = data?.csv.simulacao_integrada.registros ?? [];

  const kpis = useMemo(() => {
    if (!integrada.length) return null;
    const esperaTotal = integrada.reduce((s, r) => s + r.tempo_espera_fila, 0);
    const servicoTotal = integrada.reduce((s, r) => s + r.tempo_servico, 0);
    const sistemaTotal = integrada.reduce((s, r) => s + r.tempo_total_sistema, 0);
    const maiorEspera = Math.max(...integrada.map((r) => r.tempo_espera_fila));
    const semEspera = integrada.filter((r) => r.tempo_espera_fila === 0).length;
    return {
      total: integrada.length,
      mediaEspera: esperaTotal / integrada.length,
      mediaServico: servicoTotal / integrada.length,
      mediaSistema: sistemaTotal / integrada.length,
      maiorEspera,
      pctSemEspera: semEspera / integrada.length,
    };
  }, [integrada]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              UNDB · Simulação & Avaliação de Software
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Solicitação de Histórico Escolar
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm">
              Avaliação do comportamento da plataforma combinando automação com Selenium e simulação com SimPy.
            </p>
          </div>
          <Button
            onClick={load}
            disabled={loading}
            variant="outline"
            className="border-border hover:bg-accent"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Executando
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Executar simulação
              </>
            )}
          </Button>
        </header>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}

        {loading && !data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        )}

        {kpis && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Clientes Simulados" value={String(kpis.total)} hint="cenário saudável" icon={Users} />
            <StatCard label="Tempo Médio na Fila" value={fmtTime(kpis.mediaEspera)} hint={`${fmtPct(kpis.pctSemEspera)} sem espera`} icon={Hourglass} />
            <StatCard label="Tempo Médio Atendimento" value={fmtTime(kpis.mediaServico)} hint={`Total: ${fmtTime(kpis.mediaSistema)}`} icon={Clock} />
            <StatCard label="Maior Espera" value={fmtTime(kpis.maiorEspera)} hint="pico de fila" icon={AlertTriangle} />
          </section>
        )}

        {data && (
          <Tabs defaultValue="capacidade" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="capacidade">
                <Gauge className="h-4 w-4 mr-1.5" /> Capacidade
              </TabsTrigger>
              <TabsTrigger value="horarios">
                <Activity className="h-4 w-4 mr-1.5" /> Horários
              </TabsTrigger>
              <TabsTrigger value="integrada">
                <TrendingUp className="h-4 w-4 mr-1.5" /> Simulação Integrada
              </TabsTrigger>
            </TabsList>

            {/* CAPACIDADE */}
            <TabsContent value="capacidade" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard
                  title="Utilização vs Carga"
                  description="Como a utilização do servidor cresce com a chegada de clientes"
                >
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={capacidade}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="cenario" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} formatter={tooltipFormatter} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar yAxisId="left" dataKey="clientes_por_hora" name="Clientes/h" radius={[6, 6, 0, 0]}>
                        {capacidade.map((row, i) => (
                          <Cell key={i} fill={utilizationColor(row.utilizacao)} />
                        ))}
                      </Bar>
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="utilizacao"
                        name="Utilização"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "hsl(var(--primary))" }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title="Tempos por Cenário"
                  description="Espera e tempo total no sistema (minutos)"
                >
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={capacidade}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="cenario" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} formatter={tooltipTimeFormatter} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area
                        type="monotone"
                        dataKey="tempo_medio_total"
                        name="Tempo Medio Total"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1) / 0.15)"
                      />
                      <Area
                        type="monotone"
                        dataKey="tempo_medio_espera"
                        name="Espera"
                        stroke="hsl(var(--chart-2))"
                        fill="hsl(var(--chart-2) / 0.15)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <ChartCard title="Detalhamento de Cenários" description="Tabela completa">
                <ScrollArea className="h-[320px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cenário</TableHead>
                        <TableHead>Clientes/h</TableHead>
                        <TableHead>λ/min</TableHead>
                        <TableHead>Utilização</TableHead>
                        <TableHead>Espera Média</TableHead>
                        <TableHead>Maior Espera</TableHead>
                        <TableHead>Tempo Médio Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {capacidade.map((r) => (
                        <TableRow key={r.cenario}>
                          <TableCell className="font-semibold">#{r.cenario}</TableCell>
                          <TableCell>{fmt(r.clientes_por_hora, 1)}</TableCell>
                          <TableCell>{fmt(r.lambda_por_minuto, 3)}</TableCell>
                          <TableCell>
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
                              style={{
                                background: utilizationColor(r.utilizacao) + "20",
                                color: utilizationColor(r.utilizacao),
                              }}
                            >
                              {fmtPct(r.utilizacao)}
                            </span>
                          </TableCell>
                          <TableCell>{fmtTime(r.tempo_medio_espera)}</TableCell>
                          <TableCell>{fmtTime(r.maior_espera)}</TableCell>
                          <TableCell>{fmtTime(r.tempo_medio_total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </ChartCard>
            </TabsContent>

            {/* HORÁRIOS */}
            <TabsContent value="horarios" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Carga por Faixa Horária" description="Clientes por hora ao longo do dia">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={horarios}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="faixa" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} formatter={tooltipFormatter} />
                      <Bar dataKey="clientes_por_hora" name="Clientes/h" radius={[8, 8, 0, 0]}>
                        {horarios.map((row, i) => (
                          <Cell key={i} fill={utilizationColor(row.utilizacao)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Espera vs Utilização" description="Impacto do horário na experiência">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={horarios}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="faixa" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis yAxisId="l" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis yAxisId="r" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} formatter={tooltipFormatter} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar yAxisId="l" dataKey="tempo_medio_espera" name="Espera" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
                      <Line
                        yAxisId="r"
                        type="monotone"
                        dataKey="utilizacao"
                        name="Utilização"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <ChartCard title="Detalhamento por Horário">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faixa</TableHead>
                      <TableHead>Clientes/h</TableHead>
                      <TableHead>Utilização</TableHead>
                      <TableHead>Espera Média</TableHead>
                      <TableHead>Maior Espera</TableHead>
                      <TableHead>Tempo Médio Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {horarios.map((r) => (
                      <TableRow key={r.faixa}>
                        <TableCell className="font-semibold">{r.faixa}</TableCell>
                        <TableCell>{fmt(r.clientes_por_hora, 1)}</TableCell>
                        <TableCell>
                          <span
                            className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              background: utilizationColor(r.utilizacao) + "20",
                              color: utilizationColor(r.utilizacao),
                            }}
                          >
                            {fmtPct(r.utilizacao)}
                          </span>
                        </TableCell>
                        <TableCell>{fmtTime(r.tempo_medio_espera)}</TableCell>
                        <TableCell>{fmtTime(r.maior_espera)}</TableCell>
                        <TableCell>{fmtTime(r.tempo_medio_total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ChartCard>
            </TabsContent>

            {/* INTEGRADA */}
            <TabsContent value="integrada" className="space-y-6">
              <ChartCard
                title="Linha do Tempo de Atendimento"
                description={`${integrada.length} clientes · origem: ${data.csv.simulacao_integrada.origem_registros}`}
              >
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={integrada}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="cliente" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} formatter={tooltipTimeFormatter} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="tempo_espera_fila" name="Espera" stroke="hsl(var(--chart-2))" dot={false} strokeWidth={1.5} />
                    <Line type="monotone" dataKey="tempo_servico" name="Serviço" stroke="hsl(var(--chart-1))" dot={false} strokeWidth={1.5} />
                    <Line type="monotone" dataKey="tempo_total_sistema" name="Total" stroke="hsl(var(--chart-3))" dot={false} strokeWidth={1.5} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Registros da Simulação" description="Cliente a cliente">
                <ScrollArea className="h-[420px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Chegada</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Fim</TableHead>
                        <TableHead>Espera</TableHead>
                        <TableHead>Serviço</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {integrada.map((r) => (
                        <TableRow key={r.cliente}>
                          <TableCell className="font-semibold">{r.cliente}</TableCell>
                          <TableCell>{fmt(r.hora_chegada)}</TableCell>
                          <TableCell>{fmt(r.inicio_atendimento)}</TableCell>
                          <TableCell>{fmt(r.fim_atendimento)}</TableCell>
                          <TableCell className={r.tempo_espera_fila > 5 ? "text-danger font-medium" : ""}>
                            {fmtTime(r.tempo_espera_fila)}
                          </TableCell>
                          <TableCell>{fmtTime(r.tempo_servico)}</TableCell>
                          <TableCell>{fmtTime(r.tempo_total_sistema)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </ChartCard>
            </TabsContent>
          </Tabs>
        )}

        <footer className="text-center text-xs text-muted-foreground pt-4 border-t border-border/40">
          Simulação executada via API · Selenium + SimPy
        </footer>
      </div>
    </div>
  );
};

export default Index;
