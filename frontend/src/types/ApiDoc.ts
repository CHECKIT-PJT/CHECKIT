export interface PathVariable {
  pathVariable: string;
  pathVariableDataType: string;
}

export interface RequestParam {
  requestParamName: string;
  requestParamDataType: string;
}

export interface DtoItem {
  dtoItemName: string;
  dataTypeName: string;
  isList: boolean;
}

export interface Dto {
  dtoName: string;
  dtoItems: DtoItem[];
  dtoType?: string;
}

export interface ApiResponse {
  statusCode: number;
  responseDescription: string;
}

export interface ApiDocListItem {
  apiSpecId: number;
  apiName: string;
  endpoint: string;
  method: string;
  category: string;
  description: string;
  header?: string;
}

export interface ApiDetail {
  apiName: string;
  endpoint: string;
  method: string;
  category: string;
  description: string;
  header?: string;
  pathVariables: PathVariable[];
  requestParams: RequestParam[];
  requestDto: Dto;
  responseDto: Dto;
  responses: ApiResponse[];
}
