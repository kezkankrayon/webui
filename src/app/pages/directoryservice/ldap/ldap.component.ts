import {ApplicationRef, Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import * as _ from 'lodash';
import {Subscription} from 'rxjs/Subscription';
import { Validators } from '@angular/forms';

import {
  RestService,
  SystemGeneralService,
  WebSocketService
} from '../../../services/';
import {
  FieldConfig
} from '../../common/entity/entity-form/models/field-config.interface';
import {  DialogService } from '../../../services/';

import { T } from '../../../translate-marker';

@Component({
  selector : 'app-ldap',
  template : '<entity-form [conf]="this"></entity-form>',
})

export class LdapComponent {
  protected resource_name = 'directoryservice/ldap';
  protected isBasicMode = true;
  protected idmapBacked: any;
  protected ldap_kerberos_realm: any;
  protected ldap_kerberos_principal: any;
  protected ldap_ssl: any;
  protected ldapCertificate: any;
  protected ldap_idmap_backend: any;
  protected ldap_schema: any;
  public custActions: Array<any> = [
    {
      id : 'basic_mode',
      name : 'Basic Mode',
      function : () => { this.isBasicMode = !this.isBasicMode; }
    },
    {
      id : 'advanced_mode',
      name : 'Advanced Mode',
      function : () => { this.isBasicMode = !this.isBasicMode; }
    },
    {
      id : 'edit_idmap',
      name : T('Edit Idmap'),
      function : () => {
        this.router.navigate(new Array('').concat(['directoryservice','idmap', this.idmapBacked, 'ldap']));
      }
    },
    {
      'id' : 'ds_clearcache',
      'name' : T('Rebuild Directory Service Cache'),
       function : async () => {
         this.ws.call('notifier.ds_clearcache').subscribe((cache_status)=>{
          this.dialogservice.Info(T("LDAP"), T("The cache is being rebuilt."));

        })
      }
    }
  ];

  public fieldConfig: FieldConfig[] = [
    {
      type : 'input',
      name : 'ldap_hostname',
      placeholder : T('Hostname'),
      tooltip: T('Enter the hostname or IP address of the LDAP server.'),
      required: true,
      validation : [ Validators.required ]
    },
    {
      type : 'input',
      name : 'ldap_basedn',
      placeholder : T('Base DN'),
      tooltip: T('Enter the top level of the LDAP directory tree to be\
                used when searching for resources. Example:\
                <i>dc=test,dc=org</i>.')
    },
    {
      type : 'input',
      name : 'ldap_binddn',
      placeholder : T('Bind DN'),
      tooltip: T('Enter the administrative account name on the LDAP server.\
                Example: <i>cn=Manager,dc=test,dc=org</i>.')
    },
    {
      type : 'input',
      name : 'ldap_bindpw',
      placeholder : T('Bind Password'),
      tooltip: T('Enter the password for the <b>Bind DN</b>.'),
      inputType : 'password'
    },
    {
      type : 'checkbox',
      name : 'ldap_anonbind',
      placeholder : T('Allow Anonymous Binding'),
      tooltip: T('Set for the LDAP server to disable authentication and\
                allow read and write access to any client.')
    },
    {
      type : 'input',
      name : 'ldap_usersuffix',
      placeholder : T('User Suffix'),
      tooltip: T('Enter a suffix to add to a name when the user account is\
                added to the LDAP directory.')
    },
    {
      type : 'input',
      name : 'ldap_groupsuffix',
      placeholder : T('Group Suffix'),
      tooltip: T('Enter a suffix to add to a name when the group is added\
                to the LDAP directory.')
    },
    {
      type : 'input',
      name : 'ldap_passwordsuffix',
      placeholder : T('Password Suffix'),
      tooltip: T('Enter a suffix to add to the password when it is added\
                to the LDAP directory.')
    },
    {
      type : 'input',
      name : 'ldap_machinesuffix',
      placeholder : T('Machine Suffix'),
      tooltip: T('Enter a suffix to add to the system name when it is\
                added to the LDAP directory.')
    },
    {
      type : 'input',
      name : 'ldap_sudosuffix',
      placeholder : T('SUDO Suffix'),
      tooltip: T('Enter the suffix for LDAP-based users that need\
                superuser access.')
    },
    {
      type : 'select',
      name : 'ldap_kerberos_realm',
      placeholder : T('Kerberos Realm'),
      tooltip: T('Select the realm created using the instructions in <a\
                href="..//docs/directoryservice.html#kerberos-realms"\
                target="_blank">Kerberos Realms</a>.'),
      options : []
    },
    {
      type : 'select',
      name : 'ldap_kerberos_principal',
      placeholder : T('Kerberos Principal'),
      tooltip: T('Select the location of the principal in the keytab\
                created as described in <a\
                href="..//docs/directoryservice.html#kerberos-keytabs"\
                target="_blank">Kerberos Keytabs</a>.'),
      options : []
    },
    {
      type : 'select',
      name : 'ldap_ssl',
      placeholder : T('Encryption Mode'),
      tooltip: T('Authentication only functions when a <b>Certificate</b>\
                is selected with either the <i>SSL</i> or <i>TLS</i>\
                option.'),
      options : []
    },
    {
      type : 'select',
      name : 'ldap_certificate',
      placeholder : T('Certificate'),
      tooltip: T('Select the LDAP CA certificate. The certificate for the\
                LDAP server CA must first be imported using the\
                <b>System/Certificates</b> menu.'),
      options : []
    },
    {
      type : 'input',
      name : 'ldap_timeout',
      placeholder : T('LDAP timeout'),
      tooltip: T('Add more time in seconds if a Kerberos ticket time out\
                occurs.')
    },
    {
      type : 'input',
      name : 'ldap_dns_timeout',
      placeholder : T('DNS timeout'),
      tooltip: T('Add more time in seconds if DNS queries timeout.')
    },
    {
      type : 'select',
      name : 'ldap_idmap_backend',
      placeholder : T('Idmap Backend'),
      tooltip: T('Select the backend used to map Windows security\
                identifiers (SIDs) to UNIX UIDs and GIDs. Click\
                <b>Edit</b> to configure that backend'),
      options : []
    },
    {
      type : 'checkbox',
      name : 'ldap_has_samba_schema',
      placeholder : 'Samba Schema',
      tooltip: T('Only set LDAP authentication for\
                SMB shares is required <b>and</b> the LDAP server is\
                <b>already</b> configured with Samba attributes.')
    },
    {
      type : 'textarea',
      name : 'ldap_auxiliary_parameters',
      placeholder : T('Auxiliary Parameters'),
      tooltip: T('Enter any additional options for <a\
                href="https://jhrozek.fedorapeople.org/sssd/1.11.6/man/sssd.conf.5.html"\
                target="_blank">sssd.conf(5)</a>.')
    },
    {
      type : 'select',
      name : 'ldap_schema',
      placeholder : T('Schema'),
      tooltip: T('Select a schema when <b>Samba Schema</b> is set.'),
      options : []
    },
    {
      type : 'checkbox',
      name : 'ldap_enable',
      placeholder : T('Enable'),
      tooltip: T('Unset to disable the configuration without deleting it.')
    },
    {
      type : 'input',
      name : 'ldap_netbiosname_a',
      placeholder : T('Netbios Name'),
      tooltip: T('Limited to 15 characters. This <b>must</b> be different\
                from the <i>Workgroup</i> name.')
    },
    {
      type : 'input',
      name : 'ldap_netbiosalias',
      placeholder : T('NetBIOS alias'),
      tooltip: T('Limited to 15 characters.')
    }
  ];

  protected advanced_field: Array<any> = [
    'ldap_anonbind',
    'ldap_usersuffix',
    'ldap_groupsuffix',
    'ldap_passwordsuffix',
    'ldap_machinesuffix',
    'ldap_sudosuffix',
    'ldap_kerberos_realm',
    'ldap_kerberos_principal',
    'ldap_ssl',
    'ldap_certificate',
    'ldap_timeout',
    'ldap_dns_timeout',
    'ldap_idmap_backend',
    'ldap_has_samba_schema',
    'ldap_auxiliary_parameters',
    'ldap_schema',
    'ldap_netbiosalias',
    'ldap_netbiosname_a'
  ];

  isCustActionVisible(actionId: string) {
    if (actionId === 'advanced_mode' && this.isBasicMode === false) {
      return false;
    } else if (actionId === 'basic_mode' && this.isBasicMode === true) {
      return false;
    } else if (actionId === 'edit_idmap' && this.isBasicMode === true) {
      return false;
    }
    return true;
  }




  constructor(protected router: Router, protected route: ActivatedRoute,
              protected rest: RestService, protected ws: WebSocketService,
              protected _injector: Injector, protected _appRef: ApplicationRef,
              protected systemGeneralService: SystemGeneralService,
              private dialogservice: DialogService) {}

  afterInit(entityEdit: any) {
    this.rest.get("directoryservice/kerberosrealm", {}).subscribe((res) => {
      this.ldap_kerberos_realm = _.find(this.fieldConfig, {name : 'ldap_kerberos_realm'});
      res.data.forEach((item) => {
        this.ldap_kerberos_realm.options.push(
          {label : item.krb_realm, value : item.id});
      });
    });

    this.rest.get("directoryservice/kerberosprincipal", {}).subscribe((res) => {
      this.ldap_kerberos_principal = _.find(this.fieldConfig, {name : 'ldap_kerberos_principal'});
      res.data.forEach((item) => {
        this.ldap_kerberos_principal.options.push(
          {label : item.principal_name, value : item.id});
      });
    });

    this.ws.call('notifier.choices', ['LDAP_SSL_CHOICES']).subscribe((res) => {
      this.ldap_ssl = _.find(this.fieldConfig, {name : 'ldap_ssl'});
      res.forEach((item) => {
        this.ldap_ssl.options.push(
          {label : item[1], value : item[0]});
      });
    });

    this.systemGeneralService.getCA().subscribe((res) => {
      this.ldapCertificate =
          _.find(this.fieldConfig, {name : 'ldap_certificate'});
      res.forEach((item) => {
        this.ldapCertificate.options.push(
          {label : item.name, value : item.id});
      });
    });

    this.ws.call('notifier.choices', ['IDMAP_CHOICES']).subscribe((res) => {
      this.ldap_idmap_backend = _.find(this.fieldConfig, {name : 'ldap_idmap_backend'});
      res.forEach((item) => {
        this.ldap_idmap_backend.options.push(
          {label : item[1], value : item[0]});
      });
    });

    this.ws.call('notifier.choices', ['LDAP_SCHEMA_CHOICES']).subscribe((res) => {
      this.ldap_schema = _.find(this.fieldConfig, {name: 'ldap_schema'});
      res.forEach((item => {
        this.ldap_schema.options.push(
          {label : item[1], value : item[0]});
      }));
    });

    entityEdit.formGroup.controls['ldap_idmap_backend'].valueChanges.subscribe((res)=> {
      this.idmapBacked = res;
    })
  }
}
