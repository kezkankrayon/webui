import { Component } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';

import { EntityFormComponent } from '../../../common/entity/entity-form';
import { FieldConfig } from '../../../common/entity/entity-form/models/field-config.interface';
import { FieldSet } from 'app/pages/common/entity/entity-form/models/fieldset.interface';
import { TaskService, UserService } from '../../../../services/';
import { EntityFormService } from '../../../common/entity/entity-form/services/entity-form.service';
import { FormGroup } from '@angular/forms';
import { T } from '../../../../translate-marker';
import { Validators } from '@angular/forms';

@Component({
  selector: 'rsync-task-add',
  template: `<entity-form [conf]="this"></entity-form>`,
  providers: [TaskService, UserService, EntityFormService]
})
export class RsyncFormComponent {

  protected resource_name: string = 'tasks/rsync';
  protected route_success: string[] = ['tasks', 'rsync'];
  protected entityForm: EntityFormComponent;
  protected isEntity: boolean = true;

  protected preTaskName: string = 'rsync';
  public fieldConfig: FieldConfig[] = []
  public fieldSets: FieldSet[] = [
    {
      name:'Rsync Task',
      class:'add-rsync',
      label:true,
      width:'300px',
      config: [
      {
        type : 'explorer',
        initial: '/mnt',
        name: 'rsync_path',
        explorerType: 'directory',
        placeholder: T('Path'),
        tooltip: T('Browse to the path to be copied. Path lengths cannot\
                    be greater than 255 characters.'),
        required: true,
        validation : [ Validators.required ]
      }, {
        type: 'combobox',
        name: 'rsync_user',
        placeholder: T('User'),
        tooltip: T('The chosen user must have permission to write to the\
                    specified directory on the remote system.'),
        options: [],
        required: true,
        validation : [ Validators.required ],
      }, {
        type: 'input',
        name: 'rsync_remotehost',
        placeholder: T('Remote Host'),
        required: true,
        validation : [ Validators.required ],
        tooltip: T('Enter the IP address or hostname of the remote\
                    system that will store the copy. Use the format\
                    <i>username@remote_host</i> if the username differs\
                    on the remote host.'),
      }, {
        type: 'input',
        name: 'rsync_remoteport',
        inputType: 'number',
        placeholder: T('Remote SSH Port'),
        value: 22,
        tooltip: T('Enter the SSH Port of the remote system.'),
      }, {
        type: 'select',
        name: 'rsync_mode',
        placeholder: T('Rsync mode'),
        tooltip: T('Choose <a href="guide" target="_blank">Rsync\
                    module</a> or <a href="guide" target="_blank">Rsync\
                    over SSH</a>'),
        options: [],
      }, {
        type: 'input',
        name: 'rsync_remotemodule',
        placeholder: T('Remote Module Name'),
        tooltip: T('At least one module must be defined in <a\
                    href="https://www.samba.org/ftp/rsync/rsyncd.conf.html"\
                    target="_blank">rsyncd.conf(5)</a> of the rsync\
                    server or in the <b>Rsync Modules</b> of another\
                    system.'),
      }, {
        type : 'explorer',
        initial: '/mnt',
        name: 'rsync_remotepath',
        explorerType: 'directory',
        placeholder: T('Remote Path'),
        tooltip: T('Browse to the existing path on the remote host to\
                    sync with. Maximum path length is 255 characters'),
      }, {
        type: 'checkbox',
        name: 'rsync_validate_rpath',
        placeholder: T('Validate Remote Path'),
        tooltip: T('Set to automatically create the defined <b>Remote\
                    Path</b> if it does not exist.'),
        value: true,
      }, {
        type: 'select',
        name: 'rsync_direction',
        placeholder: T('Direction'),
        tooltip: T('Direct the flow of data to the remote host.'),
        options: [],
        required: true,
        validation : [ Validators.required ]
      }, {
        type: 'input',
        name: 'rsync_description',
        placeholder: T('Short Description'),
        tooltip: T('Optional. Enter an informative description of the\
                    new rsync task.'),
      }, {
        type: 'scheduler',
        name: 'rsync_picker',
        placeholder: T('Schedule the Rsync Task'),
        tooltip: T('Choose one of the convenient presets\
          or choose <b>Custom</b> to trigger the advanced scheduler UI'),
          required: true
      }, {
        type: 'checkbox',
        name: 'rsync_recursive',
        placeholder: T('Recursive'),
        tooltip: T('Set to include all subdirectories of the specified\
                    pool during the rsync task.'),
        value: true,
      }, {
        type: 'checkbox',
        name: 'rsync_times',
        placeholder: T('Times'),
        tooltip: T('Set to preserve modification times of files.'),
        value: true,
      }, {
        type: 'checkbox',
        name: 'rsync_compress',
        placeholder: T('Compress'),
        tooltip: T('Set to reduce the size of data to transmit.\
                    Recommended for slow connections.'),
        value: true,
      }, {
        type: 'checkbox',
        name: 'rsync_archive',
        placeholder: T('Archive'),
        tooltip: T('Equivalent to the <b>-rlptgoD</b> flag. This will\
                    run the task as recursive, copy symlinks as symlinks,\
                    preserve permissions, preserve modification times,\
                    preserve group, preserve owner (root only), preserve\
                    device files (root only), and preserve special files.'),
      }, {
        type: 'checkbox',
        name: 'rsync_delete',
        placeholder: T('Delete'),
        tooltip: T('Set to delete files in the destination directory\
                    that do not exist in the sending directory.'),
      }, {
        type: 'checkbox',
        name: 'rsync_quiet',
        placeholder: T('Quiet'),
        tooltip: T('Set to suppress informational messages from the\
                    remote server.'),
      }, {
        type: 'checkbox',
        name: 'rsync_preserveperm',
        placeholder: T('Preserve permissions'),
        tooltip: T('Set to preserve original file permissions. This is\
                    useful when the user is set to <i>root</i>.'),
      }, {
        type: 'checkbox',
        name: 'rsync_preserveattr',
        placeholder: T('Preserve extended attributes'),
        tooltip: T('Both systems must support <a\
                    href="https://en.wikipedia.org/wiki/Extended_file_attributes"\
                    target="_blank">extended attributes</a> to set.'),
      }, {
        type: 'checkbox',
        name: 'rsync_delayupdates',
        placeholder: T('Delay Updates'),
        tooltip: T('Set to save the temporary file from each updated\
                    file to a holding directory until the end of the\
                    transfer when all transferred files are renamed\
                    into place.'),
        value: true,
      }, {
        type: 'textarea',
        name: 'extra',
        placeholder: T('Extra options'),
        tooltip: T('Add any other <a\
                    href="https://rsync.samba.org/ftp/rsync/rsync.html"\
                    target="_blank">rsync(1)</a> options. The "*"\
                    character must be escaped with a backslash (\\*.txt)\
                    or used inside single quotes(\'*.txt\').'),
      }, {
        type: 'checkbox',
        name: 'rsync_enabled',
        placeholder: T('Enabled'),
        tooltip: T('Unset to disable the rsync task without deleting it.\
                    When the <a href="..//docs/services.html#rsync"\
                    target="_blank">Rsync service</a> is OFF, the rsync\
                    task continues to look for the server unless this\
                    option is unset.'),
        value: true,
      }
    ]
  }];

  protected hide_fileds: Array<any>;
  protected rsync_module_field: Array<any> = [
    'rsync_remotemodule',
  ];
  protected rsync_ssh_field: Array<any> = [
    'rsync_remoteport',
    'rsync_remotepath',
    'rsync_validate_rpath',
  ];
  protected user_field: any;
  protected rsync_mode_field: any;
  protected rsync_direction_field: any;

  constructor(protected router: Router,
    protected taskService: TaskService,
    protected userService: UserService,
    protected entityFormService: EntityFormService) {}

  preInit() {
    this.hide_fileds = this.rsync_ssh_field;

    this.user_field = _.find(this.fieldSets[0].config, { 'name': 'rsync_user' });
    this.userService.listUsers().subscribe((res) => {
      res.data.forEach((item) => {
        this.user_field.options.push({ label: item.bsdusr_username, value: item.bsdusr_username })
      });
    });

    this.rsync_mode_field = _.find(this.fieldSets[0].config, { 'name': 'rsync_mode' });
    this.taskService.getRsyncModeChoices().subscribe((res) => {
      res.forEach((item) => {
        this.rsync_mode_field.options.push({ label: item[1], value: item[0] });
      });
    });

    this.rsync_direction_field = _.find(this.fieldSets[0].config, { 'name': 'rsync_direction' });
    this.taskService.getRsyncDirectionChoices().subscribe((res) => {
      res.forEach((item) => {
        this.rsync_direction_field.options.push({ label: item[1], value: item[0] });
      });
    });
  }

  afterInit(entityForm) {
    entityForm.formGroup.controls['rsync_mode'].valueChanges.subscribe((res) => {
      if( res === "ssh" ){
        this.hide_fileds = this.rsync_module_field;
      }
      else {
        this.hide_fileds = this.rsync_ssh_field;
      }
    });
  }

  beforeSubmit(value){
    let spl = value.rsync_picker.split(" ");
    delete value.rsync_picker;
    value['rsync_minute'] = spl[0];
    value['rsync_hour'] = spl[1];
    value['rsync_daymonth'] = spl[2];
    value['rsync_month'] = spl[3];
    value['rsync_dayweek'] = spl[4];
  }

  resourceTransformIncomingRestData(data) {
    data['rsync_picker'] = data.rsync_minute + " " + 
                          data.rsync_hour + " " + 
                          data.rsync_daymonth + " " + 
                          data.rsync_month + " " + 
                          data.rsync_dayweek;
    return data;
  }
}
