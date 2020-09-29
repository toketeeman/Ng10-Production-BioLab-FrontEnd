import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';

import { HttpClient, HttpEvent, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ErrorDialogService } from '../dialogs/error-dialog/error-dialog.service';
import { environment } from '../../environments/environment';
import { ISequenceProperties } from '../protein-expression.interface';
import { ToolsSequencePropertyStoreService } from '../services/tools-sequence-property-store.service';

@Component({
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {
  sequenceForm: FormGroup;          // For entering sequence for translation/properties.
  sequenceUrl: string;


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private errorDialogService: ErrorDialogService,
    private toolsSequencePropertyStoreService: ToolsSequencePropertyStoreService
  ) { }

  ngOnInit(): void {
    // Setting up the form and url for sequence properties tool.
    this.sequenceUrl = environment.urls.sequencePropertiesUrl;

    this.sequenceForm = this.fb.group({
      sequence_type: ['', Validators.required],
      sequence: ['', Validators.required]
    });
  }

  onSubmitSequence(): void {

    console.log('XXX sequenceUrl: ', this.sequenceUrl);
    console.log('XXX sequenceForm.value: ', JSON.stringify(this.sequenceForm.value));

    // this.http.post<HttpResponse<ISequenceProperties>>(
    //   this.sequenceUrl,
    //   this.sequenceForm.value
    // )
    // .pipe(
    //   tap( (response: any) => {
    //     console.log('XXX Properties: ', JSON.stringify(response));

    //     // Store properties into state store service.
    //     const sequenceTypeControl = 'sequence_type';
    //     const sequenceControl = 'sequence';
    //     const enteredSequenceType = this.sequenceForm.controls[sequenceTypeControl].value;
    //     const enteredSequence = this.sequenceForm.controls[sequenceControl].value;

    //     this.toolsSequencePropertyStoreService.storeToolsSequencePropertyState(
    //       response.data as ISequenceProperties,
    //       enteredSequenceType,
    //       enteredSequenceType === 'DNA' ? enteredSequence : ''
    //     );

    //     this.router.navigateByUrl('/home/sequence-property');
    //   }),
    //   catchError(error => {
    //     console.log('XXX Error: ', JSON.stringify(error));

    //     this.errorDialogService.openDialogForErrorResponse(
    //       error,
    //       ['message'],
    //       'Sequence could not be processed.'
    //     );
    //     return of(null);
    //   })
    // )
    // .subscribe();

    // TEST SECTION ONLY
    const sequenceTypeControl = 'sequence_type';
    const sequenceControl = 'sequence';
    const enteredSequenceType = this.sequenceForm.controls[sequenceTypeControl].value;
    const enteredSequence = this.sequenceForm.controls[sequenceControl].value;

    const testData: ISequenceProperties  = {
      amino_acid_sequence: 'TDSQE',
      avg_molecular_weight_ox: '578.5271',
      monoisotopic_weight_ox: '578.2184',
      avg_molecular_weight_red: '578.5271',
      monoisotopic_weight_red: '578.2184',
      isoelectric_point: '4.0842',
      gravy: '-2.4',
      aromaticity: '0.0',
      e280_mass_ox: '0.0',
      e280_mass_red: '0.0',
      e214_mass: '6.9919',
      e280_molar_ox: '0',
      e280_molar_red: '0',
      e214_molar: '4045'
    };

    this.toolsSequencePropertyStoreService.storeToolsSequencePropertyState(
      testData as ISequenceProperties,
      enteredSequenceType,
      enteredSequenceType === 'DNA' ? enteredSequence : ''
    );

    const retrievedTestData: any =  this.toolsSequencePropertyStoreService.retrieveToolsSequencePropertyState();
    console.log('XXX Retrieved Test Data: ', JSON.stringify(retrievedTestData));

    this.router.navigateByUrl('/home/sequence-property');
    // END OF TEST SECTION

  }
}
