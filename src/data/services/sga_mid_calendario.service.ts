import { Injectable } from '@angular/core';
import { RequestManager } from 'src/app/managers/request_manager';

@Injectable()
export class SgaMidCalendarioService {

  constructor(private requestManager: RequestManager) {
    this.requestManager.setPath('SGA_MID_CALENDARIO_SERVICE');
  }

  get(endpoint: string) {
    this.requestManager.setPath('SGA_MID_CALENDARIO_SERVICE');
    return this.requestManager.get(endpoint);
  }

  post(endpoint: string, element: any) {
    this.requestManager.setPath('SGA_MID_CALENDARIO_SERVICE');
    return this.requestManager.post(endpoint, element);
  }

  post_file(endpoint: string, element: any) {
    this.requestManager.setPath('SGA_MID_CALENDARIO_SERVICE');
    return this.requestManager.post_file(endpoint, element);
  }

  put(endpoint: string, element: any) {
    this.requestManager.setPath('SGA_MID_CALENDARIO_SERVICE');
    return this.requestManager.put(endpoint, element);
  }

  delete(endpoint: string, element: any) {
    this.requestManager.setPath('SGA_MID_CALENDARIO_SERVICE');
    return this.requestManager.delete(endpoint, element.Id);
  }
}
