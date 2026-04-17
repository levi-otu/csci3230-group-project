<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { arc, interpolate, pie, scaleOrdinal, select } from 'd3'

interface DonutDatum {
  label: string
  value: number
}

const props = withDefaults(
  defineProps<{
    data: DonutDatum[]
    title?: string
    height?: number
  }>(),
  {
    title: '',
    height: 240,
  },
)

const container = ref<HTMLDivElement | null>(null)

const COLORS = ['#485fc7', '#48c774', '#ffdd57', '#f14668', '#3298dc', '#b86bff']

function render() {
  if (!container.value) return

  const width = container.value.clientWidth
  const height = props.height
  const radius = Math.min(width, height) / 2 - 10

  select(container.value).selectAll('svg').remove()

  const svg = select(container.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`)

  const color = scaleOrdinal()
    .domain(props.data.map((d) => d.label))
    .range(COLORS)

  const pieGenerator = pie()
    .value((d: unknown) => (d as DonutDatum).value)
    .sort(null)

  const arcGenerator = arc()
    .innerRadius(radius * 0.55)
    .outerRadius(radius)

  const arcs = g.selectAll('arc').data(pieGenerator(props.data)).enter().append('g')

  arcs
    .append('path')
    .attr('fill', (d: any) => color((d.data as DonutDatum).label) as string)
    .attr('stroke', '#2c3040')
    .attr('stroke-width', 2)
    .transition()
    .duration(600)
    .attrTween('d', function (d: any) {
      const i = interpolate({ startAngle: 0, endAngle: 0 }, d)
      return (t: number) => arcGenerator(i(t)) || ''
    })

  const total = props.data.reduce((sum, d) => sum + d.value, 0)
  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.2em')
    .attr('fill', '#fff')
    .style('font-size', '1.5rem')
    .style('font-weight', '700')
    .text(total)

  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.2em')
    .attr('fill', '#cfd2dc')
    .style('font-size', '0.75rem')
    .style('text-transform', 'uppercase')
    .text('Total')
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
    <div class="legend">
      <div v-for="(item, i) in data" :key="item.label" class="legend-item">
        <span
          class="legend-dot"
          :style="{ backgroundColor: ['#485fc7', '#48c774', '#ffdd57', '#f14668', '#3298dc', '#b86bff'][i % 6] }"
        ></span>
        <span class="has-text-grey-light">{{ item.label }}</span>
      </div>
    </div>
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

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>
