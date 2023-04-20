import { Component } from '@angular/core';

import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from 'src/app/model/Employee';
import { DataService } from 'src/app/service/data.service';
import { HttpService } from 'src/app/service/http.service';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent {

  employeeForm!: FormGroup;
  public employee: Employee = new Employee();
  empId: number = this.activatedRoute.snapshot.params['id'];

  departments: Array<any> = [
    { id: 1, name: "HR", value: "HR", checked: false },
    { id: 2, name: "Sales", value: "Sales", checked: false },
    { id: 3, name: "Finance", value: "Finance", checked: false },
    { id: 4, name: "Engineer", value: "Engineer", checked: false },
    { id: 5, name: "Other", value: "Other", checked: false }
  ]

  constructor(private formBuilder: FormBuilder,
    private _snackBar : MatSnackBar,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService : DataService,
    private httpService : HttpService) {

    this.employeeForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required,
      Validators.maxLength(30),
      Validators.minLength(3)]),
      profilePic: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      department: new FormArray([], Validators.required),
      salary: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
      notes: new FormControl('', Validators.required)
    })
  }

  /**
     * On change event for checkbox. In this we can select multiple checkobox 
     * for department and store is as an array.
     * @param event 
     */
  onCheckboxChange(event: MatCheckboxChange) {
    const department: FormArray = this.employeeForm.get('department') as FormArray;

    if (event.checked) {
      department.push(new FormControl(event.source.value));
      console.log(department);
    } else {
      const index = department.controls.findIndex(x => x.value === event.source.value);
      department.removeAt(index);
    }
  }

  /**
    * To read Salary value from slider
    */
  salary: number = 400000;
  updateSetting(event: any) {
    this.salary = event.value;
  }

  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    return value;
  }

  ngOnInit(): void {
    // Getting all the data of employee for update :-
    if (this.empId != undefined) {
      console.log(this.empId);
      this.dataService.currentEmployee.subscribe(employee => {
          console.log(employee);
          this.employeeForm.get('name')?.setValue(employee.name);
          this.employeeForm.get('profilePic')?.setValue(employee.profilePic);
          this.employeeForm.get('gender')?.setValue(employee.gender);
          this.employeeForm.get('salary')?.setValue(employee.salary);
          // Sometimes We Get Date In Timestamp Millisecond
          // Timestamp In Millisecond(1679900816390) To Convert ISO(2023-03-27T08:32:33.836Z)
          // this.employeeFormGroup.get('startDate')?.setValue(new Date(employee.startDate).toISOString());
          this.employeeForm.get('startDate')?.setValue(employee.startDate);
          this.employeeForm.get('notes')?.setValue(employee.notes);
          const department: FormArray = this.employeeForm.get('department') as FormArray;
          employee.department.forEach(departmentData => {
            for (let index = 0; index < this.departments.length; index++) {
              if (this.departments[index].name === departmentData) {
                this.departments[index].checked = true;
                department.push(new FormControl(this.departments[index].value))
              }
            }
          });
      });
    }
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      // updating employee data by calling http method :-
      this.employee = this.employeeForm.value;
      console.log(this.employee);
      
      if (this.empId != undefined) {
        this.httpService.updateEmployeeData(this.empId, this.employee).subscribe(res => {
          console.log(res);
          this._snackBar.open(res.message, 'OK', {
            duration:5000,
          });
          this.router.navigateByUrl("/home-page");
        });
      } else {
        // adding employee data by calling http method :-
        this.employee = this.employeeForm.value;
        console.log(this.employee);
        this.httpService.addEmployee(this.employee).subscribe(res => {
          console.log(res);
          this._snackBar.open(res.message, 'OK', {
            duration:5000
          });
          this.router.navigateByUrl("/home-page");
        });
      }
    }
  }
}