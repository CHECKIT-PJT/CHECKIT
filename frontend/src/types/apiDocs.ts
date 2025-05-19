export interface PathVariable {
  id: number | null;
  pathVariable: string;
  pathVariableDataType: string;
}

export interface RequestParam {
  id: number | null;
  requestParamName: string;
  requestParamDataType: string;
}

export interface Dto {
  id: number | null;
  dtoName: string;
  dtoType?: 'REQUEST' | 'RESPONSE';
  fields: DtoItem[];
}

export interface DtoItem {
  id: number | null;
  dtoItemName: string;
  dataType: string;
  isList: boolean;
}

export interface ApiResponse {
  statusCode: number;
  responseDescription: string;
}

export interface ApiDocListItem {
  apiSpecId: number | null;
  apiName: string;
  endpoint: string;
  method: string;
  category: string;
  description: string;
  header?: string;
}

export interface ApiDetail {
  id: number | null;
  apiName: string;
  endpoint: string;
  method: string;
  category: string;
  description: string;
  statusCode: number;
  header?: string;
  queryStrings: QueryStringRequest[];
  pathVariables: PathVariable[];
  requestDto: Dto;
  responseDto: Dto;
  responses: ApiResponse[];
  dtoList?: Dto[];
}

export interface ApiSpecRequest {
  id?: number | null;
  apiName: string;
  endpoint: string;
  method: string;
  category: string;
  description: string;
  statusCode: number;
  header?: string;
  queryStrings: QueryStringRequest[];
  pathVariables: PathVariableRequest[];
  dtoList: DtoRequest[];
  responses: ApiResponse[];
}

export interface QueryStringRequest {
  id: number | null;
  queryStringVariable: string;
  queryStringDataType: string;
}

export interface PathVariableRequest {
  id: number | null;
  pathVariable: string;
  pathVariableDataType: string;
}

export interface DtoRequest {
  id: number | null;
  dtoName: string;
  dtoType: 'REQUEST' | 'RESPONSE';
  fields: DtoItemRequest[];
}

export interface DtoItemRequest {
  id: number | null;
  dtoItemName: string;
  dataType: string;
  isList: boolean;
}
