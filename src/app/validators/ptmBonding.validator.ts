import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

import { ISubunit } from '../protein-expression.interface';

export function PTMBonding(
  subunits: ISubunit[],
  subunitOne: string,
  subunitOneCopy: string,
  subunitOneResidue: string,
  subunitTwo: string,
  subunitTwoCopy: string,
  subunitTwoResidue: string,
  subunitPTMType: string
): ValidatorFn {
  return (formGroup: FormGroup): ValidationErrors | null => {
    // Check the individual validity of the low-level form controls.
    // If any invalidity or incompleteness, don't do any further
    // higher-level validation.
    let controlName = subunitOne;
    let control = formGroup.controls[controlName];
    if (!control || control.value === '' || control.invalid) {
      return null;
    }

    controlName = subunitOneCopy;
    control = formGroup.controls[controlName];
    if (!control || control.value === '' || control.invalid) {
      return null;
    }

    controlName = subunitOneResidue;
    control = formGroup.controls[controlName];
    if (!control || control.value === '' || control.invalid) {
      return null;
    }

    controlName = subunitTwo;
    control = formGroup.controls[controlName];
    if (!control || control.value === '' || control.invalid) {
      return null;
    }

    controlName = subunitTwoCopy;
    control = formGroup.controls[controlName];
    if (!control || control.value === '' || control.invalid) {
      return null;
    }

    controlName = subunitTwoResidue;
    control = formGroup.controls[controlName];
    if (!control || control.value === '' || control.invalid) {
      return null;
    }

    controlName = subunitPTMType;
    control = formGroup.controls[controlName];
    if (!control || control.value === '' || control.invalid) {
      return null;
    }

    // All low-level controls are valid.
    // So begin cross-field validations.

    const errors: ValidationErrors = {};

    const subunitOneId = formGroup.value[subunitOne];
    const subunitOneAASequence = subunits.filter(subunit => subunit.subunit_id === +subunitOneId)[0].amino_acid_sequence;
    const subunitOneResidueIndex = +formGroup.value[subunitOneResidue] - 1;

    if (subunitOneAASequence.toUpperCase().charAt(subunitOneResidueIndex) !== 'C') {
      errors.residueOneCysteine = true;
    }

    const subunitTwoId = formGroup.value[subunitTwo];
    const subunitTwoAASequence = subunits.filter(subunit => subunit.subunit_id === +subunitTwoId)[0].amino_acid_sequence;
    const subunitTwoResidueIndex = +formGroup.value[subunitTwoResidue] - 1;

    if (subunitTwoAASequence.toUpperCase().charAt(subunitTwoResidueIndex) !== 'C') {
      errors.residueTwoCysteine = true;
    }

    if (Object.keys(errors).length) {
      return errors;
    }

    // Binding locations are valid.
    // So do final top-most-level check: distinct binding locations.

    if ( (formGroup.value[subunitOne] === formGroup.value[subunitTwo]) &&
         (formGroup.value[subunitOneCopy] === formGroup.value[subunitTwoCopy]) &&
         (formGroup.value[subunitOneResidue] === formGroup.value[subunitTwoResidue])
    ) {
      errors.distinctBondPoints = true;
      return errors;
    }

    return null;
  };
}
