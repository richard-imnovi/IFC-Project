import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

interface VisaoGeralChartsProps {
  totalEsperado: number
  totalPago: number
  totalAtrasado: number
  pendingTotal: number
}

export function VisaoGeralCharts({
  totalEsperado,
  totalPago,
  totalAtrasado,
  pendingTotal,
}: VisaoGeralChartsProps) {
  const barChartData = [
    {
      name: 'Receita',
      esperada: totalEsperado,
      recebida: totalPago,
    },
  ]

  const pieChartData = [
    { status: 'recebido', value: totalPago, fill: 'var(--color-recebido)' },
    { status: 'pendente', value: pendingTotal, fill: 'var(--color-pendente)' },
    { status: 'atrasado', value: totalAtrasado, fill: 'var(--color-atrasado)' },
  ].filter((item) => item.value > 0)

  const chartConfig = {
    esperada: {
      label: 'Receita Esperada',
      color: 'hsl(var(--primary))',
    },
    recebida: {
      label: 'Receita Recebida',
      color: 'hsl(var(--emerald-500))',
    },
    recebido: {
      label: 'Recebido',
      color: 'hsl(var(--emerald-500))',
    },
    pendente: {
      label: 'Pendente',
      color: 'hsl(var(--blue-500))',
    },
    atrasado: {
      label: 'Atrasado',
      color: 'hsl(var(--red-500))',
    },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Previsão vs Recebimento</CardTitle>
          <CardDescription>Comparativo de receitas do mês atual</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={barChartData}
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$ ${value}`}
                width={80}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="esperada" fill="var(--color-esperada)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recebida" fill="var(--color-recebida)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Status</CardTitle>
          <CardDescription>Proporção de mensalidades no mês</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="status"
                innerRadius={60}
                strokeWidth={2}
                paddingAngle={2}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
