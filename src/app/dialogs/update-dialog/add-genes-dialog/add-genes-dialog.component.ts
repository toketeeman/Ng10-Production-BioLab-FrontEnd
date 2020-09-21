import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  Validators
} from "@angular/forms";
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";
import { of } from "rxjs";

import {
  IFastaResponse,
  IFastaEntry,
  IGene
} from "../../../protein-expression.interface";
import { TargetRegistrationService } from "../../../services/target-registration.service";
import { environment } from "../../../../environments/environment";

@Component({
  templateUrl: './add-genes-dialog.component.html',
  styleUrls: ['./add-genes-dialog.component.scss']
})
export class AddGenesDialogComponent implements OnInit {
  subunitName: string;              // Passed in for the selected subunit.
  genes: IGene[];                   // Passed in for the selected subunit.
  dnaForm: FormGroup;               // Built for add-gene dialog to capture fasta file's DNA gene.
  genesForm: FormGroup;             // For generating payload for add-genes (gene-registration) endpoint
  addButtonIsActivated = false;
  targetAddGenesUrl: string;

  constructor(
    private dialogRef: MatDialogRef<AddGenesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private fb: FormBuilder,
    private targetRegistrationService: TargetRegistrationService,
    private http: HttpClient
  ) {
    // Grab the passed-in data. Yes, must be done in the constructor!
    this.subunitName = data.subunitName;
    this.genes = data.genes;

    this.targetAddGenesUrl = environment.urls.targetAddGenesUrl;
  }

  ngOnInit() {
    // Construct the form to manage the fasta file upload request.
    this.dnaForm = this.fb.group({
      dna: ["", Validators.required],
      dna_filename: ["", Validators.required],
      genes: this.fb.array([])
    });

    // Construct the form to manage the add-gene request.
    this.genesForm = this.fb.group({
      genes: this.fb.array([])
    });
  }

  onFileChange(event: any): void {
    // Collect the new genes from a fasta file and append them to
    // the gene form.

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;

      this.targetRegistrationService.uploadFastaFile('dna', file).subscribe(
        (response: IFastaResponse) => {

          const validationError = this.validateUploadedGenes(this.subunitName, this.genes, response.fasta_entries);

          if (validationError && validationError.hasOwnProperty('wrongSubunitError')) {
            this.dialogRef.close({
              error: `Attempted to add a gene to wrong subunit (${validationError.wrongSubunitError}). No genes were added.`
            });
            return;
          }

          if (validationError && validationError.hasOwnProperty('duplicateGeneError')) {
            this.dialogRef.close({
              error: `Attempted to add a duplicate gene (${validationError.duplicateGeneError}). No genes were added.`
            });
            return;
          }

          const genesArrayForm = this.genesForm.get('genes') as FormArray;
          response.fasta_entries.forEach(item => {
            genesArrayForm.push(this.createGeneForm(item.fasta_description, item.sequence));
          });

          // Gene upload is successful. Activate the Add button here.
          this.addButtonIsActivated = true;
        },
        ( _: any) => {
          this.dialogRef.close({ error: 'Invalid FASTA DNA file. No genes were added.' });
        }
      );
    }
  }

  // Some uploaded gene validations.
  validateUploadedGenes(currentSubunitName: string, genes: IGene[], fastaEntries: IFastaEntry[]): any {

    // This regex is good enough, but note: '_v\d+' and '_no_stop' occurring by themselves as total descriptions
    // would also get extracted here as subunit names - extremely rare, but almost certainly causing no harm
    // anyway since they would NEVER be sensibly used as subunit names!
    const subunitNameMatchExp = /^(.+?)((_v\d+)?|(_no_stop)?)?$/;

    // Confirm that the fastaEntry descriptions have the same encoded subunit name as the selected subunit's name.
    for (const fastaEntry of fastaEntries ) {
      const matches = fastaEntry.fasta_description.match(subunitNameMatchExp);
      const extractedSubunitName = matches[1];
      if (extractedSubunitName !== currentSubunitName) {
        return { wrongSubunitError: extractedSubunitName };
      }
    }

    // Confirm that the total fastaEntry descriptions do NOT duplicate any of the selected subunit's existing genes' descriptions.
    for (const fastaEntry of fastaEntries ) {
      for (const gene of genes) {
        if ( fastaEntry.fasta_description === gene.dna_fasta_description) {
          return { duplicateGeneError: gene.dna_fasta_description };
        }
      }
    }

    // Successful validation.
    return '';
  }

  createGeneForm(description: string, sequence: string): FormGroup {
    return this.fb.group({
      dna_fasta_description: [description],
      dna_sequence: [sequence],
    });
  }

  onAddGenes(): void {
    // Issue add-genes request to endpoint.
    this.http.post<any>(this.targetAddGenesUrl, this.genesForm.value)
    .pipe(
      tap( ( _: any) => {
        this.dialogRef.close({ success: true });
      }),
      catchError( (error: any) => {
        this.dialogRef.close({ backendError: error });
        return of(null);
      })
    )
    .subscribe();
  }

  onCancel() {
    this.dialogRef.close({ cancel: true });
  }

}
