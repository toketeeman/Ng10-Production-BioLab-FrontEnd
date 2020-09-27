import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';

@Component({
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {
  sequenceForm: FormGroup;          // For entering sequence for translation/properties.


  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.sequenceForm = this.fb.group({
      sequenceType: ['', Validators.required],
      sequence: ['', Validators.required]
    });
  }

  onChangeSequenceType(): void {
    return;
  }
}
