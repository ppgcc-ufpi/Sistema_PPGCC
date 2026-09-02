import ReactApexChart from 'react-apexcharts';
import {
  buildAnnualActivity,
  buildFacultyMembership,
  buildProductionByYear,
  buildStackedByYear,
} from './publicOverviewData';

const palette = ['#4056a1', '#d97724', '#16805d', '#8b5fbf', '#d3a518', '#4f8fc0'];

const baseOptions = {
  chart: {
    background: 'transparent',
    foreColor: '#c6c9d3',
    fontFamily: 'inherit',
    toolbar: { show: true, tools: { selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
  },
  colors: palette,
  dataLabels: { enabled: false },
  grid: { borderColor: '#4b4541', strokeDashArray: 4 },
  legend: { position: 'bottom', fontSize: '11px', labels: { colors: '#c6c9d3' } },
  noData: { text: 'Não há dados suficientes.', style: { color: '#c6c9d3' } },
  theme: { mode: 'dark' },
  tooltip: { theme: 'dark' },
};

const axes = (years) => ({
  xaxis: { categories: years, labels: { rotate: -45, style: { colors: '#b0c4de', fontSize: '10px' } } },
  yaxis: { min: 0, forceNiceScale: true, labels: { style: { colors: '#b0c4de' } } },
});

const ChartCard = ({ title, subtitle, type, series, options }) => (
  <article className="overview-chart-card">
    <div className="overview-chart-heading">
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
    <ReactApexChart type={type} height={310} series={series} options={{ ...baseOptions, ...options }} />
  </article>
);

const barOptions = (years, stacked = false) => ({
  chart: { ...baseOptions.chart, type: 'bar', stacked },
  ...axes(years),
  plotOptions: { bar: { borderRadius: 5, columnWidth: '58%', dataLabels: { total: { enabled: stacked, style: { color: '#b0c4de' } } } } },
});

const areaOptions = (years) => ({
  chart: { ...baseOptions.chart, type: 'area' },
  ...axes(years),
  stroke: { curve: 'smooth', width: 3 },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.5, opacityTo: 0.08, stops: [0, 95] } },
  markers: { size: 3, hover: { size: 6 } },
});

const PublicOverviewCharts = ({ data, sucupiraLastValidatedYear }) => {
  const masterStudents = buildStackedByYear(data.orientacoes, 'ano', 'situacao_normalizada', {
    filter: (item) => String(item.nivel_normalizado || '').toLocaleLowerCase('pt-BR').includes('mestrado'),
    identity: (item) => item.orientando_normalizado || item.orientando,
  });
  const facultyMembership = buildFacultyMembership(data.docentes, sucupiraLastValidatedYear);
  const researchProjects = buildStackedByYear(data.projetos, 'ano_inicio', 'situacao_normalizada');
  const technicalProduction = buildProductionByYear(data.producoes, 'tecn');
  const bibliographicProduction = buildProductionByYear(data.producoes, 'bibliograf');
  const annualActivity = buildAnnualActivity(data, 11);

  return (
    <div className="overview-charts" aria-label="Gráficos da visão geral do programa">
      <ChartCard
        title="Discentes — Mestrado"
        subtitle="Orientandos únicos por ano e situação."
        type="bar"
        series={masterStudents.series}
        options={barOptions(masterStudents.years, true)}
      />
      <ChartCard
        title="Docentes — Mestrado"
        subtitle={`Vínculo de docentes com o programa por ano. Último ano validado: ${sucupiraLastValidatedYear}.`}
        type="area"
        series={facultyMembership.series}
        options={areaOptions(facultyMembership.years)}
      />
      <ChartCard
        title="Projetos de pesquisa"
        subtitle="Projetos iniciados por ano e situação."
        type="bar"
        series={researchProjects.series}
        options={barOptions(researchProjects.years, true)}
      />
      <ChartCard
        title="Produção técnica"
        subtitle="Evolução anual das produções classificadas como técnicas."
        type="bar"
        series={technicalProduction.series}
        options={barOptions(technicalProduction.years)}
      />
      <ChartCard
        title="Produção bibliográfica"
        subtitle="Evolução anual das produções bibliográficas."
        type="area"
        series={bibliographicProduction.series}
        options={areaOptions(bibliographicProduction.years)}
      />
      <ChartCard
        title="Atividade acadêmica anual"
        subtitle="Produções, orientações e projetos iniciados."
        type="area"
        series={annualActivity.series}
        options={areaOptions(annualActivity.years)}
      />
    </div>
  );
};

export default PublicOverviewCharts;
