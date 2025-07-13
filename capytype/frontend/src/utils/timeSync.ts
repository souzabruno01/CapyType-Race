// Time synchronization utility for better multiplayer timing
import { Socket } from 'socket.io-client';

export class TimeSync {
  private serverOffset: number = 0;
  private rtt: number = 0;
  private lastSync: number = 0;
  private isCalibrated: boolean = false;

  constructor(private socket: Socket) {}

  async calibrate(): Promise<void> {
    if (!this.socket.connected) return;

    const samples: { rtt: number; offset: number }[] = [];
    
    // Take 5 samples for accuracy
    for (let i = 0; i < 5; i++) {
      try {
        const sample = await this.takeSample();
        if (sample) samples.push(sample);
        
        // Small delay between samples
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn('[TimeSync] Sample failed:', error);
      }
    }

    if (samples.length >= 3) {
      // Use median values to filter outliers
      this.rtt = this.median(samples.map(s => s.rtt));
      this.serverOffset = this.median(samples.map(s => s.offset));
      this.lastSync = Date.now();
      this.isCalibrated = true;
      
      console.log(`[TimeSync] Calibrated - RTT: ${this.rtt.toFixed(2)}ms, Offset: ${this.serverOffset.toFixed(2)}ms`);
    } else {
      console.warn('[TimeSync] Failed to calibrate - insufficient samples');
    }
  }

  private async takeSample(): Promise<{ rtt: number; offset: number } | null> {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const timeout = setTimeout(() => resolve(null), 5000); // 5s timeout
      
      this.socket.emit('timePing', t0);
      
      this.socket.once('timePong', (serverTime: number) => {
        clearTimeout(timeout);
        const t1 = performance.now();
        const rtt = t1 - t0;
        const offset = serverTime - (t0 + rtt / 2);
        
        resolve({ rtt, offset });
      });
    });
  }

  private median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  getServerTime(): number {
    if (!this.isCalibrated) return Date.now();
    return performance.now() + this.serverOffset;
  }

  getLagCompensation(): number {
    return this.rtt / 2; // Half RTT for lag prediction
  }

  shouldRecalibrate(): boolean {
    const timeSinceLastSync = Date.now() - this.lastSync;
    return timeSinceLastSync > 60000; // Recalibrate every minute
  }

  getNetworkQuality(): 'excellent' | 'good' | 'poor' {
    if (this.rtt < 50) return 'excellent';
    if (this.rtt < 150) return 'good';
    return 'poor';
  }
}
