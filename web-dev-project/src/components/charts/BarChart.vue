<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as d3 from 'd3'

interface BarDatum {
  label: string
  value: number
}

const props = withDefaults(
  defineProps<{
    data: BarDatum[]
    title?: string
    color?: string
    height?: number
  }>(),
  {
    title: '',
    color: '#485fc7',
    height: 220,
  },
)

const container = ref<HTMLDivElement | null>(null)

function render() {
  if (!container.value) return

  const width = container.value.clientWidth
  const height = props.height
  const margin = { top: 10, right: 10, bottom: 40, left: 40 }

  d3.select(container.value).selectAll('svg').remove()

  const svg = d3
    .select(container.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3
    .scaleBand()
    .domain(props.data.map((d) => d.label))
    .range([0, innerWidth])
    .padding(0.2)

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(props.data, (d) => d.value) || 1])
    .nice()
    .range([innerHeight, 0])

  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('fill', '#cfd2dc')
    .style('font-size', '11px')

  g.append('g')
    .call(d3.axisLeft(y).ticks(5))
    .selectAll('text')
    .attr('fill', '#cfd2dc')
    .style('font-size', '11px')

  g.selectAll('.domain').attr('stroke', '#4a5063')
  g.selectAll('.tick line').attr('stroke', '#4a5063')

  g.selectAll('rect')
    .data(props.data)
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.label) || 0)
    .attr('y', innerHeight)
    .attr('width', x.bandwidth())
    .attr('height', 0)
    .attr('fill', props.color)
    .attr('rx', 4)
    .transition()
    .duration(600)
    .attr('y', (d) => y(d.value))
    .attr('height', (d) => innerHeight - y(d.value))
}

onMounted(() => {
  render()
  window.addEventListener('resize', render)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', render)
})

watch(() => props.data, render, { deep: true })
</script>

<template>
  <div class="chart-wrapper">
    <h3 v-if="title" class="chart-title has-text-white">{{ title }}</h3>
    <div ref="container" class="chart-container"></div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  width: 100%;
}

.chart-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chart-container {
  width: 100%;
}
</style>
