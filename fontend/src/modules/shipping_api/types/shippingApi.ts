import { QCInspectionRecord } from '../../qc/types/qc';

export type CarrierApiStatus = 'HEALTHY' | 'MAINTENANCE' | 'SLOW' | 'DISCONNECTED';

export interface CarrierApiEndpointConfig {
  carrierCode: string;
  carrierName: string;
  logoColor: string;
  endpointUrl: string;
  method: 'POST';
  protocol: 'REST_JSON' | 'EDI_AS2' | 'SOAP_XML' | 'GRAPHQL';
  environment: 'PRODUCTION' | 'SANDBOX';
  authType: 'BEARER_TOKEN' | 'API_KEY' | 'OAUTH2' | 'MUTUAL_TLS';
  status: CarrierApiStatus;
  rateLimitPerMin: number;
  autoTransmitOnQcPass: boolean;
}

export interface CarrierApiLogRecord {
  id: string;
  transactionRef: string;
  carrierCode: string;
  carrierName: string;
  endpointUrl: string;
  httpMethod: 'POST';
  containerCount: number;
  containerNos: string[];
  requestHeaders: Record<string, string>;
  requestPayload: any;
  responseStatusCode: number;
  responseStatusText: string;
  responsePayload: any;
  ackReferenceNo?: string;
  latencyMs: number;
  status: 'SUCCESS' | 'FAILED' | 'RETRY_QUEUED';
  timestamp: string;
  triggeredBy: string;
  errorMessage?: string;
}
