
import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { Chart, ChartConfiguration, ChartData, ChartOptions } from 'chart.js/auto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ServerMonitor';
  private socket!: Socket;
  memChart: Chart | undefined;
  cpuChart: Chart | undefined;
  cpuType = '';
  noOfCpu = 0;
  serverStatus: 'connected' | 'disconnected' | 'connecting' = 'connecting';
  // Metrics for UI
  cpuUsage = 0;
  memoryAvailable = 0; // in KB or MB depending on value conversion
  temperature = 0;
  networkRx = 0;
  networkTx = 0;
  lastUpdated: Date | null = null;
  // Store the last raw events for details view
  lastMonitorEvent: any = null;
  lastConnectionInfo: any = null;
  showRawData = false;
  isDarkTheme = false;
  showMountDetails = false;
  showStorageDetails = false;

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadTheme();
    this.initializeSocket();
    this.initializeCharts();
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  private initializeSocket(): void {
    this.socket = io('http://localhost:9500', { autoConnect: false });

    this.socket.on('connect', () => {
      this.ngZone.run(() => {
        console.log('Socket connected to server');
        this.cdr.detectChanges();
      });
    });

    this.socket.on('disconnect', () => {
      this.ngZone.run(() => {
        this.serverStatus = 'disconnected';
        console.log('Disconnected from server');
        this.cdr.detectChanges();
      });
    });

    this.socket.on('connected', (connectData) => {
      this.ngZone.run(() => {
        this.serverStatus = 'connected';
        this.handleConnection(connectData);
        this.lastConnectionInfo = connectData;
        this.cdr.detectChanges();
      });
    });
    this.socket.on('os-update', (event) => {
      this.ngZone.run(() => {
        this.updateCharts(event);
        this.cdr.detectChanges();
      });
    });
    this.socket.on('error', (error) => {
      this.ngZone.run(() => {
        console.error('Socket error:', error);
        this.serverStatus = 'disconnected';
        this.cdr.detectChanges();
      });
    });

    this.socket.connect();
  }

  private initializeCharts(): void {
    const isDark = this.isDarkTheme;

    // Initialize Memory Chart
    const memCtx = document.getElementById('mChart') as HTMLCanvasElement;
    if (memCtx) {
      const memConfig: ChartConfiguration = {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [1, 0],
            backgroundColor: [
              isDark ? 'rgba(129, 140, 248, 0.8)' : 'rgba(99, 102, 241, 0.8)',
              isDark ? 'rgba(248, 113, 113, 0.8)' : 'rgba(239, 68, 68, 0.8)'
            ],
            hoverBackgroundColor: [
              isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(99, 102, 241, 1)',
              isDark ? 'rgba(248, 113, 113, 1)' : 'rgba(239, 68, 68, 1)'
            ],
            borderColor: [
              isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(99, 102, 241, 1)',
              isDark ? 'rgba(248, 113, 113, 1)' : 'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 2,
            hoverOffset: 8
          }],
          labels: ['Available', 'Used']
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: {
                  size: 14,
                  weight: 'normal' as any
                },
                usePointStyle: true,
                pointStyle: 'circle',
                color: isDark ? '#f1f5f9' : '#1e293b'
              }
            },
            tooltip: {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: isDark ? 'rgba(129, 140, 248, 0.5)' : 'rgba(99, 102, 241, 0.5)',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12,
              displayColors: true,
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                  return `${label}: ${value.toFixed(1)} MB (${percentage}%)`;
                }
              }
            }
          },
          animation: {
            animateScale: true,
            duration: 1000,
            easing: 'easeInOutQuart'
          } as any
        }
      };
      this.memChart = new Chart(memCtx, memConfig);
    }

    // Initialize CPU Chart
    const cpuCtx = document.getElementById('cChart') as HTMLCanvasElement;
    if (cpuCtx) {
      const cpuConfig: ChartConfiguration = {
        type: 'line',
        data: {
          datasets: [{
            label: 'CPU Usage (%)',
            data: [],
            backgroundColor: isDark ? 'rgba(129, 140, 248, 0.1)' : 'rgba(99, 102, 241, 0.1)',
            borderColor: isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(99, 102, 241, 1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(99, 102, 241, 1)',
            pointBorderColor: isDark ? '#1e293b' : '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(99, 102, 241, 1)',
            pointHoverBorderColor: isDark ? '#1e293b' : '#fff',
            pointHoverBorderWidth: 3
          }],
          labels: Array(10).fill('')
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: isDark ? 'rgba(129, 140, 248, 0.5)' : 'rgba(99, 102, 241, 0.5)',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12,
              displayColors: false,
              callbacks: {
                label: function (context) {
                  return `CPU Usage: ${(context.parsed?.y || 0).toFixed(1)}%`;
                }
              }
            }
          },
          scales: {
            x: {
              display: false,
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              max: 100,
              grid: {
                color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                drawBorder: false
              } as any,
              ticks: {
                color: isDark ? '#94a3b8' : '#64748b',
                font: {
                  size: 12,
                  weight: 'bold'
                },
                padding: 8,
                callback: function (value) {
                  return value + '%';
                }
              }
            }
          },
          animation: {
            duration: 750,
            easing: 'easeInOutQuart' as any
          }
        }
      };
      this.cpuChart = new Chart(cpuCtx, cpuConfig);
    }
  }

  private updateCharts(event: any): void {
    this.lastMonitorEvent = event;
    if (!this.memChart || !this.cpuChart) return;

    // Update Memory Chart
    const memData = event.memory || {
      free: event.freemem || 0,
      total: event.totalmem || 0,
      available: event.memory?.available ?? event.available
    };

    // Prefer `available` (actual usable memory) if present, otherwise fallback to `free`.
    const freeMemory = (memData.available ?? memData.free) as number;
    const usedMemory = memData.total - freeMemory;
    // convert to MB for chart display
    const freeMemoryMB = Math.round((freeMemory / (1024 * 1024)) * 10) / 10;
    const usedMemoryMB = Math.round((usedMemory / (1024 * 1024)) * 10) / 10;

    this.memChart.data.labels = [
      `Available: ${freeMemoryMB} MB`,
      `Used: ${usedMemoryMB} MB`
    ];

    this.memChart.data.datasets.forEach((dataset) => {
      dataset.data = [freeMemoryMB, usedMemoryMB];
    });
    this.memChart.update('active');

    // Update CPU Chart
    const cpuUsage = event.cpu?.usage || event.loadavg?.[2] || 0;
    this.cpuUsage = Math.round(cpuUsage * 10) / 10;

    this.cpuChart.data.datasets.forEach((dataset) => {
      if (dataset.data.length >= 10) {
        dataset.data.shift();
      }
      dataset.data.push(cpuUsage);
    });

    this.cpuChart.update('active');

    // Update UI metrics
    this.temperature = event.temperature || 0;
    // memoryAvailable may be in bytes; convert to MB for UI readability
    const memAvailable = (event.memory?.available ?? event.memory?.free ?? 0) as number;
    this.memoryAvailable = Math.round((memAvailable / (1024 * 1024)) * 10) / 10; // MB
    // network stats (if present) – choose rx_sec & tx_sec or rx_bytes/tx_bytes
    const net = event.network || {};
    const rxPerSec = (net.rx_sec ?? net.rx_bytes ?? 0) / (1024); // KB/sec
    const txPerSec = (net.tx_sec ?? net.tx_bytes ?? 0) / (1024); // KB/sec
    this.networkRx = Math.round(rxPerSec * 10) / 10;
    this.networkTx = Math.round(txPerSec * 10) / 10;
    // update last updated timestamp for UI
    this.lastUpdated = new Date();
  }

  private handleConnection(connectData: any): void {
    this.cpuType = connectData.type || 'Unknown';
    this.noOfCpu = connectData.cpus || 0;
    console.log('System info:', connectData);
  }

  formatBytes(bytes: number, decimals: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1000;
    const dm = decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  formatUptime(uptimeSeconds: number): string {
    if (!uptimeSeconds && uptimeSeconds !== 0) return '—';
    const secNum = Number(uptimeSeconds);
    const d = Math.floor(secNum / (3600 * 24));
    const h = Math.floor((secNum % (3600 * 24)) / 3600);
    const m = Math.floor((secNum % 3600) / 60);
    const s = Math.floor(secNum % 60);
    return (d > 0 ? `${d}d ` : '') + `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  getDiskUsage(): number {
    if (!this.lastMonitorEvent?.fs || this.lastMonitorEvent.fs.length === 0) return 0;
    const totalSize = this.lastMonitorEvent.fs.reduce((sum: number, disk: any) => sum + disk.size, 0);
    const totalUsed = this.lastMonitorEvent.fs.reduce((sum: number, disk: any) => sum + disk.used, 0);
    return Math.round((totalUsed / totalSize) * 100);
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.saveTheme();
    this.applyTheme();
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.applyTheme();
  }

  private saveTheme(): void {
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  private applyTheme(): void {
    if (this.isDarkTheme) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }

    // Update charts with new theme colors
    this.updateChartsTheme();
  }

  getCpuCoresDisplay(): string {
    if (!this.lastMonitorEvent?.cpu?.cores) return '—';
    return this.lastMonitorEvent.cpu.cores.map((c: number) => c.toFixed(1)).join(', ');
  }

  getLoadAvgDisplay(): string {
    if (!this.lastMonitorEvent?.loadavg) return '—';
    return this.lastMonitorEvent.loadavg.map((l: number) => l.toFixed(2)).join(' / ');
  }

  private updateChartsTheme(): void {
    if (this.memChart) {
      const isDark = this.isDarkTheme;
      this.memChart.data.datasets.forEach((dataset) => {
        dataset.backgroundColor = [
          isDark ? 'rgba(129, 140, 248, 0.8)' : 'rgba(99, 102, 241, 0.8)',
          isDark ? 'rgba(248, 113, 113, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ];
        dataset.hoverBackgroundColor = [
          isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(99, 102, 241, 1)',
          isDark ? 'rgba(248, 113, 113, 1)' : 'rgba(239, 68, 68, 1)'
        ];
        dataset.borderColor = [
          isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(99, 102, 241, 1)',
          isDark ? 'rgba(248, 113, 113, 1)' : 'rgba(239, 68, 68, 1)'
        ];
      });
      (this.memChart.options.plugins!.legend as any).labels!.color = isDark ? '#f1f5f9' : '#1e293b';
      (this.memChart.options.plugins!.tooltip as any).backgroundColor = isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(0, 0, 0, 0.8)';
      this.memChart.update('none');
    }

    if (this.cpuChart) {
      const isDark = this.isDarkTheme;
      this.cpuChart.data.datasets.forEach((dataset) => {
        const d = dataset as any;
        d.backgroundColor = isDark ? 'rgba(129, 140, 248, 0.1)' : 'rgba(99, 102, 241, 0.1)';
        d.borderColor = isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(99, 102, 241, 1)';
        d.pointBackgroundColor = isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(99, 102, 241, 1)';
        d.pointBorderColor = isDark ? '#1e293b' : '#fff';
        d.pointHoverBackgroundColor = isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(99, 102, 241, 1)';
        d.pointHoverBorderColor = isDark ? '#1e293b' : '#fff';
      });
      (this.cpuChart.options.plugins!.tooltip as any).backgroundColor = isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(0, 0, 0, 0.8)';
      (this.cpuChart.options.scales!['y'] as any).grid!.color = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
      (this.cpuChart.options.scales!['y'] as any).ticks!.color = isDark ? '#94a3b8' : '#64748b';
      this.cpuChart.update('none');
    }
  }
  isTextEllipsed(element: HTMLElement): boolean {
    return element.scrollWidth > element.clientWidth;
  }

  addTooltipIfEllipsed(element: HTMLElement | null, text: string): void {
    if (element && this.isTextEllipsed(element)) {
      element.setAttribute('title', text);
    } else if (element) {
      element.removeAttribute('title');
    }
  }
}
