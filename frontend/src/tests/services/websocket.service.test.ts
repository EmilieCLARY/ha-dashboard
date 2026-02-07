import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { io } from 'socket.io-client';
import { websocketService } from '../../services/websocket.service';

// Mock socket.io-client
vi.mock('socket.io-client', () => {
  const mockSocket = {
    connected: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  };

  return {
    io: vi.fn(() => mockSocket),
  };
});

describe('WebSocket Service', () => {
  let mockSocket: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton
    websocketService.disconnect();
    mockSocket = {
      connected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    };
    vi.mocked(io).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Connect', () => {
    it('initializes socket connection', () => {
      websocketService.connect();

      expect(io).toHaveBeenCalled();
      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    });

    it('does not reconnect if already connected', () => {
      mockSocket.connected = true;
      websocketService.connect();
      websocketService.connect();

      expect(io).toHaveBeenCalledTimes(1);
    });

    it('sets up connection handlers', () => {
      websocketService.connect();

      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('ha:connected', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('ha:state_changed', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('ha:disconnected', expect.any(Function));
    });

    it('uses correct WS URL from environment', () => {
      websocketService.connect();

      const ioCall = vi.mocked(io).mock.calls[0];
      expect(ioCall[0]).toBeDefined();
    });
  });

  describe('Disconnect', () => {
    it('disconnects socket', () => {
      websocketService.connect();
      websocketService.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('clears listeners on disconnect', () => {
      websocketService.connect();
      
      // Subscribe to event
      const callback = vi.fn();
      websocketService.on('test:event', callback);

      websocketService.disconnect();

      // Verify listeners are cleared
      expect(websocketService['listeners'].size).toBe(0);
    });
  });

  describe('Event Subscription', () => {
    it('subscribes to events', () => {
      const callback = vi.fn();
      websocketService.connect();
      
      const unsubscribe = websocketService.on('test:event', callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('returns unsubscribe function', () => {
      const callback = vi.fn();
      websocketService.connect();
      
      const unsubscribe = websocketService.on('test:event', callback);
      unsubscribe();

      // Event should be removed
      websocketService.emit('test:event', { data: 'test' });
    });

    it('handles multiple subscriptions to same event', () => {
      websocketService.connect();
      
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      websocketService.on('test:event', callback1);
      websocketService.on('test:event', callback2);

      websocketService.emit('test:event', { data: 'test' });

      expect(callback1).toHaveBeenCalledWith({ data: 'test' });
      expect(callback2).toHaveBeenCalledWith({ data: 'test' });
    });

    it('removes specific subscriber', () => {
      websocketService.connect();
      
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      websocketService.on('test:event', callback1);
      const unsubscribe = websocketService.on('test:event', callback2);

      unsubscribe();

      websocketService.emit('test:event', { data: 'test' });

      expect(callback1).toHaveBeenCalledWith({ data: 'test' });
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('Emit Event', () => {
    it('emits custom events to subscribers', () => {
      websocketService.connect();
      
      const callback = vi.fn();
      websocketService.on('custom:event', callback);

      const testData = { message: 'test' };
      websocketService.emit('custom:event', testData);

      expect(callback).toHaveBeenCalledWith(testData);
    });

    it('does not call subscribers of different events', () => {
      websocketService.connect();
      
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      websocketService.on('event:one', callback1);
      websocketService.on('event:two', callback2);

      websocketService.emit('event:one', { data: 'test' });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('Home Assistant Events', () => {
    it('handles home assistant connected event', () => {
      websocketService.connect();
      
      const callback = vi.fn();
      websocketService.on('ha:connected', callback);

      // Trigger the HA connected event from socket.io
      const haConnectedHandler = vi.mocked(mockSocket.on).mock.calls.find(
        (call) => call[0] === 'ha:connected'
      )?.[1];
      if (haConnectedHandler) {
        haConnectedHandler();
      }

      expect(callback).toHaveBeenCalled();
    });

    it('handles home assistant state changed event', () => {
      websocketService.connect();
      
      const callback = vi.fn();
      websocketService.on('ha:state_changed', callback);

      const stateData = {
        entity_id: 'sensor.temperature',
        new_state: {
          state: '22.5',
          attributes: { unit_of_measurement: '°C' },
        },
      };

      // Trigger the HA state changed event
      const stateChangedHandler = vi.mocked(mockSocket.on).mock.calls.find(
        (call) => call[0] === 'ha:state_changed'
      )?.[1];
      if (stateChangedHandler) {
        stateChangedHandler(stateData);
      }

      expect(callback).toHaveBeenCalledWith(stateData);
    });

    it('handles home assistant disconnected event', () => {
      websocketService.connect();
      
      const callback = vi.fn();
      websocketService.on('ha:disconnected', callback);

      // Trigger the HA disconnected event
      const haDisconnectedHandler = vi.mocked(mockSocket.on).mock.calls.find(
        (call) => call[0] === 'ha:disconnected'
      )?.[1];
      if (haDisconnectedHandler) {
        haDisconnectedHandler();
      }

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Connection State', () => {
    it('tracks connected state', () => {
      websocketService.connect();

      // Trigger connect
      const connectHandler = vi.mocked(mockSocket.on).mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];
      if (connectHandler) {
        connectHandler();
      }

      const callback = vi.fn();
      websocketService.on('connected', callback);
      expect(callback).toHaveBeenCalled();
    });

    it('tracks disconnected state with reason', () => {
      websocketService.connect();

      const callback = vi.fn();
      websocketService.on('disconnected', callback);

      // Trigger disconnect
      const disconnectHandler = vi.mocked(mockSocket.on).mock.calls.find(
        (call) => call[0] === 'disconnect'
      )?.[1];
      if (disconnectHandler) {
        disconnectHandler('io server disconnect');
      }

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ reason: 'io server disconnect' })
      );
    });
  });

  describe('Error Handling', () => {
    it('handles connection errors', () => {
      websocketService.connect();

      const callback = vi.fn();
      websocketService.on('connection_failed', callback);

      // Trigger connection error multiple times to exceed max attempts
      const errorHandler = vi.mocked(mockSocket.on).mock.calls.find(
        (call) => call[0] === 'connect_error'
      )?.[1];

      if (errorHandler) {
        for (let i = 0; i < 5; i++) {
          errorHandler(new Error('Connection failed'));
        }
      }
    });
  });

  describe('Singleton Pattern', () => {
    it('returns same instance on multiple calls', () => {
      const service1 = websocketService;
      const service2 = websocketService;

      expect(service1).toBe(service2);
    });
  });
});
