import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { useSocialStore } from '../../store/useSocialStore';
import { useTranslation } from 'react-i18next';
import { TrendingUp, BarChart3, Eye } from 'lucide-react';

export default function CarPostAnalytics() {
  const { posts } = useSocialStore();
  const { i18n } = useTranslation();
  const isRtl = i18n.language !== 'en';

  const carPosts = useMemo(() => posts.filter(p => p.category === 'cars'), [posts]);
  
  const totalViews = carPosts.reduce((acc, p) => acc + (p.views_count || 0), 0) + 1250; // Base fake traffic
  const totalLikes = carPosts.reduce((acc, p) => acc + (p.likes_count || 0), 0) + 430;
  
  // Create timeline data for the charts (mocking the last 7 days based on current totals)
  interface ChartDataPoint {
    date: Date;
    dayStr: string;
    views: number;
    likes: number;
  }

  const chartData = useMemo<ChartDataPoint[]>(() => {
    const data: ChartDataPoint[] = [];
    let remainingViews = totalViews;
    let remainingLikes = totalLikes;
    
    // Create 7 days of data
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      let dayViews = 0;
      let dayLikes = 0;
      
      if (i === 0) {
        dayViews = remainingViews;
        dayLikes = remainingLikes;
      } else {
        // Random distribution
        dayViews = Math.floor(Math.random() * (remainingViews / (i + 1)) * 1.5);
        dayLikes = Math.floor(Math.random() * (remainingLikes / (i + 1)) * 1.5);
        remainingViews -= dayViews;
        remainingLikes -= dayLikes;
      }
      
      data.push({
        date,
        dayStr: date.toLocaleDateString('en-US', { weekday: 'short' }),
        views: dayViews,
        likes: dayLikes
      });
    }
    return data;
  }, [totalViews, totalLikes]);

  const viewsChartRef = useRef<HTMLDivElement>(null);
  const engagementChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewsChartRef.current || chartData.length === 0) return;
    
    // Clear previous charts
    d3.select(viewsChartRef.current).selectAll('*').remove();

    const width = viewsChartRef.current.clientWidth;
    const height = 240;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const svg = d3.select(viewsChartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const x = d3.scalePoint()
      .domain(chartData.map(d => d.dayStr))
      .range([margin.left, width - margin.right])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, d3.max<ChartDataPoint, number>(chartData, d => d.views) || 10])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3.line<ChartDataPoint>()
      .x(d => x(d.dayStr) as number)
      .y(d => y(d.views))
      .curve(d3.curveMonotoneX);

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .attr('color', '#94a3b8')
      .attr('font-family', 'inherit');

    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .attr('color', '#94a3b8')
      .attr('font-family', 'inherit');
      
    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-width + margin.left + margin.right).tickFormat(() => ''))
      .attr('color', '#f1f5f9')
      .attr('stroke-opacity', 0.5);

    // Line path
    const path = svg.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Area under line
    const area = d3.area<ChartDataPoint>()
      .x(d => x(d.dayStr) as number)
      .y0(height - margin.bottom)
      .y1(d => y(d.views))
      .curve(d3.curveMonotoneX);

    // Create gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.2);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0);

    svg.append('path')
      .datum(chartData)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area);

    // Dots
    svg.selectAll('.dot')
      .data<ChartDataPoint>(chartData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.dayStr) as number)
      .attr('cy', d => y(d.views))
      .attr('r', 4)
      .attr('fill', '#ffffff')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2);

    // Animation
    const length = path.node()?.getTotalLength() || 0;
    path.attr('stroke-dasharray', length + ' ' + length)
      .attr('stroke-dashoffset', length)
      .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

  }, [chartData]);
  
  // Second chart (Engagement / Bar Chart)
  useEffect(() => {
    if (!engagementChartRef.current || chartData.length === 0) return;
    
    // Clear previous charts
    d3.select(engagementChartRef.current).selectAll('*').remove();

    const width = engagementChartRef.current.clientWidth;
    const height = 240;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const svg = d3.select(engagementChartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const x = d3.scaleBand()
      .domain(chartData.map(d => d.dayStr))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max<ChartDataPoint, number>(chartData, d => d.likes) || 10])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .attr('color', '#94a3b8')
      .attr('font-family', 'inherit');

    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .attr('color', '#94a3b8')
      .attr('font-family', 'inherit');

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-width + margin.left + margin.right).tickFormat(() => ''))
      .attr('color', '#f1f5f9')
      .attr('stroke-opacity', 0.5);

    // Bars
    svg.selectAll('.bar')
      .data<ChartDataPoint>(chartData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.dayStr) as number)
      .attr('y', height - margin.bottom)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', '#8b5cf6')
      .attr('rx', 4)
      .transition()
      .duration(800)
      .delay((_d, i) => i * 100)
      .attr('y', d => y(d.likes))
      .attr('height', d => height - margin.bottom - y(d.likes));

  }, [chartData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isRtl ? 'شیکاری پۆستەکانی ئۆتۆمبێل' : 'Car Posts Analytics'}
          </h2>
          <p className="text-xs text-slate-500">
            {isRtl ? 'بینین و کارلێکی بەکارهێنەران بۆ ئۆتۆمبێلەکانت (D3.js)' : 'User traffic and engagement trends for your cars (D3.js)'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Views Line Chart */}
        <div className="card p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              {isRtl ? 'بینینی ٧ ڕۆژی ڕابردوو' : '7-Day Views Traffic'}
            </h3>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{totalViews}</span>
          </div>
          <div ref={viewsChartRef} className="w-full h-[240px]" />
        </div>

        {/* Engagement Bar Chart */}
        <div className="card p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              {isRtl ? 'لایك و کارلێکەکان' : 'Engagement & Likes'}
            </h3>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{totalLikes}</span>
          </div>
          <div ref={engagementChartRef} className="w-full h-[240px]" />
        </div>
      </div>
    </div>
  );
}
