import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { RequestManager } from 'src/app/managers/request_manager';

const httpOptions = {
    headers: new HttpHeaders({
        'Accept': 'application/json',
    }),
}

@Injectable()
export class EventoService {

  constructor(private requestManager: RequestManager) {
    this.requestManager.setPath('EVENTO_SERVICE');
  }
  get(endpoint) {
    this.requestManager.setPath('EVENTO_SERVICE');
    return this.requestManager.get(endpoint);
  }
  post(endpoint, element) {
    this.requestManager.setPath('EVENTO_SERVICE');
    return this.requestManager.post(endpoint, element);
  }
  put(endpoint, element) {
    this.requestManager.setPath('EVENTO_SERVICE');
    return this.requestManager.put(endpoint, element);
  }
  delete(endpoint, element) {
    this.requestManager.setPath('EVENTO_SERVICE');
    return this.requestManager.delete(endpoint, element.Id);
  }
}
