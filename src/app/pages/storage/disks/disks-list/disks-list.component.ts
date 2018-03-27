import { Component, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RestService } from '../../../../services/';
import { TourService } from '../../../../services/tour.service';
import { debug } from 'util';
import { EntityUtils } from '../../../common/entity/utils';
import { EntityTableComponent, InputTableConf } from 'app/pages/common/entity/entity-table/entity-table.component';
import { DialogService } from 'app/services/dialog.service';
import { WebSocketService } from 'app/services/ws.service';
import { AppLoaderService } from 'app/services/app-loader/app-loader.service';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { ZfsPoolData, VolumesListTableConfig } from 'app/pages/storage/volumes/volumes-list/volumes-list.component';
import { ErdService } from 'app/services/erd.service';
import { TranslateService } from '@ngx-translate/core';
import { T } from '../../../../translate-marker';

export class DisksListConfig implements InputTableConf {
    public flattenedVolData: any;
    public resource_name = 'storage/disk/';
    public hideTopActions = true;
    public diskMap: Map<string,string> = new Map<string,string>();
    
    public columns: Array<any> = [
      {name : 'Name', prop : 'disk_name'},
      {name : 'Serial', prop : 'disk_serial'},
      {name : 'Disk Size', prop : 'disk_size'},
      {name : 'Description', prop : 'disk_description'},
      {name : 'Transfer Mode', prop : 'disk_transfermode'},
      {name : 'HDD Standby', prop : 'disk_hddstandby'},
      {name : 'Advanced Power Management', prop : 'disk_advpowermgmt'},
      {name : 'Acoustic Level', prop : 'disk_acousticlevel'},
      {name : 'Enable S.M.A.R.T.', prop : 'disk_togglesmart'},
      {name : 'S.M.A.R.T. extra options', prop : 'disk_smartoptions'},
      {name : 'Enclosure Slot', prop : 'disk_enclosure_slot'}
    ];
    public config: any = {
      paging : true,
      sorting : {columns : this.columns},
    };
  
    constructor(
      protected parentDisksListComponent: DisksListComponent,
      protected _router: Router,
      protected _classId: string,
      public title: string, 
      protected loader: AppLoaderService, 
      protected dialogService: DialogService,
      protected rest: RestService ) {
  
      if (typeof (this._classId) !== "undefined" && this._classId !== "") {
        this.resource_name += "/" + this._classId;
      }
    }
    
    getActions(row) {
      const actions = [];
  
      actions.push({
        label : T("Edit"),
        onClick : (row1) => {
          this._router.navigate(new Array('/').concat([
            "storage", "disks", "edit", row1.disk_identifier
          ]));
        }
      });
      actions.push({
        label : T("Wipe"),
        onClick : (row1) => {
          this._router.navigate(new Array('/').concat([
            "storage", "disks", "wipe", row1.disk_name
          ]));
        }
      });

      actions.push({
        label : T("Detach"),
        onClick : (row1) => {
          this.loader.open();

          this.rest.post("storage/volume/" +  row1.disk_name + "/detach", { body: JSON.stringify({}) }).subscribe((restPostResp) => {
            this.loader.close();
  
            this.dialogService.Info(T("Cloned"), T("Successfully Promoted ") + row1.path).subscribe((infoResult) => {
              this.parentDisksListComponent.repaintMe();
            });
          }, (res) => {
            this.loader.close();
            this.dialogService.errorReport(T("Error Promoted dataset ") + row1.path, res.message, res.stack);
          });
        }
      });

  
      return actions;
    }

    rowValue(row, attr) {
      switch (attr) {
        case 'disk_size':
          return (<any>window).filesize(row[attr], { standard: "iec" });
        default:
          return row[attr];
      }
    }

    resourceTransformIncomingRestData(data: any): any {
      data = new EntityUtils().flattenData(data);
      const returnData: any[] = [];
      
      for (let i = 0; i < data.length; i++) {

        if( this.diskMap.size < 1 ) {
          returnData.push(data[i]);
        } else if( this.diskMap.has(data[i].disk_name) ) {
          returnData.push(data[i]);
        } 
      }
      
      console.log("this:", this);
      return returnData;
    };
    
  }


@Component({
  selector: 'app-disks-list',
  templateUrl: './disks-list.component.html'
})
export class DisksListComponent extends EntityTableComponent implements OnInit, AfterViewInit {

  zfsPoolRows: ZfsPoolData[] = [];
  expanded_all = true;
  expanded_zfs = false;
  conf: DisksListConfig;
  public readonly ALL_DISKS = T("All Disks");
  public selectedKeyName;
  isShown = true;

  public title = T("View Disks");

  constructor(protected rest: RestService, protected router: Router, protected ws: WebSocketService,
    protected _eRef: ElementRef, protected dialogService: DialogService, protected loader: AppLoaderService, 
    protected erdService: ErdService, protected translate: TranslateService) {
    super(rest, router, ws, _eRef, dialogService, loader, erdService, translate);
      this.conf = new DisksListConfig(this, this.router, "", "", this.loader, this.dialogService, this.rest );
  }

  repaintMe() {
    this.isShown = false;
    setTimeout(()=>{
      this.isShown = true;
    }, -1 );
  }

  ngOnInit(): void {

    this.selectedKeyName = this.ALL_DISKS;
    
    

    this.rest.get("storage/volume", {}).subscribe((res) => {
      res.data.forEach((volume) => {
        volume.disksListConfig = new DisksListConfig(this, this.router, "", volume.name, this.loader, this.dialogService, this.rest );
        volume.type = 'zpool';
        volume.isReady = false;
        try {
          volume.avail = (<any>window).filesize(volume.avail, { standard: "iec" });
        } catch( error ) {
          console.log("error", error );
        }

        try {
          volume.used = (<any>window).filesize(volume.used, { standard: "iec" });
        } catch( error ) {
          console.log("error", error );
        }

        this.zfsPoolRows.push(volume);
        const volumeId = volume.id;
        const volumeObj = volume;
        this.ws.call('pool.get_disks', [volumeId]).subscribe((resGetDisks) => {
          resGetDisks.forEach((driveName)=>{
            (<DisksListConfig>volumeObj.disksListConfig).diskMap.set(driveName, driveName);
          });

          volume.isReady = true;
        });
    
        
      });

      if( this.zfsPoolRows.length === 1 ) {
        this.expanded_zfs = true;
      }
    });

  }

  ngAfterViewInit(): void {

  }

  tabSelectChangeHandler($event): void {
    const selectedTabName: string = $event.tab.textLabel;
    this.selectedKeyName = selectedTabName; 
  }

}
