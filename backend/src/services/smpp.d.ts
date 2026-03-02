declare module 'smpp' {
  import { EventEmitter } from 'events';
  import { Socket } from 'net';

  export interface Pdu {
    command_length: number;
    command_id: number;
    command_status: number;
    sequence_number: number;
    message_id?: string;
    [key: string]: any;
  }

  export interface Session extends EventEmitter {
    bind_transceiver(options: any, callback: (pdu: Pdu) => void): void;
    bind_transmitter(options: any, callback: (pdu: Pdu) => void): void;
    submit_sm(options: any, callback: (pdu: Pdu) => void): void;
    close(): void;
    connect(): void;
    pause(): void;
    resume(): void;
    paused: boolean;
    socket?: Socket;
  }

  export interface SessionOptions {
    url?: string;
    host?: string;
    port?: number;
    auto_enquire_link_period?: number;
    debug?: boolean;
    tls?: any;
  }

  export function connect(options: SessionOptions | string, listener?: () => void): Session;
  export function connect(url: string, listener?: () => void): Session;

  export const ESME_ROK: number;
  // Add other constants or methods as needed
}