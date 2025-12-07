import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WearableDevice,
  WearableType,
  ConnectionStatus,
} from '../../entities/wearable-device.entity';
import { NotificationService } from '../../services/notification.service';

@Injectable()
export class WearableService {
  constructor(
    @InjectRepository(WearableDevice)
    private wearableRepository: Repository<WearableDevice>,
    private notificationService: NotificationService,
  ) {}

  async connectDevice(
    userId: string,
    deviceType: WearableType,
    deviceName: string,
    accessToken?: string,
    refreshToken?: string,
  ): Promise<WearableDevice> {
    const device = this.wearableRepository.create({
      userId,
      deviceType,
      deviceName,
      accessToken,
      refreshToken,
      status: ConnectionStatus.CONNECTED,
      lastSyncAt: new Date(),
    });

    const savedDevice = await this.wearableRepository.save(device);

    this.notificationService.sendPushNotification(userId, {
      title: 'Device Connected',
      body: `${deviceName} has been successfully connected.`,
    });

    return savedDevice;
  }

  async findAll(userId: string): Promise<WearableDevice[]> {
    return this.wearableRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<WearableDevice> {
    const device = await this.wearableRepository.findOne({
      where: { id, userId },
    });

    if (!device) {
      throw new NotFoundException('Wearable device not found');
    }

    return device;
  }

  async disconnectDevice(id: string, userId: string): Promise<void> {
    const device = await this.findOne(id, userId);

    device.status = ConnectionStatus.DISCONNECTED;
    device.accessToken = null;
    device.refreshToken = null;

    await this.wearableRepository.save(device);

    this.notificationService.sendPushNotification(userId, {
      title: 'Device Disconnected',
      body: `${device.deviceName} has been disconnected.`,
    });
  }

  async syncDevice(id: string, userId: string): Promise<WearableDevice> {
    const device = await this.findOne(id, userId);

    device.status = ConnectionStatus.SYNCING;
    await this.wearableRepository.save(device);

    // Simulate sync (in production, this would call actual APIs)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    device.status = ConnectionStatus.CONNECTED;
    device.lastSyncAt = new Date();
    device.syncStats = {
      ...device.syncStats,
      totalSyncs: (device.syncStats?.totalSyncs || 0) + 1,
      lastSyncDuration: 2000,
      dataPointsSynced: Math.floor(Math.random() * 1000) + 100,
    };

    return this.wearableRepository.save(device);
  }

  async updateSettings(
    id: string,
    userId: string,
    settings: {
      autoSync?: boolean;
      syncFrequencyMinutes?: number;
      syncedDataTypes?: string[];
    },
  ): Promise<WearableDevice> {
    const device = await this.findOne(id, userId);

    if (settings.autoSync !== undefined) {
      device.autoSync = settings.autoSync;
    }
    if (settings.syncFrequencyMinutes !== undefined) {
      device.syncFrequencyMinutes = settings.syncFrequencyMinutes;
    }
    if (settings.syncedDataTypes !== undefined) {
      device.syncedDataTypes = settings.syncedDataTypes;
    }

    return this.wearableRepository.save(device);
  }

  async getSyncHistory(userId: string): Promise<any> {
    const devices = await this.findAll(userId);

    return devices.map((device) => ({
      deviceId: device.id,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      lastSyncAt: device.lastSyncAt,
      syncStats: device.syncStats,
      status: device.status,
    }));
  }

  async getStatistics(userId: string): Promise<any> {
    const devices = await this.findAll(userId);

    const stats = {
      totalDevices: devices.length,
      connectedDevices: devices.filter(
        (d) => d.status === ConnectionStatus.CONNECTED,
      ).length,
      disconnectedDevices: devices.filter(
        (d) => d.status === ConnectionStatus.DISCONNECTED,
      ).length,
      totalSyncs: devices.reduce(
        (sum, d) => sum + (d.syncStats?.totalSyncs || 0),
        0,
      ),
      totalDataPoints: devices.reduce(
        (sum, d) => sum + (d.syncStats?.dataPointsSynced || 0),
        0,
      ),
      devicesByType: {} as Record<string, number>,
      lastSyncDate: null as Date | null,
    };

    devices.forEach((device) => {
      stats.devicesByType[device.deviceType] =
        (stats.devicesByType[device.deviceType] || 0) + 1;

      if (
        device.lastSyncAt &&
        (!stats.lastSyncDate || device.lastSyncAt > stats.lastSyncDate)
      ) {
        stats.lastSyncDate = device.lastSyncAt;
      }
    });

    return stats;
  }

  async syncAllDevices(userId: string): Promise<any> {
    const devices = await this.wearableRepository.find({
      where: {
        userId,
        status: ConnectionStatus.CONNECTED,
        autoSync: true,
      },
    });

    const results = await Promise.all(
      devices.map(async (device) => {
        try {
          await this.syncDevice(device.id, userId);
          return { deviceId: device.id, success: true };
        } catch (error) {
          return { deviceId: device.id, success: false, error: error.message };
        }
      }),
    );

    return {
      totalDevices: devices.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }
}
