'use client';

import { useDashboardData } from '../dashboard-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  Users, 
  Zap,
  Crown,
  Lock,
  ArrowUpRight,
  FileText,
  Eye,
  Video,
  TrendingUp,
  Activity,
  RefreshCw,
  Palette
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { formatNumber } from '@/lib/auth-utils';
import { addDays, subDays, startOfDay, endOfDay, format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

interface NoAnalyticsDataProps {
  hasChannel: boolean;
}

type ChartType = 'line' | 'bar' | 'area';

const predefinedColors = [
  { name: 'Orange', value: 'rgb(255, 140, 0)' },
  { name: 'Blue', value: 'rgb(59, 130, 246)' },
  { name: 'Green', value: 'rgb(34, 197, 94)' },
  { name: 'Purple', value: 'rgb(168, 85, 247)' },
  { name: 'Red', value: 'rgb(239, 68, 68)' },
  { name: 'Pink', value: 'rgb(236, 72, 153)' },
  { name: 'Yellow', value: 'rgb(234, 179, 8)' },
  { name: 'Teal', value: 'rgb(20, 184, 166)' },
];

function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded border-2 border-gray-600" 
            style={{ backgroundColor: color }}
          />
          <Palette className="w-4 h-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <h4 className="font-medium">Choose Color</h4>
          <div className="grid grid-cols-4 gap-2">
            {predefinedColors.map((colorOption) => (
              <button
                key={colorOption.value}
                className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                style={{ 
                  backgroundColor: colorOption.value,
                  borderColor: color === colorOption.value ? '#fff' : 'transparent'
                }}
                onClick={() => onChange(colorOption.value)}
                title={colorOption.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8 rounded border-2 border-gray-600 cursor-pointer"
            />
            <span className="text-sm text-gray-400">Custom color</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function AnalyticsClientPage() {
  const { user, analytics, activity, usageStats, planFeatures } = useDashboardData();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [aggregation, setAggregation] = useState('week');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [subscriberChartType, setSubscriberChartType] = useState<ChartType>('line');
  const [viewChartType, setViewChartType] = useState<ChartType>('area');
  const [subscriberColor, setSubscriberColor] = useState('rgb(255, 140, 0)');
  const [viewColor, setViewColor] = useState('rgb(59, 130, 246)');

  const hasRealData = user?.youtubeChannel?.id || user?.youtubeChannelId;
  const userPlan = user?.plan || 'free';

  // Ensure dateRange is always defined
  const safeDateRange = dateRange || { from: subDays(new Date(), 30), to: new Date() };

  // Fetch analytics data for the selected date range
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!hasRealData || !user?.email) return;
      
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          email: user.email,
          from: safeDateRange.from.toISOString(),
          to: safeDateRange.to.toISOString(),
          aggregation
        });

        const response = await fetch(`/api/dashboard/analytics?${params}`);
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [hasRealData, user?.email, safeDateRange, aggregation]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const NoAnalyticsData = ({ hasChannel }: NoAnalyticsDataProps) => (
    <Card className="border-dashed border-gray-600/30 bg-gray-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-300">
          <BarChart3 className="w-5 h-5" />
          {hasChannel ? 'No Analytics Data Available' : 'Connect Your Channel'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400 mb-4">
          {hasChannel 
            ? 'No analytics data available for the selected date range. Try adjusting your date range or check back later.'
            : 'Connect your YouTube channel to see detailed analytics and performance metrics.'
          }
        </p>
        {!hasChannel && (
          <Link href="/dashboard/settings">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Connect YouTube Channel
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );

  // Transform data for charts
  const getChartData = () => {
    if (!analyticsData?.chartData) return [];
    
    return analyticsData.chartData.labels.map((label: string, index: number) => ({
      date: label,
      subscribers: analyticsData.chartData.datasets[0].data[index] || 0,
      views: analyticsData.chartData.datasets[1].data[index] || 0,
      videos: analyticsData.chartData.datasets[2].data[index] || 0
    }));
  };

  const chartData = getChartData();

  const subscriberChartConfig = {
    subscribers: { label: 'Subscribers', color: subscriberColor }
  };

  const viewChartConfig = {
    views: { label: 'Views', color: viewColor }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {hasRealData ? 'YouTube Analytics' : 'Analytics Dashboard'}
          </h1>
          <p className="text-gray-400">
            {hasRealData 
              ? 'Real-time analytics and performance metrics for your YouTube channel'
              : 'Connect your YouTube channel to see detailed analytics'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={userPlan === 'yearly' ? 'default' : userPlan === 'monthly' ? 'secondary' : 'outline'}>
            {userPlan === 'free' && <Crown className="w-3 h-3 mr-1" />}
            {userPlan === 'monthly' && <BarChart3 className="w-3 h-3 mr-1" />}
            {userPlan === 'yearly' && <Zap className="w-3 h-3 mr-1" />}
            {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Date Range:</span>
          <DateRangePicker
            date={safeDateRange}
            onDateChange={setDateRange}
            className="w-auto"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Aggregation:</span>
          <Select value={aggregation} onValueChange={setAggregation}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setDateRange({
              from: subDays(new Date(), 30),
              to: new Date()
            });
            setAggregation('week');
          }}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Reset
        </Button>
      </div>

      {/* Main Stats Grid (4 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Channel Status */}
        <Card className="bg-white/5 border-gray-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Channel Status</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {hasRealData ? 'Connected' : 'Not Connected'}
            </div>
            <p className="text-xs text-gray-400">
              {hasRealData ? 'YouTube channel active' : 'Connect your channel'}
            </p>
          </CardContent>
        </Card>

        {/* Subscribers */}
        <Card className="bg-white/5 border-gray-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics?.subscribers ? formatNumber(analytics.subscribers) : 'N/A'}
            </div>
            <p className="text-xs text-gray-400">Total subscribers</p>
          </CardContent>
        </Card>

        {/* Views */}
        <Card className="bg-white/5 border-gray-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics?.views ? formatNumber(analytics.views) : 'N/A'}
            </div>
            <p className="text-xs text-gray-400">Lifetime views</p>
          </CardContent>
        </Card>

        {/* Videos */}
        <Card className="bg-white/5 border-gray-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Videos</CardTitle>
            <Video className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics?.videoCount || analyticsData?.analytics?.videoCount || 'N/A'}
            </div>
            <p className="text-xs text-gray-400">Total videos</p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Insights - Additional real data section when channel is connected */}
      {hasRealData && analytics && (
        <Card className="bg-white/5 border-gray-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-300">
              <TrendingUp className="w-5 h-5" />
              Channel Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {analytics?.mostViewedVideo?.title ? 
                    analytics.mostViewedVideo.title.substring(0, 30) + '...' : 
                    'N/A'
                  }
                </div>
                <p className="text-sm text-gray-400">Most Viewed Video</p>
                <p className="text-xs text-gray-500">
                  {analytics.mostViewedVideo?.views ? 
                    `${formatNumber(analytics.mostViewedVideo.views)} views` : 
                    'No data'
                  }
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {analytics?.avgViewsPerVideo || analyticsData?.analytics?.avgViewsPerVideo ? 
                    formatNumber(Math.round(analytics?.avgViewsPerVideo || analyticsData?.analytics?.avgViewsPerVideo || 0)) : 
                    'N/A'
                  }
                </div>
                <p className="text-sm text-gray-400">Avg Views/Video</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {analytics?.subscriberGrowth || analyticsData?.analytics?.subscriberGrowth ? 
                    `${(analytics?.subscriberGrowth || analyticsData?.analytics?.subscriberGrowth || 0) > 0 ? '+' : ''}${analytics?.subscriberGrowth || analyticsData?.analytics?.subscriberGrowth || 0}%` : 
                    'N/A'
                  }
                </div>
                <p className="text-sm text-gray-400">Growth Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      {hasRealData ? (
        <div className="space-y-6">
          {/* Big Overall Growth Chart */}
          <Card className="bg-white/5 border-gray-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-300">
                  <TrendingUp className="w-6 h-6" />
                  Overall Channel Performance
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={viewChartType} onValueChange={(value: ChartType) => setViewChartType(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                    </SelectContent>
                  </Select>
                  <ColorPicker 
                    color={viewColor} 
                    onChange={setViewColor} 
                    label="Color"
                  />
                </div>
              </div>
              <CardDescription className="text-gray-400">
                {isLoading ? 'Loading data...' : `Comprehensive performance data from ${format(safeDateRange.from, 'MMM dd')} to ${format(safeDateRange.to, 'MMM dd')}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-80">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading performance data...</p>
                  </div>
                </div>
              ) : chartData.length > 0 ? (
                <ChartContainer config={{
                  subscribers: { label: 'Subscribers', color: subscriberColor },
                  views: { label: 'Views', color: viewColor },
                  videos: { label: 'Videos', color: 'rgb(168, 85, 247)' }
                }} className="h-[400px] w-full">
                  {viewChartType === 'bar' ? (
                    <BarChart data={chartData} barCategoryGap="20%" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), 'MMM d')} 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={10}
                        stroke="#9CA3AF"
                      />
                      <YAxis 
                        tickMargin={10}
                        stroke="#9CA3AF"
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <ChartTooltip 
                        cursor={false} 
                        content={<ChartTooltipContent />}
                      />
                      <Bar 
                        dataKey="subscribers" 
                        fill={subscriberColor} 
                        radius={4} 
                        name="Subscribers"
                      />
                      <Bar 
                        dataKey="views" 
                        fill={viewColor} 
                        radius={4} 
                        name="Views"
                      />
                      <Bar 
                        dataKey="videos" 
                        fill="rgb(168, 85, 247)" 
                        radius={4} 
                        name="Videos"
                      />
                    </BarChart>
                  ) : viewChartType === 'line' ? (
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), 'MMM d')} 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={10}
                        stroke="#9CA3AF"
                      />
                      <YAxis 
                        tickMargin={10}
                        stroke="#9CA3AF"
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="subscribers" 
                        stroke={subscriberColor} 
                        strokeWidth={3} 
                        dot={{ fill: subscriberColor, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: subscriberColor }}
                        name="Subscribers"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="views" 
                        stroke={viewColor} 
                        strokeWidth={3} 
                        dot={{ fill: viewColor, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: viewColor }}
                        name="Views"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="videos" 
                        stroke="rgb(168, 85, 247)" 
                        strokeWidth={3} 
                        dot={{ fill: "rgb(168, 85, 247)", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "rgb(168, 85, 247)" }}
                        name="Videos"
                      />
                    </LineChart>
                  ) : (
                    <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="fillSubscribers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={subscriberColor} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={subscriberColor} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={viewColor} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={viewColor} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="fillVideos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgb(168, 85, 247)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="rgb(168, 85, 247)" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), 'MMM d')} 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={10}
                        stroke="#9CA3AF"
                      />
                      <YAxis 
                        tickMargin={10}
                        stroke="#9CA3AF"
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="subscribers" 
                        stroke={subscriberColor} 
                        fill="url(#fillSubscribers)" 
                        strokeWidth={3} 
                        dot={{ fill: subscriberColor, strokeWidth: 2, r: 4 }}
                        name="Subscribers"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="views" 
                        stroke={viewColor} 
                        fill="url(#fillViews)" 
                        strokeWidth={3} 
                        dot={{ fill: viewColor, strokeWidth: 2, r: 4 }}
                        name="Views"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="videos" 
                        stroke="rgb(168, 85, 247)" 
                        fill="url(#fillVideos)" 
                        strokeWidth={3} 
                        dot={{ fill: "rgb(168, 85, 247)", strokeWidth: 2, r: 4 }}
                        name="Videos"
                      />
                    </AreaChart>
                  )}
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-80">
                  <p className="text-gray-500">No performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Individual Charts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Subscriber Growth Chart */}
            <Card className="bg-white/5 border-gray-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-300">
                    <Users className="w-5 h-5" />
                    Subscriber Growth
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={subscriberChartType} onValueChange={(value: ChartType) => setSubscriberChartType(value)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="bar">Bar</SelectItem>
                        <SelectItem value="area">Area</SelectItem>
                      </SelectContent>
                    </Select>
                    <ColorPicker 
                      color={subscriberColor} 
                      onChange={setSubscriberColor} 
                      label="Color"
                    />
                  </div>
                </div>
                <CardDescription className="text-gray-400">
                  {isLoading ? 'Loading data...' : `Data from ${format(safeDateRange.from, 'MMM dd')} to ${format(safeDateRange.to, 'MMM dd')}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading chart data...</p>
                    </div>
                  </div>
                ) : chartData.length > 0 ? (
                  <ChartContainer config={subscriberChartConfig} className="h-[300px] w-full">
                    {subscriberChartType === 'bar' ? (
                      <BarChart data={chartData} barCategoryGap="20%" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'MMM d')} 
                          tickLine={false} 
                          axisLine={false} 
                          tickMargin={10}
                          stroke="#9CA3AF"
                        />
                        <YAxis 
                          tickMargin={10}
                          stroke="#9CA3AF"
                          tickFormatter={(value) => formatNumber(value)}
                          domain={['dataMin - 1000', 'dataMax + 1000']}
                        />
                        <ChartTooltip 
                          cursor={false} 
                          content={<ChartTooltipContent />}
                        />
                        <Bar 
                          dataKey="subscribers" 
                          fill={subscriberColor} 
                          radius={4} 
                        />
                      </BarChart>
                    ) : subscriberChartType === 'line' ? (
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'MMM d')} 
                          tickLine={false} 
                          axisLine={false} 
                          tickMargin={10}
                          stroke="#9CA3AF"
                        />
                        <YAxis 
                          tickMargin={10}
                          stroke="#9CA3AF"
                          tickFormatter={(value) => formatNumber(value)}
                          domain={['dataMin - 1000', 'dataMax + 1000']}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="subscribers" 
                          stroke={subscriberColor} 
                          strokeWidth={3} 
                          dot={{ fill: subscriberColor, strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: subscriberColor }}
                        />
                      </LineChart>
                    ) : (
                      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="fillSubscribers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={subscriberColor} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={subscriberColor} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'MMM d')} 
                          tickLine={false} 
                          axisLine={false} 
                          tickMargin={10}
                          stroke="#9CA3AF"
                        />
                        <YAxis 
                          tickMargin={10}
                          stroke="#9CA3AF"
                          tickFormatter={(value) => formatNumber(value)}
                          domain={['dataMin - 1000', 'dataMax + 1000']}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area 
                          type="monotone" 
                          dataKey="subscribers" 
                          stroke={subscriberColor} 
                          fill="url(#fillSubscribers)" 
                          strokeWidth={3} 
                          dot={{ fill: subscriberColor, strokeWidth: 2, r: 4 }}
                        />
                      </AreaChart>
                    )}
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No subscriber data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* View Growth Chart */}
            <Card className="bg-white/5 border-gray-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-300">
                    <Eye className="w-5 h-5" />
                    View Growth
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={viewChartType} onValueChange={(value: ChartType) => setViewChartType(value)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="bar">Bar</SelectItem>
                        <SelectItem value="area">Area</SelectItem>
                      </SelectContent>
                    </Select>
                    <ColorPicker 
                      color={viewColor} 
                      onChange={setViewColor} 
                      label="Color"
                    />
                  </div>
                </div>
                <CardDescription className="text-gray-400">
                  {isLoading ? 'Loading data...' : `Data from ${format(safeDateRange.from, 'MMM dd')} to ${format(safeDateRange.to, 'MMM dd')}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading chart data...</p>
                    </div>
                  </div>
                ) : chartData.length > 0 ? (
                  <ChartContainer config={viewChartConfig} className="h-[300px] w-full">
                    {viewChartType === 'bar' ? (
                      <BarChart data={chartData} barCategoryGap="20%" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'MMM d')} 
                          tickLine={false} 
                          axisLine={false} 
                          tickMargin={10}
                          stroke="#9CA3AF"
                        />
                        <YAxis 
                          tickMargin={10}
                          stroke="#9CA3AF"
                          tickFormatter={(value) => formatNumber(value)}
                          domain={['dataMin - 10000', 'dataMax + 10000']}
                        />
                        <ChartTooltip 
                          cursor={false} 
                          content={<ChartTooltipContent />}
                        />
                        <Bar 
                          dataKey="views" 
                          fill={viewColor} 
                          radius={4} 
                        />
                      </BarChart>
                    ) : viewChartType === 'line' ? (
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'MMM d')} 
                          tickLine={false} 
                          axisLine={false} 
                          tickMargin={10}
                          stroke="#9CA3AF"
                        />
                        <YAxis 
                          tickMargin={10}
                          stroke="#9CA3AF"
                          tickFormatter={(value) => formatNumber(value)}
                          domain={['dataMin - 10000', 'dataMax + 10000']}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="views" 
                          stroke={viewColor} 
                          strokeWidth={3} 
                          dot={{ fill: viewColor, strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: viewColor }}
                        />
                      </LineChart>
                    ) : (
                      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={viewColor} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={viewColor} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'MMM d')} 
                          tickLine={false} 
                          axisLine={false} 
                          tickMargin={10}
                          stroke="#9CA3AF"
                        />
                        <YAxis 
                          tickMargin={10}
                          stroke="#9CA3AF"
                          tickFormatter={(value) => formatNumber(value)}
                          domain={['dataMin - 10000', 'dataMax + 10000']}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area 
                          type="monotone" 
                          dataKey="views" 
                          stroke={viewColor} 
                          fill="url(#fillViews)" 
                          strokeWidth={3} 
                          dot={{ fill: viewColor, strokeWidth: 2, r: 4 }}
                        />
                      </AreaChart>
                    )}
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No view data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <NoAnalyticsData hasChannel={false} />
      )}
    </div>
  );
}
