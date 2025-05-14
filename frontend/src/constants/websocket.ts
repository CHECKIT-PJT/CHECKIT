export const SOCKET_ENDPOINTS = {
  PRESENCE_PUBLISH: '/pub/presence',
  PRESENCE_SUBSCRIBE: '/sub/presence',
} as const;

export const PRESENCE_ACTIONS = {
  ENTER: 'ENTER',
  LEAVE: 'LEAVE',
} as const;

export const RESOURCE_TYPES = {
  PAGE_API: 'page-api',
  API_SPEC: 'api',
  PAGE_FUNC: 'page-func',
  FUNC_SPEC: 'func',
} as const; 