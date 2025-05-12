import type {
  ApiDetail,
  ApiSpecRequest,
  Dto,
  DtoItem,
  PathVariable,
  RequestParam,
  DtoRequest,
  DtoItemRequest,
  PathVariableRequest,
  QueryStringRequest,
  ApiResponse,
} from '../types/apiDocs';

// API Detail → API Spec Request 변환
export const convertToApiSpecRequest = (
  apiDetail: ApiDetail
): ApiSpecRequest => {
  const dtoList: DtoRequest[] = [];

  if (apiDetail.requestDto && apiDetail.requestDto.dtoName) {
    dtoList.push({
      id: apiDetail.requestDto.id,
      dtoName: apiDetail.requestDto.dtoName,
      dtoType: 'REQUEST',
      fields: apiDetail.requestDto.fields.map(item => ({
        id: item.id,
        dtoItemName: item.dtoItemName,
        dataType: item.dataType,
        isList: item.isList,
      })),
    });
  }

  if (apiDetail.responseDto && apiDetail.responseDto.dtoName) {
    dtoList.push({
      id: apiDetail.responseDto.id,
      dtoName: apiDetail.responseDto.dtoName,
      dtoType: 'RESPONSE',
      fields: apiDetail.responseDto.fields.map(item => ({
        id: item.id,
        dtoItemName: item.dtoItemName,
        dataType: item.dataType,
        isList: item.isList,
      })),
    });
  }

  return {
    id: apiDetail.id,
    apiName: apiDetail.apiName,
    endpoint: apiDetail.endpoint,
    method: apiDetail.method,
    category: apiDetail.category,
    description: apiDetail.description,
    statusCode:
      apiDetail.statusCode || (apiDetail.responses?.[0]?.statusCode ?? 200),
    header: apiDetail.header || '',

    pathVariables: apiDetail.pathVariables.map(pv => ({
      id: pv.id,
      pathVariable: pv.pathVariable,
      pathVariableDataType: pv.pathVariableDataType,
    })),

    queryStrings: apiDetail.requestParams.map(param => ({
      id: param.id,
      queryStringVariable: param.requestParamName,
      queryStringDataType: param.requestParamDataType,
    })),

    responses: apiDetail.responses || [],

    dtoList,
  };
};

// API Spec Response → API Detail 변환
export const convertFromApiResponse = (response: any): ApiDetail => {
  const emptyDto: Dto = {
    id: 0,
    dtoName: '',
    fields: [],
  };

  const pathVariables: PathVariable[] =
    response.pathVariables?.map((pv: PathVariableRequest) => ({
      id: pv.id,
      pathVariable: pv.pathVariable,
      pathVariableDataType: pv.pathVariableDataType,
    })) || [];

  const requestParams: RequestParam[] =
    response.queryStrings?.map((qs: QueryStringRequest) => ({
      id: qs.id,
      requestParamName: qs.queryStringVariable,
      requestParamDataType: qs.queryStringDataType,
    })) || [];

  const responses: ApiResponse[] =
    response.responses?.length > 0
      ? response.responses
      : [
          {
            statusCode: response.statusCode ?? 200,
            responseDescription: getStatusCodeDescription(
              response.statusCode ?? 200
            ),
          },
        ];

  const apiDetail: ApiDetail = {
    id: response.id,
    apiName: response.apiName,
    endpoint: response.endpoint,
    method: response.method,
    category: response.category,
    description: response.description,
    statusCode: response.statusCode ?? 200,
    header: response.header || '',
    pathVariables,
    requestParams,
    requestDto: { ...emptyDto },
    responseDto: { ...emptyDto },
    responses,
    dtoList: response.dtoList || [],
  };

  if (response.dtoList && response.dtoList.length > 0) {
    response.dtoList.forEach((dto: DtoRequest) => {
      const dtoFields: DtoItem[] =
        dto.fields?.map((field: DtoItemRequest) => ({
          id: field.id,
          dtoItemName: field.dtoItemName,
          dataType: field.dataType,
          isList: field.isList,
        })) || [];

      if (dto.dtoType === 'REQUEST') {
        apiDetail.requestDto = {
          id: dto.id,
          dtoName: dto.dtoName,
          dtoType: 'REQUEST',
          fields: dtoFields,
        };
      } else if (dto.dtoType === 'RESPONSE') {
        apiDetail.responseDto = {
          id: dto.id,
          dtoName: dto.dtoName,
          dtoType: 'RESPONSE',
          fields: dtoFields,
        };
      }
    });
  }

  return apiDetail;
};

// 유효성 검사
export const validateApiSpecRequest = (request: ApiSpecRequest): boolean => {
  return !!(
    request.apiName &&
    request.endpoint &&
    request.method &&
    request.category
  );
};

// 상태 코드에 대한 설명 반환
const getStatusCodeDescription = (code: number): string => {
  const descriptions: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
  };

  return descriptions[code] || 'Unknown Status';
};
