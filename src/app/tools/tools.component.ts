import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';

import { HttpClient, HttpEvent, HttpResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
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
    private route: ActivatedRoute,
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

    // Restore the form value if coming back from sequence properties page.
    const currentRouteUrl = this.route.snapshot.url;
    const currentRouteUrlLength = currentRouteUrl.length;
    const path = currentRouteUrl[currentRouteUrlLength - 1].path;
    if (path === 'back-from-sequence-property') {
      const propertiesData: any =  this.toolsSequencePropertyStoreService.retrieveToolsSequencePropertyState();
      if (propertiesData.selectionType === 'DNA') {
        this.sequenceForm.patchValue({
          sequence_type: propertiesData.selectionType,
          sequence: propertiesData.enteredDNASequence
        });
      } else {
        this.sequenceForm.patchValue({
          sequence_type: propertiesData.selectionType,
          sequence: (propertiesData.returnedSequenceProperties as ISequenceProperties).amino_acid_sequence
        });
      }
    }

    // Reset the tools-sequence-property store.
    this.toolsSequencePropertyStoreService.resetToolsSequencePropertyState();
  }

  onSubmitSequence(): void {
    this.http.post<HttpResponse<ISequenceProperties>>(
      this.sequenceUrl,
      this.sequenceForm.value
    )
    .pipe(
      tap( (sequenceProperties: any) => {
        // Store properties into state store service.
        const sequenceTypeControl = 'sequence_type';
        const sequenceControl = 'sequence';
        const enteredSequenceType = this.sequenceForm.controls[sequenceTypeControl].value;
        const enteredSequence = this.sequenceForm.controls[sequenceControl].value;

        this.toolsSequencePropertyStoreService.storeToolsSequencePropertyState(
          sequenceProperties as ISequenceProperties,
          enteredSequenceType,
          enteredSequenceType === 'DNA' ? enteredSequence : ''
        );

        this.router.navigateByUrl('/home/sequence-property');
      }),
      catchError(error => {
        this.errorDialogService.openDialogForErrorResponse(
          error,
          ['message'],
          'Sequence could not be processed.'
        );
        return of(null);
      })
    )
    .subscribe();
  }
}
