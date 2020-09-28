import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ErrorDialogService } from '../dialogs/error-dialog/error-dialog.service';
import { environment } from '../../environments/environment';
import { ISequenceProperties } from 'src/app/protein-expression.interface';


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
    private errorDialogService: ErrorDialogService
  ) { }

  ngOnInit(): void {
    this.sequenceUrl = environment.urls.sequencePropertiesUrl;

    this.sequenceForm = this.fb.group({
      sequenceType: ['', Validators.required],
      sequence: ['', Validators.required]
    });
  }

  onSubmitSequence(): void {
    this.http.get<ISequenceProperties>(
      this.sequenceUrl,
      this.sequenceForm.value
    )
    .pipe(
      tap( (properties) => {
        console.log('XXX Properties: ', JSON.stringify(properties));
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
