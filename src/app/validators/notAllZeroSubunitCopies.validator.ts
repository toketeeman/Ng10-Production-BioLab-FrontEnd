import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

import { ISubunit } from '../protein-expression.interface';

export function NotAllZeroSubunitCopies(subunits: ISubunit[]): ValidatorFn {
  return (formGroup: FormGroup): ValidationErrors | null => {
    for (const subunit of subunits) {
      if (formGroup.value[subunit.subunit_name] !== 0) {  // Value of an input type=number is a number, not text!
        return null;
      }
    }

    return {
      notAllZero: true
    };
  };
}
