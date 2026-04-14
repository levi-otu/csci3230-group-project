<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted, ref, watch } from 'vue'

type AgendaItem = {
  id: number
  text: string
  completed: boolean
}

type ChartDatum = {
  label: string
  value: number
  color: string
}

const props = defineProps<{
  items: AgendaItem[]
}>()

const chartRef = ref<HTMLDivElement | null>(null)

function renderChart() {
  const container = chartRef.value
  if (!container) {
    return
  }

  container.innerHTML = ''

  const width = Math.max(280, container.clientWidth)
  const height = Math.max(180, container.clientHeight)
  const margin = { top: 20, right: 20, bottom: 30, left: 90 }

  const completed = props.items.filter((item) => item.completed).length
  const pending = props.items.length - completed
  const maxValue = Math.max(1, completed, pending)
  const tickStep = Math.max(1, Math.ceil(maxValue / 10))
  const tickValues = d3.range(0, maxValue + 1, tickStep)

  if (tickValues[tickValues.length - 1] !== maxValue) {
    tickValues.push(maxValue)
  }

  const data: ChartDatum[] = [
    { label: 'Completed', value: completed, color: '#22c55e' },
    { label: 'Pending', value: pending, color: '#f59e0b' },
  ]

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const x = d3
    .scaleLinear()
    .domain([0, maxValue])
    .range([margin.left, width - margin.right])

  const y = d3
    .scaleBand<string>()
    .domain(data.map((d) => d.label))
    .range([margin.top, height - margin.bottom])
    .padding(0.35)

  svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickValues(tickValues).tickFormat(d3.format('d')))
    .attr('color', '#cbd5e1')

  svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .attr('color', '#cbd5e1')

  svg
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', margin.left)
    .attr('y', (d: ChartDatum) => y(d.label) ?? margin.top)
    .attr('width', (d: ChartDatum) => x(d.value) - margin.left)
    .attr('height', y.bandwidth())
    .attr('rx', 4)
    .attr('fill', (d: ChartDatum) => d.color)

  svg
    .selectAll('text.value')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'value')
    .attr('x', (d: ChartDatum) => x(d.value) + 6)
    .attr('y', (d: ChartDatum) => (y(d.label) ?? margin.top) + y.bandwidth() / 2 + 4)
    .attr('fill', '#e2e8f0')
    .style('font-size', '12px')
    .text((d: ChartDatum) => d.value)
}


onMounted(renderChart)
watch(() => props.items, renderChart, { deep: true })
</script>

<template>
  <div class="chart-wrapper">
    <div class="chart-title">Task Completion</div>
    <div ref="chartRef" class="chart-area"></div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chart-title {
  font-weight: 600;
  color: #e2e8f0;
}

.chart-area {
  flex: 1;
  min-height: 0;
}
</style>
