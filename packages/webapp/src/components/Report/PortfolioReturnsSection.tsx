import { css } from '@emotion/react'
import { useEffect, useRef } from 'react'
import { useReportValue } from '../../atoms/reportState'
import ReportSection from './ReportSection'
import Chart from 'chart.js'
import chartColors from '../../lib/chartColors'
import { transparentize } from 'polished'
// import 'chartjs-adapter-date-fns'
// import { enUS } from 'date-fns/locale'

export type PortfolioReturnsSectionProps = {}

function PortfolioReturnsSection({}: PortfolioReturnsSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const report = useReportValue()

  useEffect(() => {
    if (report.length === 0) {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
      return
    }

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    if (!chartRef.current) {
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: report.map((p, i) => ({
            label: p.name,
            lineTension: 0,
            data: p.returns,
            borderColor: chartColors[i],
            backgroundColor: transparentize(0.9, chartColors[i]),
          })),
        },
        options: {
          maintainAspectRatio: false,
          animation: {
            duration: 0,
          },
          scales: {
            xAxes: [
              {
                type: 'time',
                time: {
                  unit: 'month',
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  callback: function (value, index, values) {
                    return '$' + value.toLocaleString()
                  },
                },
              },
            ],
          },
          tooltips: {
            callbacks: {
              label: (tooltipItem, data) => {
                const label =
                  data.datasets![tooltipItem.datasetIndex!].label ?? ''
                const value = Math.round(
                  tooltipItem.yLabel as number
                ).toLocaleString()
                return `${label} - $${value}`
              },
            },
          },
        },
      })
      chartRef.current = chart
    } else {
      const chart = chartRef.current
      chart.data = {
        datasets: report.map((p, i) => ({
          label: p.name,
          lineTension: 0,
          data: p.returns,
          borderColor: chartColors[i],
          backgroundColor: transparentize(0.9, chartColors[i]),
        })),
      }
      chart.update()
    }
  }, [report])

  return (
    <ReportSection title="Portfolio Returns">
      <div css={chartWrapper}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </ReportSection>
  )
}

const chartWrapper = css`
  width: 100%;
  height: 20rem;
  position: relative;
  canvas {
    width: 100%;
    height: 100%;
  }
`

export default PortfolioReturnsSection
