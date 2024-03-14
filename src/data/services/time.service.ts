import { Injectable } from '@angular/core';
import { AnyService } from './any.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimeService {

  constructor(
    private anyService: AnyService,
    ) { }

  /**
   * Obtiene la hora actual real desde api (sga_mid)
   * @param format (string opcional) Elege un formato particular sin convertirlo a Date, UNIX | UTC | BOG
   * @returns (Date) Date from Bogota | (any) any segun format
   */
  async getDate(format?: string): Promise<Date> {
    return new Promise<Date>((resolve, reject) => {
    this.anyService.get(environment.SGA_MID_NOTAS_SERVICE,'time_bog')
      .subscribe((respTime: any) => {
        if (!format) {
          const timeNow = new Date(respTime.data.BOG);
          resolve(timeNow);
        } else {
          const raw = respTime.data[format];
          if (raw) {
            resolve(raw);
          } else {
            reject(undefined);
          }
        }
      }, error => {
        reject(undefined);
      });
    });
  }
}
