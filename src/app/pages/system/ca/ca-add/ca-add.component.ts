import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Validators } from '@angular/forms';
import * as _ from 'lodash';
import {Subscription} from 'rxjs';

import { RestService, SystemGeneralService, WebSocketService } from '../../../../services/';
import { FieldConfig } from '../../../common/entity/entity-form/models/field-config.interface';
import { T } from '../../../../translate-marker';
import { matchOtherValidator } from '../../../common/entity/entity-form/validators/password-validation';

@Component({
  selector : 'system-ca-add',
  template : `<entity-form [conf]="this"></entity-form>`,
  providers : [ SystemGeneralService ]
})

export class CertificateAuthorityAddComponent {

  protected addCall = "certificateauthority.create";
  protected route_success: string[] = [ 'system', 'ca' ];
  protected isEntity: boolean = true;
  protected fieldConfig: FieldConfig[] = [
    {
      type : 'input',
      name : 'name',
      placeholder : T('Identifier'),
      tooltip: T('Enter a descriptive name for the CA using\
                  only alphanumeric, underscore (_), and dash (-)\
                  characters.'),
      required: true,
      validation : [ Validators.required ]
    },
    {
      type : 'select',
      name : 'create_type',
      placeholder : T('Type'),
      options : [
        {label: 'Internal CA', value: 'CA_CREATE_INTERNAL'},
        {label: 'Intermediate CA', value: 'CA_CREATE_INTERMEDIATE'},
        {label: 'Import CA', value: 'CA_CREATE_IMPORTED'},
      ],
      value: 'CA_CREATE_INTERNAL',
    },
    {
      type : 'select',
      name : 'signedby',
      placeholder : T('Signing Certificate Authority'),
      tooltip: T('Select the previously imported or created <a\
                  href="..//docs/system.html#cas"\
                  target="_blank">CA</a>.'),
      options : [
        {label: '---', value: null}
      ],
      isHidden: true,
      disabled: true,
      required: true,
      validation: [Validators.required]
    },
    {
      type : 'select',
      name : 'key_length',
      placeholder : T('Key Length'),
      tooltip:T('For security reasons, a minimum of <i>2048</i>\
                 is recommended.'),
      options : [
        {label : '1024', value : 1024},
        {label : '2048', value : 2048},
        {label : '4096', value : 4096},
      ],
      value: 2048,
      required: true,
      validation: [Validators.required],
      isHidden: false,
    },
    {
      type : 'select',
      name : 'digest_algorithm',
      placeholder : T('Digest Algorithm'),
      tooltip: T('The default is acceptable unless the organization\
                  requires a different algorithm.'),
      options : [
        {label : 'SHA1', value : 'SHA1'},
        {label : 'SHA224', value : 'SHA224'},
        {label : 'SHA256', value : 'SHA256'},
        {label : 'SHA384', value : 'SHA384'},
        {label : 'SHA512', value : 'SHA512'},
      ],
      value: 'SHA256',
      required: true,
      validation: [Validators.required],
      isHidden: false,
    },
    {
      type : 'input',
      name : 'lifetime',
      placeholder : T('Lifetime'),
      tooltip: T('The lifetime of the CA is specified in days.'),
      inputType: 'number',
      required: true,
      value: 3650,
      validation: [Validators.required, Validators.min(0)],
      isHidden: false,
    },
    {
      type : 'select',
      name : 'country',
      placeholder : T('Country'),
      tooltip: T('Select the country for the organization.'),
      options : [
      ],
      value: 'US',
      required: true,
      validation: [Validators.required],
      isHidden: false,
    },
    {
      type : 'input',
      name : 'state',
      placeholder : T('State'),
      tooltip: T('Enter the state or province of the organization.'),
      required: true,
      validation: [Validators.required],
      isHidden: false,
    },
    {
      type : 'input',
      name : 'city',
      placeholder : T('Locality'),
      tooltip: T('Enter the location of the organization.'),
      required: true,
      validation: [Validators.required],
      isHidden: false,
    },
    {
      type : 'input',
      name : 'organization',
      placeholder : T('Organization'),
      tooltip: T('Enter the name of the company or organization.'),
      required: true,
      validation: [Validators.required],
      isHidden: false,
    },
    {
      type : 'input',
      name : 'email',
      placeholder : T('Email'),
      tooltip: T('Enter the email address of the person responsible for\
                  the CA.'),
      required: true,
      validation : [ Validators.email, Validators.required ],
      isHidden: false,
    },
    {
      type : 'input',
      name : 'common',
      placeholder : T('Common Name'),
      tooltip: T('Enter the <a href="https://kb.iu.edu/d/aiuv"\
                  target="_blank">fully-qualified hostname (FQDN)</a> of\
                  the system. This name **must** be unique within a\
                  certificate chain.'),
      required: true,
      validation : [ Validators.required ],
      isHidden: false,
    },
    {
      type : 'textarea',
      name : 'san',
      placeholder: T('Subject Alternate Names'),
      tooltip: T('Multi-domain support. Enter additional space separated\
                  domains.'),
      isHidden: false,
    },
    {
      type : 'textarea',
      name : 'certificate',
      placeholder : T('Certificate'),
      tooltip : T('Enter or paste in the certificate for the CA.'),
      required: true,
      validation : [ Validators.required ],
      isHidden: true,
    },
    {
      type : 'textarea',
      name : 'privatekey',
      placeholder : T('Private Key'),
      tooltip : T('Enter or paste the private key when one is associated\
                   with the <b>Certificate</b>.'),
      isHidden: true,
    },
    {
      type : 'input',
      name : 'Passphrase',
      placeholder : T('Passphrase'),
      tooltip : T('Enter the passphrase for the <b>Private Key</b>.'),
      inputType : 'password',
      validation : [ matchOtherValidator('Passphrase2') ],
      isHidden: true,
    },
    {
      type : 'input',
      name : 'Passphrase2',
      inputType : 'password',
      placeholder : T('Confirm Passphrase'),
      isHidden: true,
    },
  ];

  private internalcaFields: Array<any> = [
    'key_length',
    'digest_algorithm',
    'lifetime',
    'country',
    'state',
    'city',
    'organization',
    'email',
    'common',
    'san',
  ];
  private intermediatecaFields: Array<any> = [
    'signedby',
    'key_length',
    'digest_algorithm',
    'lifetime',
    'country',
    'state',
    'city',
    'organization',
    'email',
    'common',
    'san',
  ];
  private importcaFields: Array<any> = [
    'certificate',
    'privatekey',
    'Passphrase',
    'Passphrase2',
  ];

  private country: any;
  private signedby: any;

  constructor(protected router: Router, protected route: ActivatedRoute,
              protected rest: RestService, protected ws: WebSocketService,
              protected systemGeneralService: SystemGeneralService) {}

  preInit() {
    this.systemGeneralService.getUnsignedCAs().subscribe((res) => {
      this.signedby = _.find(this.fieldConfig, {'name' : 'signedby'});
      res.forEach((item) => {
        this.signedby.options.push(
            {label : item.name, value : item.id});
      });
    });

    this.ws.call('notifier.choices', ['COUNTRY_CHOICES']).subscribe( (res) => {
      this.country = _.find(this.fieldConfig, {'name' : 'country'});
      res.forEach((item) => {
        this.country.options.push(
          { label : item[1], value : item[0]}
        );
      });
    });
  }

  afterInit(entity: any) {
    for (let i in this.intermediatecaFields) {
      this.hideField(this.intermediatecaFields[i], true, entity);
    }
    for (let i in this.importcaFields) {
      this.hideField(this.importcaFields[i], true, entity);
    }
    for (let i in this.internalcaFields) {
      this.hideField(this.internalcaFields[i], false, entity);
    }

    entity.formGroup.controls['create_type'].valueChanges.subscribe((res) => {
      if (res == 'CA_CREATE_INTERNAL') {
        for (let i in this.intermediatecaFields) {
          this.hideField(this.intermediatecaFields[i], true, entity);
        }
        for (let i in this.importcaFields) {
          this.hideField(this.importcaFields[i], true, entity);
        }
        for (let i in this.internalcaFields) {
          this.hideField(this.internalcaFields[i], false, entity);
        }
      } else if (res == 'CA_CREATE_INTERMEDIATE') {
        for (let i in this.internalcaFields) {
          this.hideField(this.internalcaFields[i], true, entity);
        }
        for (let i in this.importcaFields) {
          this.hideField(this.importcaFields[i], true, entity);
        }
        for (let i in this.intermediatecaFields) {
          this.hideField(this.intermediatecaFields[i], false, entity);
        }
      } else if (res == 'CA_CREATE_IMPORTED') {
        for (let i in this.internalcaFields) {
          this.hideField(this.internalcaFields[i], true, entity);
        }
        for (let i in this.intermediatecaFields) {
          this.hideField(this.intermediatecaFields[i], true, entity);
        }
        for (let i in this.importcaFields) {
          this.hideField(this.importcaFields[i], false, entity);
        }
      }
    })
  }

  hideField(fieldName: any, show: boolean, entity: any) {
    let target = _.find(this.fieldConfig, {'name' : fieldName});
    target.isHidden = show;
    entity.setDisabled(fieldName, show);
  }

  beforeSubmit(data: any) {
    if (data.san == undefined || data.san == '') {
      data.san = [];
    } else {
      data.san = _.split(data.san, ' ');
    }
  }
}
