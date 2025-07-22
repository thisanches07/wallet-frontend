declare interface PluggyConnectOptions {
  connectToken: string;
}

declare interface PluggyConnector {
  id: number;
  name: string;
  imageUrl?: string;
  institutionUrl?: string;
  primaryColor?: string;
}

declare interface PluggyConnectionData {
  id: string;
  connector: PluggyConnector;
  status?: string;
  [key: string]: any;
}

declare class PluggyConnect {
  constructor(options: PluggyConnectOptions);
  init(options: {
    onSuccess?: (itemData: PluggyConnectionData) => void;
    onError?: (error: any) => void;
    onClose?: () => void;
  }): void;
}

interface Window {
  PluggyConnect: typeof PluggyConnect;
}
